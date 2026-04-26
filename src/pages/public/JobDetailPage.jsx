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
  return Number(item?.jobPostingId) === Number(jobId);
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

        if (data?.institutionUserId) {
          const institutions = await getAllInstitutions();
          const owner = (Array.isArray(institutions) ? institutions : []).find(
            (institution) =>
              Number(institution.id) === Number(data.institutionUserId),
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

    const applicationExists = applicationItems.some(
      (item) => Number(item.jobPostingId) === Number(id),
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
        // no bloqueo la pantalla
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
      institutionOwner?.legalName ||
      job?.institutionTradeName ||
      job?.institutionName ||
      "Institución"
    );
  }, [institutionOwner, job]);

  const institutionDetailId = useMemo(() => {
    return institutionOwner?.id || job?.institutionUserId;
  }, [institutionOwner, job]);

  const canDeleteJob = useMemo(() => {
    if (!job || !user) return false;
    return (
      user.role === ROLES.INSTITUTION &&
      Number(user.id) === Number(job.institutionUserId)
    );
  }, [job, user]);

  const canApply = useMemo(() => {
    if (!job || !user) return false;
    return (
      user.role === ROLES.PROFESSOR &&
      Number(job.status) === 1 &&
      !alreadyApplied
    );
  }, [job, user, alreadyApplied]);

  const canFavoriteJob = useMemo(() => {
    if (!job || !user) return false;
    return user.role === ROLES.PROFESSOR && Number(job.status) !== 4;
  }, [job, user]);

  const activationConfig = useMemo(() => {
    return getActivationButtonConfig(job?.status);
  }, [job?.status]);

  const closeConfig = useMemo(() => {
    return getCloseButtonConfig(job?.status);
  }, [job?.status]);

  const handleDelete = async () => {
    if (!job || deleting) return;

    try {
      setDeleting(true);
      await deleteJobPostingLogical(job.id);
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
        await activateJobPosting(job.id);
        setJob((current) => ({ ...current, status: 1 }));
      } else {
        await inactivateJobPosting(job.id);
        setJob((current) => ({ ...current, status: 2 }));
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
      Number(job.status) === 3 ||
      Number(job.status) === 4
    ) {
      return;
    }

    try {
      setClosingJob(true);
      await closeJobPosting(job.id);
      setJob((current) => ({ ...current, status: 3 }));
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

    try {
      setFavoriteLoading(true);

      if (isFavoriteJob) {
        await deleteFavoriteJobPostingByProfessorAndJobPosting(user.id, job.id);
        setIsFavoriteJob(false);
        return;
      }

      await createFavoriteJobPosting({
        professorUserId: user.id,
        jobPostingId: job.id,
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
        jobPostingId: job.id,
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
                  navigate(`/institution/job-postings/${job.id}/applications`)
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
              <h1>{job.title}</h1>

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

            <p>{job.description || "Sin descripción."}</p>
          </div>

          <span
            className={`job-detail-page__badge ${
              Number(job.status) === 1
                ? "job-detail-page__badge--open"
                : Number(job.status) === 2
                  ? "job-detail-page__badge--inactive"
                  : Number(job.status) === 3
                    ? "job-detail-page__badge--closed"
                    : "job-detail-page__badge--neutral"
            }`}
          >
            {getStatusLabel(job.status)}
          </span>
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
              <span>{getEnumLabel(workModeOptions, job.workMode)}</span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <Clock3 size={16} />
            <div>
              <strong>Disponibilidad</strong>
              <span>{getEnumLabel(availabilityOptions, job.availability)}</span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <FileText size={16} />
            <div>
              <strong>Tipo de contrato</strong>
              <span>{getEnumLabel(contractTypeOptions, job.contractType)}</span>
            </div>
          </div>

          <div className="job-detail-page__meta-card">
            <Gift size={16} />
            <div>
              <strong>Salario</strong>
              <span>{job.salaryText || "No especificado"}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="job-detail-page__section">
        <h2>Descripción del puesto</h2>
        <p>{job.description || "Sin descripción."}</p>
      </Card>

      <Card className="job-detail-page__section">
        <h2>Requisitos</h2>
        <p>{job.requirementsText || "No especificados."}</p>
      </Card>

      <Card className="job-detail-page__section">
        <h2>Beneficios</h2>
        <p>{job.benefitsText || "No especificados."}</p>
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
              {`¿Estás seguro de que querés eliminar la vacante "${job.title}"?`}
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
              {`¿Estás seguro de que querés cerrar la vacante "${job.title}"?`}
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
      {canApply ? (
        <Button
          onClick={() => setShowApplyModal(true)}
          icon={<Send size={16} />}
        >
          Postularse
        </Button>
      ) : null}
    </div>
  );
}

export default JobDetailPage;
