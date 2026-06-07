import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock3,
  MapPin,
  FileText,
  Filter,
  X,
  Bookmark,
} from "lucide-react";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import EmptyState from "../../components/common/EmptyState";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import { getPublicJobPostings } from "../../api/jobPostingsService";
import { getProfessorApplications } from "../../api/applicationsService";
import {
  getFavoriteJobPostingsByProfessor,
  createFavoriteJobPosting,
  deleteFavoriteJobPostingByProfessorAndJobPosting,
} from "../../api/favoriteJobPostingsService";
import { getAllInstitutions } from "../../api/usersService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { isAdmin, isInstitution } from "../../utils/roleUtils";
import { getApiErrorMessage } from "../../utils/errorUtils";
import {
  availabilityOptions,
  workModeOptions,
  contractTypeOptions,
} from "../../utils/enumOptions";
import {
  disciplineOptions,
  professionalTypeOptions,
  urgentFilterOptions,
  getEnumLabel,
  getJobValue,
  isJobUrgent,
  sortUrgentJobsFirst,
} from "../../utils/jobPostingOptions";
import "./JobsPage.css";

const JOB_STATUS_OPTIONS = [
  { value: "1", label: "Activo" },
  { value: "2", label: "Inactivo" },
  { value: "3", label: "Cerrado" },
];

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

function getJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

function getStoredToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken")
  );
}

function getLoggedUserId(user) {
  const token = getStoredToken();
  const payload = token ? getJwtPayload(token) : null;

  return (
    user?.id ||
    user?.Id ||
    user?.userId ||
    user?.UserId ||
    user?.nameIdentifier ||
    user?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    payload?.id ||
    payload?.Id ||
    payload?.userId ||
    payload?.UserId ||
    payload?.nameid ||
    payload?.sub ||
    payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ]
  );
}

function getInstitutionName(institution) {
  return (
    institution?.tradeName ||
    institution?.TradeName ||
    institution?.legalName ||
    institution?.LegalName ||
    institution?.email ||
    institution?.Email ||
    "Institución sin nombre"
  );
}

function favoriteMatchesJob(item, jobId) {
  return (
    Number(item?.jobPostingId) === Number(jobId) ||
    Number(item?.JobPostingId) === Number(jobId) ||
    Number(item?.jobPosting?.id) === Number(jobId) ||
    Number(item?.JobPosting?.Id) === Number(jobId)
  );
}

function JobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [favoriteJobPostingIds, setFavoriteJobPostingIds] = useState(
    () => new Set(),
  );
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState(() => new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: "1",
    institutionUserId: "",
    workMode: "",
    availability: "",
    contractType: "",
    discipline: "",
    professionalType: "",
    isUrgent: "",
  });

  const isProfessorUser = user && !isAdmin(user) && !isInstitution(user);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError("");

      try {
        const [jobsData, institutionsData] = await Promise.all([
          getPublicJobPostings(),
          getAllInstitutions(),
        ]);

        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setInstitutions(
          Array.isArray(institutionsData) ? institutionsData : [],
        );
      } catch (err) {
        setError(
          getApiErrorMessage(err, "No se pudieron cargar las vacantes."),
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadProfessorData = async () => {
      if (!isProfessorUser) {
        setApplications([]);
        setFavoriteJobPostingIds(new Set());
        return;
      }

      const professorUserId = getLoggedUserId(user);

      if (!professorUserId) {
        setApplications([]);
        setFavoriteJobPostingIds(new Set());
        return;
      }

      try {
        const [applicationsData, favoritesData] = await Promise.all([
          getProfessorApplications(professorUserId),
          getFavoriteJobPostingsByProfessor(professorUserId),
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
      } catch (err) {
        console.error(
          "No se pudieron cargar postulaciones o favoritos del profesor.",
          err,
        );

        setApplications([]);
        setFavoriteJobPostingIds(new Set());
      }
    };

    loadProfessorData();
  }, [isProfessorUser, user]);

  const institutionOptions = useMemo(() => {
    return institutions
      .map((institution) => {
        const institutionId = institution?.id || institution?.Id;

        return {
          value: String(institutionId),
          label: getInstitutionName(institution),
        };
      })
      .filter((option) => option.value && option.value !== "undefined")
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [institutions]);

  const appliedJobPostingIds = useMemo(() => {
    return new Set(
      applications
        .map((application) =>
          Number(
            application.jobPostingId ||
              application.JobPostingId ||
              application.jobPosting?.id ||
              application.JobPosting?.Id,
          ),
        )
        .filter(Boolean),
    );
  }, [applications]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "1",
      institutionUserId: "",
      workMode: "",
      availability: "",
      contractType: "",
      discipline: "",
      professionalType: "",
      isUrgent: "",
    });
  };

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

    if (!isProfessorUser || !user || !jobId) return;

    const professorUserId = getLoggedUserId(user);

    if (!professorUserId) {
      showToast("No se pudo identificar el usuario logueado.", "error");
      return;
    }

    const numericJobId = Number(jobId);

    if (favoriteLoadingIds.has(numericJobId)) return;

    const isFavorite = favoriteJobPostingIds.has(numericJobId);

    try {
      setFavoriteLoadingForJob(numericJobId, true);

      if (isFavorite) {
        await deleteFavoriteJobPostingByProfessorAndJobPosting(
          professorUserId,
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
        professorUserId: Number(professorUserId),
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

  const filteredJobs = useMemo(() => {
    const result = jobs
      .filter((job) => Number(getJobValue(job, "status", "Status")) !== 4)
      .filter((job) =>
        filters.status === ""
          ? true
          : Number(getJobValue(job, "status", "Status")) ===
            Number(filters.status),
      )
      .filter((job) =>
        filters.institutionUserId === ""
          ? true
          : Number(
              getJobValue(job, "institutionUserId", "InstitutionUserId"),
            ) === Number(filters.institutionUserId),
      )
      .filter((job) =>
        filters.workMode === ""
          ? true
          : Number(getJobValue(job, "workMode", "WorkMode")) ===
            Number(filters.workMode),
      )
      .filter((job) =>
        filters.availability === ""
          ? true
          : Number(getJobValue(job, "availability", "Availability")) ===
            Number(filters.availability),
      )

      .filter((job) =>
        filters.discipline === ""
          ? true
          : Number(getJobValue(job, "discipline", "Discipline")) ===
            Number(filters.discipline),
      )
      .filter((job) =>
        filters.professionalType === ""
          ? true
          : Number(getJobValue(job, "professionalType", "ProfessionalType")) ===
            Number(filters.professionalType),
      )
      .filter((job) =>
        filters.isUrgent === ""
          ? true
          : isJobUrgent(job) === (filters.isUrgent === "true"),
      );

    return sortUrgentJobsFirst(result);
  }, [jobs, filters]);

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingSpinner text="Cargando vacantes..." />
      </div>
    );
  }

  return (
    <div className="page-shell jobs-page">
      <div className="jobs-page__header">
        <div>
          <h1 className="section-title">Vacantes</h1>
          <p className="section-subtitle">
            Explorá oportunidades laborales publicadas por instituciones.
          </p>
        </div>

        <button
          type="button"
          className="jobs-page__filters-toggle"
          onClick={() => setFiltersOpen(true)}
          aria-label="Abrir filtros"
          title="Abrir filtros"
        >
          <Filter size={18} />
        </button>
      </div>

      <ApiMessage type="error">{error}</ApiMessage>

      {filteredJobs.length ? (
        <div className="jobs-page__grid">
          {filteredJobs.map((job) => {
            const jobId = getJobValue(job, "id", "Id");
            const jobStatus = getJobValue(job, "status", "Status");
            const alreadyApplied =
              isProfessorUser && appliedJobPostingIds.has(Number(jobId));
            const isFavoriteJob =
              isProfessorUser && favoriteJobPostingIds.has(Number(jobId));
            const isFavoriteLoading = favoriteLoadingIds.has(Number(jobId));

            return (
              <div
                key={jobId}
                className="jobs-page__job-card-wrapper"
                onClick={() => navigate(`/jobs/${jobId}`)}
              >
                <Card className="jobs-page__job-card">
                  <div className="jobs-page__card-top">
                    <div className="jobs-page__badges">
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
                        className={`jobs-page__save-button ${
                          isFavoriteJob ? "jobs-page__save-button--active" : ""
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

                  <h3>{job.title || job.Title}</h3>

                  <div className="jobs-page__meta">
                    <span>
                      <MapPin size={14} />
                      {[job.city, job.province, job.country]
                        .filter(Boolean)
                        .join(", ") || "Ubicación no informada"}
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
          title="No hay vacantes para los filtros seleccionados"
          description="Probá cambiando los filtros."
        />
      )}

      <div
        className={`jobs-page__filters-overlay ${
          filtersOpen ? "jobs-page__filters-overlay--open" : ""
        }`}
        onClick={() => setFiltersOpen(false)}
      />

      <aside
        className={`jobs-page__filters-panel ${
          filtersOpen ? "jobs-page__filters-panel--open" : ""
        }`}
      >
        <div className="jobs-page__filters-panel-header">
          <div className="jobs-page__filters-panel-title">
            <Filter size={18} />
            <h2>Filtros</h2>
          </div>

          <button
            type="button"
            className="jobs-page__filters-close"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
            title="Cerrar filtros"
          >
            <X size={18} />
          </button>
        </div>
        <div className="jobs-page__filters-panel-body">
          <SelectField
            label="Tipo de profesional"
            name="professionalType"
            value={filters.professionalType}
            onChange={handleFilterChange}
            options={[...professionalTypeOptions]}
          />

          <SelectField
            label="Institución"
            name="institutionUserId"
            value={filters.institutionUserId}
            onChange={handleFilterChange}
            options={[...institutionOptions]}
          />

          <SelectField
            label="Disciplina"
            name="discipline"
            value={filters.discipline}
            onChange={handleFilterChange}
            options={[...disciplineOptions]}
          />

          <SelectField
            label="Urgencia"
            name="isUrgent"
            value={filters.isUrgent}
            onChange={handleFilterChange}
            options={urgentFilterOptions}
          />
          <SelectField
            label="Estado"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={JOB_STATUS_OPTIONS}
          />
        </div>

        <div className="jobs-page__filters-panel-actions">
          <Button variant="secondary" onClick={clearFilters}>
            Limpiar
          </Button>
          <Button onClick={() => setFiltersOpen(false)}>Aplicar</Button>
        </div>
      </aside>
    </div>
  );
}

export default JobsPage;
