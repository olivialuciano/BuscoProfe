import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, RefreshCw } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getProfessorApplications } from "../../api/applicationsService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./ProfessorApplicationsPage.css";

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
    case 1:
      return "application-detail__badge application-detail__badge--review";
    case 2:
      return "application-detail__badge application-detail__badge--rejected";
    case 3:
      return "application-detail__badge application-detail__badge--accepted";
    case 4:
      return "application-detail__badge application-detail__badge--withdrawn";
    default:
      return "application-detail__badge application-detail__badge--neutral";
  }
}

function ProfessorApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");

  const loadApplications = async (isReload = false) => {
    if (isReload) {
      setReloading(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getProfessorApplications(user.id);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "No se pudieron cargar tus postulaciones."),
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
    if (user?.id) {
      loadApplications();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="page-shell professor-applications">
        <LoadingSpinner text="Cargando postulaciones..." />
      </div>
    );
  }

  return (
    <div className="page-shell professor-applications">
      <header className="professor-applications__header">
        <div>
          <h1 className="section-title">Mis postulaciones</h1>
          <p className="section-subtitle">
            Seguimiento de postulaciones enviadas.
          </p>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {applications.length ? (
        <div className="professor-applications__list">
          {applications.map((application) => {
            const jobTitle =
              application.jobTitle ||
              application.jobPostingTitle ||
              application.title ||
              "Vacante sin título";

            return (
              <div
                key={application.id}
                className="professor-applications__item-wrapper"
                onClick={() =>
                  navigate(`/professor/applications/${application.id}`)
                }
              >
                <Card className="professor-applications__item">
                  <div className="professor-applications__item-main">
                    <div className="professor-applications__item-top">
                      <div>
                        <h3>{jobTitle}</h3>
                      </div>

                      <span
                        className={getApplicationStatusClass(
                          application.status,
                        )}
                      >
                        {getApplicationStatusLabel(application.status)}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Todavía no tenés postulaciones"
          description="Cuando te postules a una vacante, vas a verla acá."
        />
      )}
    </div>
  );
}

export default ProfessorApplicationsPage;
