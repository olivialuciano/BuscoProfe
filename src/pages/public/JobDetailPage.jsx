import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  Briefcase,
  Clock3,
  MapPin,
  FileText,
  Gift,
  Trash2,
  AlertTriangle,
  Bookmark,
  Send,
  CalendarDays,
  Flame,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import ProfileSectionModal from "../../components/profile/ProfileSectionModal";
import InputField from "../../components/common/InputField";
import {
  getJobPostingById,
  deleteJobPostingLogical,
  activateJobPosting,
  inactivateJobPosting,
  closeJobPosting,
} from "../../api/jobPostingsService";
import {
  getFavoriteJobPostingsByProfessor,
  createFavoriteJobPosting,
  deleteFavoriteJobPostingByProfessorAndJobPosting,
} from "../../api/favoriteJobPostingsService";
import {
  getProfessorApplications,
  createApplication,
} from "../../api/applicationsService";
import { getAllInstitutions } from "../../api/usersService";
import { getApiErrorMessage } from "../../utils/errorUtils";
import {
  availabilityOptions,
  workModeOptions,
  contractTypeOptions,
} from "../../utils/enumOptions";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { ROLES } from "../../utils/constants";
import "./JobDetailPage.css";

const professionalTypeOptions = [
  { value: 0, label: "Profesor" },
  { value: 1, label: "Instructor" },
  { value: 2, label: "Preparador físico" },
  { value: 3, label: "Director técnico" },
  { value: 4, label: "Guardavidas" },
  { value: 5, label: "Video analista" },
  { value: 6, label: "Otro" },
];

const disciplineOptions = [
  { value: 0, label: "Aikido" },
  { value: 1, label: "Ajedrez" },
  { value: 2, label: "Aquagym" },
  { value: 3, label: "Artes marciales mixtas" },
  { value: 4, label: "Atletismo" },
  { value: 5, label: "Bádminton" },
  { value: 6, label: "Básquetbol" },
  { value: 7, label: "Beach volley" },
  { value: 8, label: "Béisbol" },
  { value: 9, label: "Bochas" },
  { value: 10, label: "Boxeo" },
  { value: 11, label: "BMX" },
  { value: 12, label: "Calistenia" },
  { value: 13, label: "Cheerleading" },
  { value: 14, label: "Ciclismo" },
  { value: 15, label: "Crossfit" },
  { value: 16, label: "Danza" },
  { value: 17, label: "Equitación" },
  { value: 18, label: "Esgrima" },
  { value: 19, label: "Fisicoculturismo" },
  { value: 20, label: "Frontón" },
  { value: 21, label: "Fútbol" },
  { value: 22, label: "Fútbol playa" },
  { value: 23, label: "Fútbol sala" },
  { value: 24, label: "Gimnasia acrobática" },
  { value: 25, label: "Gimnasia artística" },
  { value: 26, label: "Gimnasia rítmica" },
  { value: 27, label: "Golf" },
  { value: 28, label: "Handball" },
  { value: 29, label: "Hockey sobre césped" },
  { value: 30, label: "Hockey sobre patines" },
  { value: 31, label: "Jiu jitsu" },
  { value: 32, label: "Judo" },
  { value: 33, label: "Karate" },
  { value: 34, label: "Kayak" },
  { value: 35, label: "Kickboxing" },
  { value: 36, label: "Kitesurf" },
  { value: 37, label: "Kung fu" },
  { value: 38, label: "Muay thai" },
  { value: 39, label: "Musculación" },
  { value: 40, label: "Natación" },
  { value: 41, label: "Natación artística" },
  { value: 42, label: "Pádel" },
  { value: 43, label: "Patín artístico" },
  { value: 44, label: "Patín carrera" },
  { value: 45, label: "Patinaje sobre hielo" },
  { value: 46, label: "Pelota paleta" },
  { value: 47, label: "Pilates" },
  { value: 48, label: "Polo" },
  { value: 49, label: "Powerlifting" },
  { value: 50, label: "Remo" },
  { value: 51, label: "Rugby" },
  { value: 52, label: "Running" },
  { value: 53, label: "Skateboarding" },
  { value: 54, label: "Softbol" },
  { value: 55, label: "Spinning" },
  { value: 56, label: "Squash" },
  { value: 57, label: "Stretching" },
  { value: 58, label: "Surf" },
  { value: 59, label: "Taekwondo" },
  { value: 60, label: "Tenis" },
  { value: 61, label: "Tenis de mesa" },
  { value: 62, label: "Tiro con arco" },
  { value: 63, label: "Tiro deportivo" },
  { value: 64, label: "Triatlón" },
  { value: 65, label: "Ultimate frisbee" },
  { value: 66, label: "Vela" },
  { value: 67, label: "Voleibol" },
  { value: 68, label: "Waterpolo" },
  { value: 69, label: "Windsurf" },
  { value: 70, label: "Yoga" },
  { value: 71, label: "Zumba" },
  { value: 72, label: "Otro" },
];

function getEnumLabel(options, value) {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }

  return (
    options.find((option) => Number(option.value) === Number(value))?.label ||
    "No especificado"
  );
}

function getStatusLabel(status) {
  switch (Number(status)) {
    case 1:
      return "Abierta";
    case 2:
      return "Inactiva";
    case 3:
      return "Cerrada";
    case 4:
      return "Eliminada";
    default:
      return "No especificado";
  }
}

function getActivationButtonConfig(status) {
  const numericStatus = Number(status);

  if (numericStatus === 3 || numericStatus === 4) {
    return {
      label: "Sin cambios",
      disabled: true,
      className: "job-status-button job-status-button--disabled",
      action: null,
    };
  }

  if (numericStatus === 2) {
    return {
      label: "Activar",
      disabled: false,
      className: "job-status-button job-status-button--inactive",
      action: "activate",
    };
  }

  return {
    label: "Inactivar",
    disabled: false,
    className: "job-status-button job-status-button--active",
    action: "inactivate",
  };
}

function getCloseButtonConfig(status) {
  const numericStatus = Number(status);

  if (numericStatus === 3 || numericStatus === 4) {
    return {
      label: "Cerrada",
      disabled: true,
      className: "job-status-button job-status-button--closed",
    };
  }

  return {
    label: "Cerrar",
    disabled: false,
    className: "job-status-button job-status-button--open",
  };
}

function favoriteMatchesJob(item, jobId) {
  return (
    Number(item?.jobPostingId) === Number(jobId) ||
    Number(item?.JobPostingId) === Number(jobId) ||
    Number(item?.jobPosting?.id) === Number(jobId) ||
    Number(item?.JobPosting?.Id) === Number(jobId)
  );
}

function applicationMatchesJob(item, jobId) {
  return (
    Number(item?.jobPostingId) === Number(jobId) ||
    Number(item?.JobPostingId) === Number(jobId) ||
    Number(item?.jobPosting?.id) === Number(jobId) ||
    Number(item?.JobPosting?.Id) === Number(jobId)
  );
}

function getJobValue(job, camelCaseName, pascalCaseName) {
  return job?.[camelCaseName] ?? job?.[pascalCaseName];
}

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [job, setJob] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [togglingStatus, setTogglingStatus] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingJob, setClosingJob] = useState(false);

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavoriteJob, setIsFavoriteJob] = useState(false);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [institutionOwner, setInstitutionOwner] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getJobPostingById(id);
        setJob(data);

        if (data?.institutionUserId || data?.InstitutionUserId) {
          const institutions = await getAllInstitutions();

          const owner = (Array.isArray(institutions) ? institutions : []).find(
            (institution) =>
              Number(institution.id || institution.Id) ===
              Number(data.institutionUserId || data.InstitutionUserId),
          );

          setInstitutionOwner(owner || null);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "No se pudo cargar la vacante."));
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const refreshProfessorFlags = async () => {
    if (!user || user.role !== ROLES.PROFESSOR || !id) {
      return { favoriteExists: false, applicationExists: false };
    }

    const [favorites, applications] = await Promise.all([
      getFavoriteJobPostingsByProfessor(user.id),
      getProfessorApplications(user.id),
    ]);

    const favoriteItems = Array.isArray(favorites) ? favorites : [];
    const applicationItems = Array.isArray(applications) ? applications : [];

    const favoriteExists = favoriteItems.some((item) =>
      favoriteMatchesJob(item, id),
    );

    const applicationExists = applicationItems.some((item) =>
      applicationMatchesJob(item, id),
    );

    setIsFavoriteJob(favoriteExists);
    setAlreadyApplied(applicationExists);

    return { favoriteExists, applicationExists };
  };

  useEffect(() => {
    const loadProfessorData = async () => {
      if (!user || user.role !== ROLES.PROFESSOR || !id) return;

      try {
        await refreshProfessorFlags();
      } catch {
        // No bloqueo la pantalla si falla esta consulta.
      }
    };

    loadProfessorData();
  }, [user, id]);

  const locationText = useMemo(() => {
    if (!job) return "";

    return (
      [job.city, job.province, job.country].filter(Boolean).join(", ") ||
      "Ubicación no informada"
    );
  }, [job]);

  const institutionName = useMemo(() => {
    return (
      institutionOwner?.tradeName ||
      institutionOwner?.TradeName ||
      institutionOwner?.legalName ||
      institutionOwner?.LegalName ||
      job?.institutionTradeName ||
      job?.InstitutionTradeName ||
      job?.institutionName ||
      job?.InstitutionName ||
      "Institución"
    );
  }, [institutionOwner, job]);

  const institutionDetailId = useMemo(() => {
    return (
      institutionOwner?.id ||
      institutionOwner?.Id ||
      job?.institutionUserId ||
      job?.InstitutionUserId
    );
  }, [institutionOwner, job]);

  const canDeleteJob = useMemo(() => {
    if (!job || !user) return false;

    return (
      user.role === ROLES.INSTITUTION &&
      Number(user.id) === Number(job.institutionUserId || job.InstitutionUserId)
    );
  }, [job, user]);

  const canApply = useMemo(() => {
    if (!job || !user) return false;

    return (
      user.role === ROLES.PROFESSOR &&
      Number(job.status || job.Status) === 1 &&
      !alreadyApplied
    );
  }, [job, user, alreadyApplied]);

  const canFavoriteJob = useMemo(() => {
    if (!job || !user) return false;

    return (
      user.role === ROLES.PROFESSOR && Number(job.status || job.Status) !== 4
    );
  }, [job, user]);

  const activationConfig = useMemo(() => {
    return getActivationButtonConfig(job?.status || job?.Status);
  }, [job?.status, job?.Status]);

  const closeConfig = useMemo(() => {
    return getCloseButtonConfig(job?.status || job?.Status);
  }, [job?.status, job?.Status]);

  const handleDelete = async () => {
    if (!job || deleting) return;

    try {
      setDeleting(true);
      await deleteJobPostingLogical(job.id || job.Id);
      showToast("Vacante eliminada.", "success");
      setShowDeleteModal(false);
      navigate("/institution/jobs");
    } catch {
      showToast("No se pudo eliminar la vacante.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleActivationToggle = async () => {
    if (!job || !activationConfig.action || togglingStatus) return;

    try {
      setTogglingStatus(true);

      if (activationConfig.action === "activate") {
        await activateJobPosting(job.id || job.Id);
        setJob((current) => ({ ...current, status: 1, Status: 1 }));
      } else {
        await inactivateJobPosting(job.id || job.Id);
        setJob((current) => ({ ...current, status: 2, Status: 2 }));
      }
    } catch {
      showToast("No se pudo cambiar el estado de la vacante.", "error");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleCloseJob = async () => {
    if (
      !job ||
      closingJob ||
      Number(job.status || job.Status) === 3 ||
      Number(job.status || job.Status) === 4
    ) {
      return;
    }

    try {
      setClosingJob(true);
      await closeJobPosting(job.id || job.Id);
      setJob((current) => ({ ...current, status: 3, Status: 3 }));
      setShowCloseModal(false);
      showToast("Vacante cerrada.", "success");
    } catch {
      showToast("No se pudo cerrar la vacante.", "error");
    } finally {
      setClosingJob(false);
    }
  };

  const handleToggleFavoriteJob = async () => {
    if (!user || !job || favoriteLoading) return;

    const jobId = job.id || job.Id;

    try {
      setFavoriteLoading(true);

      if (isFavoriteJob) {
        await deleteFavoriteJobPostingByProfessorAndJobPosting(user.id, jobId);
        setIsFavoriteJob(false);
        return;
      }

      await createFavoriteJobPosting({
        professorUserId: user.id,
        jobPostingId: jobId,
      });

      setIsFavoriteJob(true);
    } catch (err) {
      const backendMessage = getApiErrorMessage(
        err,
        "No se pudo actualizar el guardado de la vacante.",
      );

      if (
        backendMessage.toLowerCase().includes("ya está en favoritos") ||
        backendMessage.toLowerCase().includes("ya esta en favoritos")
      ) {
        setIsFavoriteJob(true);
      } else {
        showToast(backendMessage, "error");
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || !job || applying) return;

    try {
      setApplying(true);

      await createApplication({
        jobPostingId: job.id || job.Id,
        professorUserId: user.id,
        message: applicationMessage,
      });

      setAlreadyApplied(true);
      setShowApplyModal(false);
      setApplicationMessage("");
    } catch (err) {
      const backendMessage = getApiErrorMessage(
        err,
        "No se pudo completar la postulación.",
      );

      if (
        backendMessage.toLowerCase().includes("ya existe una postulación") ||
        backendMessage.toLowerCase().includes("ya existe")
      ) {
        setAlreadyApplied(true);
        setShowApplyModal(false);
      } else if (
        backendMessage.toLowerCase().includes("vacante no está activa") ||
        backendMessage.toLowerCase().includes("no está activa")
      ) {
        showToast("La vacante ya no está activa para postularse.", "error");
      } else {
        showToast(backendMessage, "error");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingSpinner text="Cargando vacante..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="page-shell job-detail-page">
        <ApiMessage type="error">
          {error || "No se encontró la vacante."}
        </ApiMessage>

        <Button variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  const jobId = job.id || job.Id;
  const jobStatus = job.status ?? job.Status;
  const professionalType = getJobValue(
    job,
    "professionalType",
    "ProfessionalType",
  );
  const discipline = getJobValue(job, "discipline", "Discipline");
  const daysAndHours = getJobValue(job, "daysAndHours", "DaysAndHours");
  const isUrgent = Boolean(getJobValue(job, "isUrgent", "IsUrgent"));

  return (
    <div className="page-shell job-detail-page">
      <div className="job-detail-page__topbar">
        <div className="job-detail-page__topbar-actions">
          {canApply ? (
            <Button
              onClick={() => setShowApplyModal(true)}
              icon={<Send size={16} />}
            >
              Postularse
            </Button>
          ) : null}

          {alreadyApplied ? (
            <span className="job-detail-page__applied-badge">
              Ya te postulaste
            </span>
          ) : null}

          {canDeleteJob ? (
            <div className="job-detail-page__institution-actions">
              <div className="job-detail-page__institution-actions-row">
                <button
                  type="button"
                  className={`job-detail-page__outline-action ${activationConfig.className}`}
                  onClick={handleActivationToggle}
                  disabled={
                    activationConfig.disabled ||
                    togglingStatus ||
                    closingJob ||
                    deleting
                  }
                >
                  {togglingStatus ? "Guardando..." : activationConfig.label}
                </button>

                <button
                  type="button"
                  className={`job-detail-page__outline-action ${closeConfig.className}`}
                  onClick={() => setShowCloseModal(true)}
                  disabled={closeConfig.disabled || closingJob || deleting}
                >
                  {closingJob ? "Cerrando..." : closeConfig.label}
                </button>

                <button
                  type="button"
                  className="job-detail-page__delete-button"
                  onClick={() => setShowDeleteModal(true)}
                  aria-label="Eliminar vacante"
                  title="Eliminar vacante"
                  disabled={deleting || togglingStatus || closingJob}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <Button
                type="button"
                className="job-detail-page__applications-button"
                onClick={() =>
                  navigate(`/institution/job-postings/${jobId}/applications`)
                }
              >
                Ver postulaciones
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <Card className="job-detail-page__hero">
        <div className="job-detail-page__hero-top">
          <div className="job-detail-page__title-content">
            <div className="job-detail-page__title-row">
              <h1>{job.title || job.Title}</h1>

              {canFavoriteJob ? (
                <button
                  type="button"
                  className={`job-detail-page__save-button ${
                    isFavoriteJob ? "job-detail-page__save-button--active" : ""
                  }`}
                  onClick={handleToggleFavoriteJob}
                  aria-label="Guardar vacante"
                  title={
                    isFavoriteJob ? "Quitar de guardados" : "Guardar vacante"
                  }
                  disabled={favoriteLoading}
                >
                  <Bookmark
                    size={18}
                    fill={isFavoriteJob ? "currentColor" : "none"}
                  />
                </button>
              ) : null}
            </div>

            <p>{job.description || job.Description || "Sin descripción."}</p>
          </div>

          <div className="job-detail-page__hero-badges">
            {isUrgent ? (
              <span className="job-detail-page__badge job-detail-page__badge--urgent">
                <Flame size={14} />
                Urgente
              </span>
            ) : null}

            <span
              className={`job-detail-page__badge ${
                Number(jobStatus) === 1
                  ? "job-detail-page__badge--open"
                  : Number(jobStatus) === 2
                    ? "job-detail-page__badge--inactive"
                    : Number(jobStatus) === 3
                      ? "job-detail-page__badge--closed"
                      : "job-detail-page__badge--neutral"
              }`}
            >
              {getStatusLabel(jobStatus)}
            </span>
          </div>
        </div>

        <div className="job-detail-page__meta-grid">
          <div className="job-detail-page__meta-card">
            <Building2 size={16} />
            <div>
              <strong>Institución</strong>
              <button
                type="button"
                className="job-detail-page__institution-link"
                onClick={() => navigate(`/institutions/${institutionDetailId}`)}
                disabled={!institutionDetailId}
                title="Ver perfil de la institución"
              >
                {institutionName}
              </button>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <UserRoundCheck size={16} />
            <div>
              <strong>Tipo de profesional</strong>
              <span>
                {getEnumLabel(professionalTypeOptions, professionalType)}
              </span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <Trophy size={16} />
            <div>
              <strong>Disciplina</strong>
              <span>{getEnumLabel(disciplineOptions, discipline)}</span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <CalendarDays size={16} />
            <div>
              <strong>Días y horarios</strong>
              <span>{daysAndHours || "No especificado"}</span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <MapPin size={16} />
            <div>
              <strong>Ubicación</strong>
              <span>{locationText}</span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <Briefcase size={16} />
            <div>
              <strong>Modalidad</strong>
              <span>
                {getEnumLabel(workModeOptions, job.workMode ?? job.WorkMode)}
              </span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <Clock3 size={16} />
            <div>
              <strong>Disponibilidad</strong>
              <span>
                {getEnumLabel(
                  availabilityOptions,
                  job.availability ?? job.Availability,
                )}
              </span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <FileText size={16} />
            <div>
              <strong>Tipo de contrato</strong>
              <span>
                {getEnumLabel(
                  contractTypeOptions,
                  job.contractType ?? job.ContractType,
                )}
              </span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <Gift size={16} />
            <div>
              <strong>Salario</strong>
              <span>
                {job.salaryText || job.SalaryText || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="job-detail-page__section">
        <h2>Descripción del puesto</h2>
        <p>{job.description || job.Description || "Sin descripción."}</p>
      </Card>

      <Card className="job-detail-page__section">
        <h2>Requisitos</h2>
        <p>
          {job.requirementsText || job.RequirementsText || "No especificados."}
        </p>
      </Card>

      <Card className="job-detail-page__section">
        <h2>Beneficios</h2>
        <p>{job.benefitsText || job.BenefitsText || "No especificados."}</p>
      </Card>

      <ProfileSectionModal
        open={showDeleteModal}
        onClose={() => {
          if (!deleting) setShowDeleteModal(false);
        }}
        title="¿Querés eliminar esta vacante?"
        subtitle="Esta acción la quitará de la plataforma."
      >
        <div className="job-detail-page__delete-modal">
          <div className="job-detail-page__delete-warning">
            <AlertTriangle size={18} />
            <span>
              {`¿Estás seguro de que querés eliminar la vacante "${
                job.title || job.Title
              }"?`}
            </span>
          </div>

          <div className="job-detail-page__delete-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="job-detail-page__delete-confirm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Sí, eliminar vacante"}
            </Button>
          </div>
        </div>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={showCloseModal}
        onClose={() => {
          if (!closingJob) setShowCloseModal(false);
        }}
        title="¿Querés cerrar esta vacante?"
        subtitle="Esta acción no se puede deshacer. La vacante dejará de estar disponible para nuevas postulaciones."
      >
        <div className="job-detail-page__delete-modal">
          <div className="job-detail-page__delete-warning">
            <AlertTriangle size={18} />
            <span>
              {`¿Estás seguro de que querés cerrar la vacante "${
                job.title || job.Title
              }"?`}
            </span>
          </div>

          <div className="job-detail-page__delete-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCloseModal(false)}
              disabled={closingJob}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="job-status-button job-status-button--closed"
              onClick={handleCloseJob}
              disabled={closingJob}
            >
              {closingJob ? "Cerrando..." : "Sí, cerrar vacante"}
            </Button>
          </div>
        </div>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={showApplyModal}
        onClose={() => {
          if (!applying) setShowApplyModal(false);
        }}
        title="Postularse a la vacante"
        subtitle="Podés agregar una nota opcional para acompañar tu postulación."
      >
        <div className="job-detail-page__apply-modal">
          <InputField
            label="Nota para la postulación"
            name="applicationMessage"
            textarea
            value={applicationMessage}
            onChange={(event) => setApplicationMessage(event.target.value)}
            placeholder="Escribí una breve presentación o aclaración..."
          />

          <div className="job-detail-page__delete-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowApplyModal(false)}
              disabled={applying}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleApply}
              disabled={applying}
              icon={<Send size={16} />}
            >
              {applying ? "Postulando..." : "Confirmar postulación"}
            </Button>
          </div>
        </div>
      </ProfileSectionModal>
    </div>
  );
}

export default JobDetailPage;
