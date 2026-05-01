import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase, Clock3, FileText, MapPin } from "lucide-react";
import { getAllInstitutions } from "../../api/usersService";
import { getAllJobPostings } from "../../api/jobPostingsService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import {
  availabilityOptions,
  workModeOptions,
  contractTypeOptions,
} from "../../utils/enumOptions";
import {
  disciplineOptions,
  professionalTypeOptions,
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

  const [institution, setInstitution] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [id]);

  const institutionName = useMemo(() => {
    return (
      institution?.tradeName ||
      institution?.TradeName ||
      institution?.legalName ||
      institution?.LegalName ||
      "Institución"
    );
  }, [institution]);

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
                  <div className="institution-jobs-page__badges">
                    <span className={getStatusBadgeClass(jobStatus)}>
                      {getUiStatusLabel(jobStatus)}
                    </span>

                    {isJobUrgent(job) && (
                      <span className="soft-badge soft-badge--urgent">
                        Urgente
                      </span>
                    )}
                  </div>

                  <h3>{job.title || job.Title || "Vacante sin título"}</h3>
                  <p>
                    {job.description || job.Description || "Sin descripción."}
                  </p>

                  <div className="institution-job-postings-page__meta">
                    <span>
                      <MapPin size={14} />
                      {locationText}
                    </span>

                    <span>
                      <Briefcase size={14} />
                      {getEnumLabel(
                        workModeOptions,
                        getJobValue(job, "workMode", "WorkMode"),
                      )}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      {getEnumLabel(
                        availabilityOptions,
                        getJobValue(job, "availability", "Availability"),
                      )}
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
