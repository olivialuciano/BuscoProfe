import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  UserRound,
  BriefcaseBusiness,
  ChevronDown,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getInstitutionJobPostings } from "../../api/jobPostingsService";
import { getApplicationsByJobPosting } from "../../api/applicationsService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./InstitutionApplicationsPage.css";

function getApplicationStatusLabel(status) {
  switch (Number(status)) {
    case 0:
      return "Aplicado";
    case 1:
      return "En revisión";
    case 2:
      return "Rechazado";
    case 3:
      return "Aceptado";
    case 4:
      return "Retirado";
    default:
      return "No especificado";
  }
}

function getApplicationStatusClass(status) {
  switch (Number(status)) {
    case 0:
      return "institution-applications-page__badge institution-applications-page__badge--pending";
    case 1:
      return "institution-applications-page__badge institution-applications-page__badge--review";
    case 2:
      return "institution-applications-page__badge institution-applications-page__badge--rejected";
    case 3:
      return "institution-applications-page__badge institution-applications-page__badge--accepted";
    case 4:
      return "institution-applications-page__badge institution-applications-page__badge--withdrawn";
    default:
      return "institution-applications-page__badge institution-applications-page__badge--neutral";
  }
}

function formatDate(value) {
  if (!value) return "Fecha no informada";

  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getValue(source, camelCaseName, pascalCaseName) {
  return source?.[camelCaseName] ?? source?.[pascalCaseName];
}

function getProfessorName(application) {
  const firstName =
    application?.professorFirstName ||
    application?.ProfessorFirstName ||
    application?.professor?.firstName ||
    application?.Professor?.FirstName ||
    "";

  const lastName =
    application?.professorLastName ||
    application?.ProfessorLastName ||
    application?.professor?.lastName ||
    application?.Professor?.LastName ||
    "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Profesor sin nombre";
}

function getProfessorId(application) {
  return (
    application?.professorUserId ||
    application?.ProfessorUserId ||
    application?.professor?.id ||
    application?.Professor?.Id
  );
}

function getApplicationId(application) {
  return application?.id || application?.Id;
}

function getJobId(job) {
  return getValue(job, "id", "Id");
}

function getJobTitle(job) {
  return getValue(job, "title", "Title") || "Vacante sin título";
}

function InstitutionApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalApplications = useMemo(() => {
    return groups.reduce(
      (total, group) => total + group.applications.length,
      0,
    );
  }, [groups]);

  useEffect(() => {
    const loadApplicationsByJobPosting = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const jobsData = await getInstitutionJobPostings(user.id);
        const jobs = Array.isArray(jobsData) ? jobsData : [];

        const visibleJobs = jobs.filter(
          (job) => Number(getValue(job, "status", "Status")) !== 4,
        );

        const groupedData = await Promise.all(
          visibleJobs.map(async (job) => {
            const jobId = getJobId(job);

            try {
              const applicationsData = await getApplicationsByJobPosting(jobId);
              const applications = Array.isArray(applicationsData)
                ? applicationsData
                : [];

              const sortedApplications = [...applications].sort((a, b) => {
                const aDate = new Date(
                  getValue(a, "appliedAt", "AppliedAt") || 0,
                );
                const bDate = new Date(
                  getValue(b, "appliedAt", "AppliedAt") || 0,
                );

                return bDate - aDate;
              });

              return {
                job,
                applications: sortedApplications,
              };
            } catch {
              return {
                job,
                applications: [],
              };
            }
          }),
        );

        const onlyJobsWithApplications = groupedData
          .filter((group) => group.applications.length > 0)
          .sort((a, b) => {
            const aDate = new Date(
              getValue(a.job, "publishedAt", "PublishedAt") ||
                getValue(a.job, "createdAt", "CreatedAt") ||
                0,
            );

            const bDate = new Date(
              getValue(b.job, "publishedAt", "PublishedAt") ||
                getValue(b.job, "createdAt", "CreatedAt") ||
                0,
            );

            return bDate - aDate;
          });

        setGroups(onlyJobsWithApplications);

        setExpandedJobs((current) => {
          const nextState = {};

          onlyJobsWithApplications.forEach((group) => {
            const jobId = getJobId(group.job);
            nextState[jobId] = current[jobId] ?? false;
          });

          return nextState;
        });
      } catch (err) {
        setError(
          getApiErrorMessage(err, "No se pudieron cargar las postulaciones."),
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplicationsByJobPosting();
  }, [user?.id]);

  const toggleJob = (jobId) => {
    setExpandedJobs((current) => ({
      ...current,
      [jobId]: !current[jobId],
    }));
  };

  if (loading) {
    return (
      <div className="page-shell institution-applications-page">
        <LoadingSpinner text="Cargando postulaciones..." />
      </div>
    );
  }

  return (
    <div className="page-shell institution-applications-page">
      <header className="institution-applications-page__header">
        <div>
          <h1 className="section-title">Postulaciones</h1>
          <p className="section-subtitle">
            Revisá todas las postulaciones recibidas, organizadas por vacante.
          </p>
        </div>

        <div className="institution-applications-page__summary">
          <BriefcaseBusiness size={18} />
          <span>{totalApplications} postulaciones</span>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {groups.length ? (
        <div className="institution-applications-page__groups">
          {groups.map((group) => {
            const job = group.job;
            const jobId = getJobId(job);
            const jobTitle = getJobTitle(job);
            const applicationsCount = group.applications.length;
            const isExpanded = Boolean(expandedJobs[jobId]);

            return (
              <section
                key={jobId}
                className={`institution-applications-page__group ${
                  isExpanded ? "institution-applications-page__group--open" : ""
                }`}
              >
                <div className="institution-applications-page__job-row">
                  <button
                    type="button"
                    className="institution-applications-page__job-title"
                    onClick={() => navigate(`/jobs/${jobId}`)}
                    title="Ver detalle de la vacante"
                  >
                    <BriefcaseBusiness size={16} />
                    <span>{jobTitle}</span>
                  </button>

                  <div className="institution-applications-page__job-actions">
                    <span className="institution-applications-page__job-count">
                      <UsersRound size={15} />
                      {applicationsCount} {applicationsCount === 1}
                    </span>

                    <button
                      type="button"
                      className={`institution-applications-page__job-toggle ${
                        isExpanded
                          ? "institution-applications-page__job-toggle--open"
                          : ""
                      }`}
                      onClick={() => toggleJob(jobId)}
                      aria-expanded={isExpanded}
                      title={
                        isExpanded
                          ? "Ocultar postulaciones"
                          : "Ver postulaciones"
                      }
                    >
                      <span>{isExpanded ? "Ocultar" : "Ver"}</span>
                      <ChevronDown size={17} />
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="institution-applications-page__list">
                    {group.applications.map((application) => {
                      const applicationId = getApplicationId(application);
                      const professorId = getProfessorId(application);
                      const professorName = getProfessorName(application);
                      const status = getValue(application, "status", "Status");
                      const appliedAt = getValue(
                        application,
                        "appliedAt",
                        "AppliedAt",
                      );

                      return (
                        <div
                          key={applicationId}
                          className="institution-applications-page__card-wrapper"
                          onClick={() =>
                            navigate(
                              `/institution/job-postings/${jobId}/applications/${applicationId}`,
                            )
                          }
                        >
                          <Card className="institution-applications-page__card">
                            <div className="institution-applications-page__card-top">
                              <div className="institution-applications-page__identity">
                                <button
                                  type="button"
                                  className="institution-applications-page__professor-link"
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    if (professorId) {
                                      navigate(`/professors/${professorId}`);
                                    }
                                  }}
                                  disabled={!professorId}
                                  title="Ver perfil público del profesor"
                                >
                                  <UserRound size={16} />
                                  <span>{professorName}</span>
                                </button>
                              </div>

                              <span
                                className={getApplicationStatusClass(status)}
                              >
                                {getApplicationStatusLabel(status)}
                              </span>
                            </div>

                            <div className="institution-applications-page__meta">
                              <span>
                                <Clock3 size={14} />
                                {formatDate(appliedAt)}
                              </span>
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Todavía no recibiste postulaciones"
          description="Cuando los profesores se postulen a tus vacantes, vas a poder verlas acá agrupadas por vacante."
        />
      )}
    </div>
  );
}

export default InstitutionApplicationsPage;
