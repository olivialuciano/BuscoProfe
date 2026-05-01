import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Clock3, MapPin, FileText } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFavoriteJobPostingsByProfessor } from "../../api/favoriteJobPostingsService";
import { getProfessorApplications } from "../../api/applicationsService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import { isAdmin, isInstitution } from "../../utils/roleUtils";

import {
  availabilityOptions,
  workModeOptions,
  contractTypeOptions,
} from "../../utils/enumOptions";

import "./SavedJobPostingsPage.css";

function getEnumLabel(options, value) {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }

  return (
    options.find((option) => Number(option.value) === Number(value))?.label ||
    "No especificado"
  );
}

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

function SavedJobPostingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedJobPostings, setSavedJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
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

  const loadSavedJobPostings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const favoritesData = await getFavoriteJobPostingsByProfessor(user.id);
      const favorites = Array.isArray(favoritesData) ? favoritesData : [];

      const jobs = favorites
        .map((item) => item?.jobPosting || item?.JobPosting || null)
        .filter(Boolean);

      setSavedJobPostings(jobs);

      if (isProfessorUser) {
        const applicationsData = await getProfessorApplications(user.id);
        setApplications(
          Array.isArray(applicationsData) ? applicationsData : [],
        );
      } else {
        setApplications([]);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron cargar las vacantes guardadas.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobPostings();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="page-shell saved-job-postings-page">
        <LoadingSpinner text="Cargando vacantes guardadas..." />
      </div>
    );
  }

  return (
    <div className="page-shell saved-job-postings-page">
      <header className="saved-job-postings-page__header">
        <div>
          <h1 className="section-title">Vacantes guardadas</h1>
          <p className="section-subtitle">
            Acá vas a ver todas las vacantes que marcaste para revisar después.
          </p>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {savedJobPostings.length ? (
        <div className="saved-job-postings-page__grid">
          {savedJobPostings.map((job) => {
            const locationText =
              [job.city, job.province, job.country]
                .filter(Boolean)
                .join(", ") || "Ubicación no informada";

            const application = applicationsByJobPostingId.get(Number(job.id));
            const alreadyApplied = Boolean(application);

            return (
              <div
                key={job.id}
                className="saved-job-postings-page__card-wrapper"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <Card className="saved-job-postings-page__card">
                  <div className="saved-job-postings-page__badges">
                    <span className={getStatusBadgeClass(job.status)}>
                      {getUiStatusLabel(job.status)}
                    </span>

                    {alreadyApplied && (
                      <>
                        <span className="soft-badge soft-badge--success">
                          Ya te postulaste
                        </span>
                      </>
                    )}
                  </div>

                  <h3>{job.title || "Vacante sin título"}</h3>

                  <div className="saved-job-postings-page__meta">
                    <span>
                      <MapPin size={14} />
                      {locationText}
                    </span>

                    <span>
                      <Briefcase size={14} />
                      {getEnumLabel(workModeOptions, job.workMode)}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      {getEnumLabel(availabilityOptions, job.availability)}
                    </span>

                    <span>
                      <FileText size={14} />
                      {getEnumLabel(contractTypeOptions, job.contractType)}
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Todavía no guardaste vacantes"
          description="Cuando guardes una vacante, va a aparecer acá."
        />
      )}
    </div>
  );
}

export default SavedJobPostingsPage;
