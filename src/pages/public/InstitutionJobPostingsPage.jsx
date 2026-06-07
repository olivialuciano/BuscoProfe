import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bookmark, FileText, MapPin } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getAllInstitutions } from "../../api/usersService";
import { getAllJobPostings } from "../../api/jobPostingsService";
import { getProfessorApplications } from "../../api/applicationsService";
import {
  getFavoriteJobPostingsByProfessor,
  createFavoriteJobPosting,
  deleteFavoriteJobPostingByProfessorAndJobPosting,
} from "../../api/favoriteJobPostingsService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import { isAdmin, isInstitution } from "../../utils/roleUtils";
import { contractTypeOptions } from "../../utils/enumOptions";
import {
  getEnumLabel,
  getJobValue,
  isJobUrgent,
  sortUrgentJobsFirst,
} from "../../utils/jobPostingOptions";
import "./InstitutionJobPostingsPage.css";

function getStatusBadgeClass(status) {
  switch (Number(status)) {
    case 1:
      return "soft-badge soft-badge--info";
    case 2:
      return "soft-badge soft-badge--danger";
    case 3:
      return "soft-badge soft-badge--neutral";
    default:
      return "soft-badge soft-badge--neutral";
  }
}

function getUiStatusLabel(status) {
  switch (Number(status)) {
    case 1:
      return "Activa";
    case 2:
      return "Inactiva";
    case 3:
      return "Cerrada";
    default:
      return "Borrador";
  }
}

function InstitutionJobPostingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [institution, setInstitution] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [favoriteJobPostingIds, setFavoriteJobPostingIds] = useState(
    () => new Set(),
  );
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isProfessorUser = user && !isAdmin(user) && !isInstitution(user);

  const applicationsByJobPostingId = useMemo(() => {
    const map = new Map();

    applications.forEach((application) => {
      const jobPostingId = Number(
        application.jobPostingId ||
          application.JobPostingId ||
          application.jobPosting?.id ||
          application.JobPosting?.Id,
      );

      if (jobPostingId) {
        map.set(jobPostingId, application);
      }
    });

    return map;
  }, [applications]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [institutionsData, jobPostingsData] = await Promise.all([
        getAllInstitutions(),
        getAllJobPostings(),
      ]);

      const institutions = Array.isArray(institutionsData)
        ? institutionsData
        : [];
      const jobs = Array.isArray(jobPostingsData) ? jobPostingsData : [];

      const foundInstitution = institutions.find(
        (item) => Number(item.id || item.Id) === Number(id),
      );

      if (!foundInstitution) {
        setError("No se encontró la institución.");
        return;
      }

      const filteredJobs = jobs.filter(
        (job) =>
          Number(getJobValue(job, "institutionUserId", "InstitutionUserId")) ===
            Number(id) && Number(getJobValue(job, "status", "Status")) !== 4,
      );

      setInstitution(foundInstitution);
      setJobPostings(sortUrgentJobsFirst(filteredJobs));

      if (isProfessorUser && user?.id) {
        const [applicationsData, favoritesData] = await Promise.all([
          getProfessorApplications(user.id),
          getFavoriteJobPostingsByProfessor(user.id),
        ]);

        const applicationsList = Array.isArray(applicationsData)
          ? applicationsData
          : [];

        const favoritesList = Array.isArray(favoritesData) ? favoritesData : [];

        setApplications(applicationsList);

        setFavoriteJobPostingIds(
          new Set(
            favoritesList
              .map((favorite) =>
                Number(
                  favorite.jobPostingId ||
                    favorite.JobPostingId ||
                    favorite.jobPosting?.id ||
                    favorite.JobPosting?.Id,
                ),
              )
              .filter(Boolean),
          ),
        );
      } else {
        setApplications([]);
        setFavoriteJobPostingIds(new Set());
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron cargar las vacantes de la institución.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user?.id]);

  const institutionName = useMemo(() => {
    return (
      institution?.tradeName ||
      institution?.TradeName ||
      institution?.legalName ||
      institution?.LegalName ||
      "Institución"
    );
  }, [institution]);

  const setFavoriteLoadingForJob = (jobId, isLoading) => {
    setFavoriteLoadingIds((current) => {
      const next = new Set(current);

      if (isLoading) {
        next.add(Number(jobId));
      } else {
        next.delete(Number(jobId));
      }

      return next;
    });
  };

  const handleToggleFavoriteJob = async (event, jobId) => {
    event.stopPropagation();

    if (!isProfessorUser || !user?.id || !jobId) return;

    const numericJobId = Number(jobId);

    if (favoriteLoadingIds.has(numericJobId)) return;

    const isFavorite = favoriteJobPostingIds.has(numericJobId);

    try {
      setFavoriteLoadingForJob(numericJobId, true);

      if (isFavorite) {
        await deleteFavoriteJobPostingByProfessorAndJobPosting(
          user.id,
          numericJobId,
        );

        setFavoriteJobPostingIds((current) => {
          const next = new Set(current);
          next.delete(numericJobId);
          return next;
        });

        return;
      }

      await createFavoriteJobPosting({
        professorUserId: Number(user.id),
        jobPostingId: numericJobId,
      });

      setFavoriteJobPostingIds((current) => {
        const next = new Set(current);
        next.add(numericJobId);
        return next;
      });
    } catch (err) {
      const backendMessage = getApiErrorMessage(
        err,
        "No se pudo actualizar el guardado de la vacante.",
      );

      if (
        backendMessage.toLowerCase().includes("ya está en favoritos") ||
        backendMessage.toLowerCase().includes("ya esta en favoritos")
      ) {
        setFavoriteJobPostingIds((current) => {
          const next = new Set(current);
          next.add(numericJobId);
          return next;
        });
      } else {
        showToast(backendMessage, "error");
      }
    } finally {
      setFavoriteLoadingForJob(numericJobId, false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell institution-job-postings-page">
        <LoadingSpinner text="Cargando vacantes..." />
      </div>
    );
  }

  return (
    <div className="page-shell institution-job-postings-page">
      <header className="institution-job-postings-page__header">
        <h1 className="section-title">Vacantes de {institutionName}</h1>
        <p className="section-subtitle">
          Todas las vacantes visibles de esta institución.
        </p>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {jobPostings.length ? (
        <div className="institution-job-postings-page__grid">
          {jobPostings.map((job) => {
            const jobId = getJobValue(job, "id", "Id");
            const jobStatus = getJobValue(job, "status", "Status");
            const application = applicationsByJobPostingId.get(Number(jobId));
            const alreadyApplied = Boolean(application);
            const isFavoriteJob =
              isProfessorUser && favoriteJobPostingIds.has(Number(jobId));
            const isFavoriteLoading = favoriteLoadingIds.has(Number(jobId));

            const locationText =
              [job.city, job.province, job.country]
                .filter(Boolean)
                .join(", ") || "Ubicación no informada";

            return (
              <div
                key={jobId}
                className="institution-job-postings-page__card-wrapper"
                onClick={() => navigate(`/jobs/${jobId}`)}
              >
                <Card className="institution-job-postings-page__card">
                  <div className="institution-job-postings-page__card-top">
                    <div className="institution-jobs-page__badges">
                      <span className={getStatusBadgeClass(jobStatus)}>
                        {getUiStatusLabel(jobStatus)}
                      </span>

                      {isJobUrgent(job) && (
                        <span className="soft-badge soft-badge--urgent">
                          Urgente
                        </span>
                      )}

                      {alreadyApplied && (
                        <span className="soft-badge soft-badge--success">
                          Ya te postulaste
                        </span>
                      )}
                    </div>

                    {isProfessorUser ? (
                      <button
                        type="button"
                        className={`institution-job-postings-page__save-button ${
                          isFavoriteJob
                            ? "institution-job-postings-page__save-button--active"
                            : ""
                        }`}
                        onClick={(event) =>
                          handleToggleFavoriteJob(event, jobId)
                        }
                        aria-label={
                          isFavoriteJob
                            ? "Quitar de guardados"
                            : "Guardar vacante"
                        }
                        title={
                          isFavoriteJob
                            ? "Quitar de guardados"
                            : "Guardar vacante"
                        }
                        disabled={isFavoriteLoading}
                      >
                        <Bookmark
                          size={18}
                          fill={isFavoriteJob ? "currentColor" : "none"}
                        />
                      </button>
                    ) : null}
                  </div>

                  <h3>{job.title || job.Title || "Vacante sin título"}</h3>

                  <div className="institution-job-postings-page__meta">
                    <span>
                      <MapPin size={14} />
                      {locationText}
                    </span>

                    <span>
                      <FileText size={14} />
                      {getEnumLabel(
                        contractTypeOptions,
                        getJobValue(job, "contractType", "ContractType"),
                      )}
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Esta institución no tiene vacantes visibles"
          description="Todavía no hay vacantes publicadas para mostrar."
        />
      )}
    </div>
  );
}

export default InstitutionJobPostingsPage;
