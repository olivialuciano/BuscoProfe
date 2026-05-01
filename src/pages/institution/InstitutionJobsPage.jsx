import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock3,
  FileText,
  Filter,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import EmptyState from "../../components/common/EmptyState";
import SelectField from "../../components/common/SelectField";
import { getInstitutionJobPostings } from "../../api/jobPostingsService";
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
import "./InstitutionJobsPage.css";

const JOB_STATUS_OPTIONS = [
  { value: "1", label: "Activo" },
  { value: "2", label: "Inactivo" },
  { value: "3", label: "Cerrado" },
];

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

function InstitutionJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: "1",
    workMode: "",
    availability: "",
    contractType: "",
    discipline: "",
    professionalType: "",
    isUrgent: "",
  });

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getInstitutionJobPostings(user.id);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar las vacantes."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadJobs();
    }
  }, [user?.id]);

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
      workMode: "",
      availability: "",
      contractType: "",
      discipline: "",
      professionalType: "",
      isUrgent: "",
    });
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
        filters.contractType === ""
          ? true
          : Number(getJobValue(job, "contractType", "ContractType")) ===
            Number(filters.contractType),
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
    <div className="page-shell institution-jobs-page">
      <div className="institution-jobs-page__header">
        <div>
          <h1 className="section-title">Mis vacantes</h1>
          <p className="section-subtitle">
            Gestioná las vacantes publicadas por tu institución.
          </p>
        </div>

        <div className="institution-jobs-page__header-actions">
          <button
            type="button"
            className="institution-jobs-page__filters-toggle"
            onClick={() => setFiltersOpen(true)}
            aria-label="Abrir filtros"
            title="Abrir filtros"
          >
            <Filter size={18} />
          </button>

          <Button
            icon={<Plus size={16} />}
            onClick={() => navigate("/institution/jobs/new")}
          >
            Nueva vacante
          </Button>
        </div>
      </div>

      <ApiMessage type="error">{error}</ApiMessage>

      {filteredJobs.length ? (
        <div className="institution-jobs-page__grid">
          {filteredJobs.map((job) => {
            const jobId = getJobValue(job, "id", "Id");
            const jobStatus = getJobValue(job, "status", "Status");

            return (
              <div
                key={jobId}
                className="institution-jobs-page__job-card-wrapper"
                onClick={() => navigate(`/jobs/${jobId}`)}
              >
                <Card className="institution-jobs-page__job-card">
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

                  <h3>{job.title || job.Title}</h3>

                  <div className="institution-jobs-page__meta">
                    <span>
                      <MapPin size={14} />
                      {[job.city, job.province, job.country]
                        .filter(Boolean)
                        .join(", ") || "Ubicación no informada"}
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
          title="No hay vacantes para los filtros seleccionados"
          description="Probá cambiando los filtros."
        />
      )}

      <div
        className={`institution-jobs-page__filters-overlay ${
          filtersOpen ? "institution-jobs-page__filters-overlay--open" : ""
        }`}
        onClick={() => setFiltersOpen(false)}
      />

      <aside
        className={`institution-jobs-page__filters-panel ${
          filtersOpen ? "institution-jobs-page__filters-panel--open" : ""
        }`}
      >
        <div className="institution-jobs-page__filters-panel-header">
          <div className="institution-jobs-page__filters-panel-title">
            <Filter size={18} />
            <h2>Filtros</h2>
          </div>

          <button
            type="button"
            className="institution-jobs-page__filters-close"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
            title="Cerrar filtros"
          >
            <X size={18} />
          </button>
        </div>

        <div className="institution-jobs-page__filters-panel-body">
          <SelectField
            label="Estado"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={JOB_STATUS_OPTIONS}
          />

          <SelectField
            label="Urgencia"
            name="isUrgent"
            value={filters.isUrgent}
            onChange={handleFilterChange}
            options={urgentFilterOptions}
          />

          <SelectField
            label="Tipo de profesional"
            name="professionalType"
            value={filters.professionalType}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "Todos" },
              ...professionalTypeOptions,
            ]}
          />

          <SelectField
            label="Disciplina"
            name="discipline"
            value={filters.discipline}
            onChange={handleFilterChange}
            options={[{ value: "", label: "Todas" }, ...disciplineOptions]}
          />

          <SelectField
            label="Modalidad"
            name="workMode"
            value={filters.workMode}
            onChange={handleFilterChange}
            options={[{ value: "", label: "Todas" }, ...workModeOptions]}
          />

          <SelectField
            label="Disponibilidad"
            name="availability"
            value={filters.availability}
            onChange={handleFilterChange}
            options={[{ value: "", label: "Todas" }, ...availabilityOptions]}
          />

          <SelectField
            label="Tipo de contrato"
            name="contractType"
            value={filters.contractType}
            onChange={handleFilterChange}
            options={[{ value: "", label: "Todos" }, ...contractTypeOptions]}
          />
        </div>

        <div className="institution-jobs-page__filters-panel-actions">
          <Button variant="secondary" onClick={clearFilters}>
            Limpiar
          </Button>
          <Button onClick={() => setFiltersOpen(false)}>Aplicar</Button>
        </div>
      </aside>
    </div>
  );
}

export default InstitutionJobsPage;
