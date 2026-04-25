import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { getAllInstitutions } from "../../api/usersService";
import { getAllJobPostings } from "../../api/jobPostingsService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import {
  availabilityOptions,
  workModeOptions,
  contractTypeOptions,
} from "../../utils/enumOptions";
import "./InstitutionJobPostingsPage.css";

function getEnumLabel(options, value) {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }

  return (
    options.find((option) => Number(option.value) === Number(value))?.label ||
    "No especificado"
  );
}

function InstitutionJobPostingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async (isReload = false) => {
    if (isReload) {
      setReloading(true);
    } else {
      setLoading(true);
    }

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
        (item) => Number(item.id) === Number(id),
      );

      if (!foundInstitution) {
        setError("No se encontró la institución.");
        return;
      }

      const filteredJobs = jobs.filter(
        (job) =>
          Number(job.institutionUserId) === Number(id) &&
          Number(job.status) !== 4,
      );

      setInstitution(foundInstitution);
      setJobPostings(filteredJobs);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron cargar las vacantes de la institución.",
        ),
      );
    } finally {
      if (isReload) {
        setReloading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const institutionName = useMemo(() => {
    return institution?.tradeName || institution?.legalName || "Institución";
  }, [institution]);

  if (loading) {
    return (
      <div className="page-shell institution-job-postings-page">
        <LoadingSpinner text="Cargando vacantes..." />
      </div>
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
            const locationText =
              [job.city, job.province, job.country]
                .filter(Boolean)
                .join(", ") || "Ubicación no informada";

            return (
              <div
                key={job.id}
                className="institution-job-postings-page__card-wrapper"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <Card className="institution-job-postings-page__card">
                  <div className="institution-jobs-page__badges">
                    <span className={getStatusBadgeClass(job.status)}>
                      {getUiStatusLabel(job.status)}
                    </span>
                  </div>
                  <h3>{job.title || "Vacante sin título"}</h3>
                  <p>{job.description || "Sin descripción."}</p>

                  <div className="institution-job-postings-page__meta">
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
          title="Esta institución no tiene vacantes visibles"
          description="Todavía no hay vacantes publicadas para mostrar."
        />
      )}
    </div>
  );
}

export default InstitutionJobPostingsPage;
