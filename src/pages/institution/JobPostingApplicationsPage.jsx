import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { getJobPostingById } from "../../api/jobPostingsService";
import { getApplicationsByJobPosting } from "../../api/applicationsService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./JobPostingApplicationsPage.css";

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
      return "job-posting-applications__badge job-posting-applications__badge--review";
    case 1:
      return "job-posting-applications__badge job-posting-applications__badge--review";
    case 2:
      return "job-posting-applications__badge job-posting-applications__badge--rejected";
    case 3:
      return "job-posting-applications__badge job-posting-applications__badge--accepted";
    case 4:
      return "job-posting-applications__badge job-posting-applications__badge--withdrawn";
    default:
      return "job-posting-applications__badge job-posting-applications__badge--neutral";
  }
}

function formatApplicationDate(value) {
  if (!value) return "Fecha no informada";

  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function JobPostingApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [jobData, applicationsData] = await Promise.all([
        getJobPostingById(id),
        getApplicationsByJobPosting(id),
      ]);

      setJob(jobData);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron cargar las postulaciones de la vacante.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const title = useMemo(() => {
    return job?.title || "Vacante";
  }, [job]);

  if (loading) {
    return (
      <div className="page-shell job-posting-applications">
        <LoadingSpinner text="Cargando postulaciones..." />
      </div>
    );
  }

  return (
    <div className="page-shell job-posting-applications">
      <header className="job-posting-applications__header">
        <h1 className="section-title">Postulaciones</h1>
        <p className="section-subtitle">
          <strong>{title}</strong>
        </p>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {applications.length ? (
        <div className="job-posting-applications__list">
          {applications.map((application) => {
            const professorName =
              `${application.professorFirstName || ""} ${
                application.professorLastName || ""
              }`.trim() || "Profesor sin nombre";

            return (
              <div
                key={application.id}
                className="job-posting-applications__card-wrapper"
                onClick={() =>
                  navigate(
                    `/institution/job-postings/${id}/applications/${application.id}`,
                  )
                }
              >
                <Card className="job-posting-applications__card">
                  <span
                    className={getApplicationStatusClass(application.status)}
                  >
                    {getApplicationStatusLabel(application.status)}
                  </span>

                  <div className="job-posting-applications__identity">
                    <h3>{professorName}</h3>
                  </div>

                  <div className="job-posting-applications__meta">
                    <span>
                      <Clock3 size={14} />
                      {formatApplicationDate(application.appliedAt)}
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Todavía no hay postulaciones"
          description="Cuando los profesores se postulen a esta vacante, van a aparecer acá."
        />
      )}
    </div>
  );
}

export default JobPostingApplicationsPage;
