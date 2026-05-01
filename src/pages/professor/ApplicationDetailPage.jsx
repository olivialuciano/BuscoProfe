import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock3,
  FileText,
  Info,
  Trash2,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  getApplicationById,
  withdrawApplication,
  acceptApplication,
  rejectApplication,
} from "../../api/applicationsService";
import { getJobPostingById } from "../../api/jobPostingsService";
import { getProfessorPublicProfile } from "../../api/usersService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import ProfileSectionModal from "../../components/profile/ProfileSectionModal";
import { getApiErrorMessage } from "../../utils/errorUtils";
import { ROLES } from "../../utils/constants";
import "./ApplicationDetailPage.css";

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

function formatDate(value) {
  if (!value) return "No informada";

  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function cleanWhatsappNumber(value) {
  if (!value) return "";

  let number = String(value).replace(/\D/g, "");

  if (!number) return "";

  if (number.startsWith("00")) {
    number = number.slice(2);
  }

  if (number.startsWith("0")) {
    number = number.slice(1);
  }

  if (!number.startsWith("54")) {
    number = `54${number}`;
  }

  return number;
}

function buildWhatsappUrl(phoneNumber, message) {
  const cleanNumber = cleanWhatsappNumber(phoneNumber);

  if (!cleanNumber) return "";

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

function getValue(source, camelCaseName, pascalCaseName) {
  return source?.[camelCaseName] ?? source?.[pascalCaseName];
}

function ApplicationDetailPage() {
  const { id, applicationId } = useParams();
  const resolvedApplicationId = applicationId || id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [openingJob, setOpeningJob] = useState(false);
  const [isDeletedJobPosting, setIsDeletedJobPosting] = useState(false);

  const [jobPostingDetail, setJobPostingDetail] = useState(null);
  const [professorDetail, setProfessorDetail] = useState(null);

  const loadApplication = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getApplicationById(resolvedApplicationId);
      setApplication(data);

      const embeddedStatuses = [
        data.jobPostingStatus,
        data.jobStatus,
        data.jobPosting?.status,
      ];

      setIsDeletedJobPosting(
        embeddedStatuses.some((value) => Number(value) === 4),
      );

      if (data.jobPostingId) {
        try {
          const job = await getJobPostingById(data.jobPostingId);
          setJobPostingDetail(job);
        } catch {
          setJobPostingDetail(null);
        }
      }

      if (data.professorUserId) {
        try {
          const professor = await getProfessorPublicProfile(
            data.professorUserId,
          );
          setProfessorDetail(professor);
        } catch {
          setProfessorDetail(null);
        }
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudo cargar el detalle de la postulación.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && resolvedApplicationId) {
      loadApplication();
    }
  }, [resolvedApplicationId, user?.id]);

  const jobTitle = useMemo(() => {
    if (!application) return "";

    return (
      application.jobTitle ||
      application.jobPostingTitle ||
      application.title ||
      jobPostingDetail?.title ||
      jobPostingDetail?.Title ||
      "Vacante sin título"
    );
  }, [application, jobPostingDetail]);

  const professorName = useMemo(() => {
    if (!application && !professorDetail) return "";

    const applicationName = `${application?.professorFirstName || ""} ${
      application?.professorLastName || ""
    }`.trim();

    const professorProfileName =
      `${professorDetail?.firstName || professorDetail?.FirstName || ""} ${
        professorDetail?.lastName || professorDetail?.LastName || ""
      }`.trim();

    return applicationName || professorProfileName || "Profesor sin nombre";
  }, [application, professorDetail]);

  const institutionName = useMemo(() => {
    return (
      user?.tradeName ||
      user?.TradeName ||
      user?.legalName ||
      user?.LegalName ||
      jobPostingDetail?.institution?.tradeName ||
      jobPostingDetail?.Institution?.TradeName ||
      jobPostingDetail?.institutionTradeName ||
      jobPostingDetail?.InstitutionTradeName ||
      "tu institución"
    );
  }, [user, jobPostingDetail]);

  const professorWhatsapp = useMemo(() => {
    return (
      professorDetail?.whatsApp1 ||
      professorDetail?.WhatsApp1 ||
      professorDetail?.whatsapp1 ||
      professorDetail?.Whatsapp1 ||
      application?.professorWhatsApp1 ||
      application?.professorWhatsapp1 ||
      application?.professorPhone ||
      ""
    );
  }, [professorDetail, application]);

  const jobDaysAndHours = useMemo(() => {
    return (
      getValue(jobPostingDetail, "daysAndHours", "DaysAndHours") ||
      application?.daysAndHours ||
      application?.DaysAndHours ||
      "días y horarios a coordinar"
    );
  }, [jobPostingDetail, application]);

  const whatsappMessage = useMemo(() => {
    return `Hola ${professorName}, ¿cómo estás? Te escribimos desde ${institutionName} para avisarte que tu postulación para la vacante "${jobTitle}" fue aceptada.

La vacante tiene como días y horarios: ${jobDaysAndHours}.

Nos gustaría comunicarnos con vos para avanzar con los próximos pasos.`;
  }, [professorName, institutionName, jobTitle, jobDaysAndHours]);

  const whatsappUrl = useMemo(() => {
    return buildWhatsappUrl(professorWhatsapp, whatsappMessage);
  }, [professorWhatsapp, whatsappMessage]);

  const isProfessor = user?.role === ROLES.PROFESSOR;
  const isInstitution = user?.role === ROLES.INSTITUTION;

  const canWithdraw = useMemo(() => {
    if (!application || !isProfessor) return false;

    const status = Number(application.status);
    return status !== 2 && status !== 3 && status !== 4;
  }, [application, isProfessor]);

  const canInstitutionDecide = useMemo(() => {
    if (!application || !isInstitution) return false;

    const status = Number(application.status);
    return status !== 2 && status !== 3 && status !== 4;
  }, [application, isInstitution]);

  const handleOpenJobPosting = async () => {
    if (!application?.jobPostingId || openingJob) return;

    try {
      setOpeningJob(true);

      const job = await getJobPostingById(application.jobPostingId);

      if (Number(job?.status) === 4) {
        setIsDeletedJobPosting(true);
        showToast(
          "Esta vacante ya no está disponible porque fue eliminada.",
          "error",
        );
        return;
      }

      navigate(`/jobs/${application.jobPostingId}`);
    } catch (err) {
      const backendMessage = getApiErrorMessage(
        err,
        "No se pudo abrir la vacante.",
      );

      if (
        backendMessage.toLowerCase().includes("no se encontró") ||
        backendMessage.toLowerCase().includes("not found")
      ) {
        setIsDeletedJobPosting(true);
        showToast(
          "Esta vacante ya no está disponible porque fue eliminada.",
          "error",
        );
      } else {
        showToast(backendMessage, "error");
      }
    } finally {
      setOpeningJob(false);
    }
  };

  const handleWithdraw = async () => {
    if (!application || withdrawing) return;

    try {
      setWithdrawing(true);
      await withdrawApplication(application.id);
      showToast("Postulación retirada.", "success");
      setShowWithdrawModal(false);
      navigate("/professor/applications");
    } catch {
      showToast("No se pudo retirar la postulación.", "error");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleAccept = async () => {
    if (!application || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      await acceptApplication(application.id);

      setApplication((current) => ({
        ...current,
        status: 3,
      }));

      showToast("Postulación aceptada.", "success");
      setShowAcceptModal(false);
      setShowWhatsappModal(true);
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "No se pudo aceptar la postulación."),
        "error",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenWhatsapp = () => {
    if (!whatsappUrl) {
      showToast(
        "El profesor no tiene un WhatsApp cargado en su perfil.",
        "error",
      );
      return;
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setShowWhatsappModal(false);
  };

  const handleReject = async () => {
    if (!application || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      await rejectApplication(application.id);

      setApplication((current) => ({
        ...current,
        status: 2,
      }));

      showToast("Postulación rechazada.", "success");
      setShowRejectModal(false);
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "No se pudo rechazar la postulación."),
        "error",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingSpinner text="Cargando detalle de postulación..." />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="page-shell application-detail">
        <ApiMessage type="error">
          {error || "No se encontró la postulación."}
        </ApiMessage>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell application-detail">
      <div className="application-detail__topbar">
        {isProfessor && canWithdraw ? (
          <button
            type="button"
            className="application-detail__delete-button"
            onClick={() => setShowWithdrawModal(true)}
            aria-label="Retirar postulación"
            title="Retirar postulación"
          >
            <Trash2 size={18} />
          </button>
        ) : null}

        {canInstitutionDecide ? (
          <div className="application-detail__institution-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowRejectModal(true)}
              disabled={updatingStatus}
            >
              Rechazar
            </Button>

            <Button
              type="button"
              onClick={() => setShowAcceptModal(true)}
              disabled={updatingStatus}
            >
              Aceptar postulación
            </Button>
          </div>
        ) : null}
      </div>

      <Card className="application-detail__hero">
        <div className="application-detail__hero-top">
          <div>
            <button
              type="button"
              className={`application-detail__job-link ${
                isDeletedJobPosting
                  ? "application-detail__job-link--disabled"
                  : ""
              }`}
              onClick={handleOpenJobPosting}
              disabled={openingJob}
              title={
                isDeletedJobPosting
                  ? "Esta vacante fue eliminada"
                  : "Ver detalle de la vacante"
              }
            >
              {openingJob ? "Abriendo vacante..." : jobTitle}
            </button>

            {isDeletedJobPosting ? (
              <span className="application-detail__job-removed-note">
                Esta vacante fue eliminada y ya no está disponible.
              </span>
            ) : null}
          </div>

          <span className={getApplicationStatusClass(application.status)}>
            {getApplicationStatusLabel(application.status)}
          </span>
        </div>
      </Card>

      <Card className="application-detail__section">
        <h2>Datos de la postulación</h2>

        <div className="application-detail__meta-grid">
          <div className="application-detail__meta-card">
            <Info size={16} />
            <div>
              <strong>Profesor</strong>
              <button
                type="button"
                className="application-detail__professor-link"
                onClick={() =>
                  navigate(`/professors/${application.professorUserId}`)
                }
                disabled={!application.professorUserId}
                title="Ver perfil público del profesor"
              >
                {professorName}
              </button>
            </div>
          </div>

          <div className="application-detail__meta-card">
            <Info size={16} />
            <div>
              <strong>Estado</strong>
              <span>{getApplicationStatusLabel(application.status)}</span>
            </div>
          </div>

          <div className="application-detail__meta-card">
            <Clock3 size={16} />
            <div>
              <strong>Fecha</strong>
              <span>{formatDate(application.appliedAt)}</span>
            </div>
          </div>
        </div>

        <div className="application-detail__message">
          <strong>
            <FileText size={14} />
            Nota enviada
          </strong>
          <p>{application.message || "Sin mensaje"}</p>
        </div>
      </Card>

      <ProfileSectionModal
        open={showWithdrawModal}
        onClose={() => {
          if (!withdrawing) setShowWithdrawModal(false);
        }}
        title="¿Querés retirar esta postulación?"
        subtitle="Esta acción quitará tu candidatura actual para esta vacante."
      >
        <div className="application-detail__delete-modal">
          <div className="application-detail__delete-warning">
            <AlertTriangle size={18} />
            <span>
              {`¿Estás seguro de que querés retirar tu postulación a "${jobTitle}"?`}
            </span>
          </div>

          <div className="application-detail__delete-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowWithdrawModal(false)}
              disabled={withdrawing}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="application-detail__delete-confirm"
              onClick={handleWithdraw}
              disabled={withdrawing}
            >
              {withdrawing ? "Retirando..." : "Sí, retirar postulación"}
            </Button>
          </div>
        </div>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={showAcceptModal}
        onClose={() => {
          if (!updatingStatus) setShowAcceptModal(false);
        }}
        title="¿Querés aceptar esta postulación?"
        subtitle="Se notificará al profesor que su postulación fue aceptada."
      >
        <div className="application-detail__delete-modal">
          <div className="application-detail__delete-warning application-detail__delete-warning--success">
            <AlertTriangle size={18} />
            <span>
              {`¿Confirmás que querés aceptar la postulación a "${jobTitle}"?`}
            </span>
          </div>

          <div className="application-detail__delete-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAcceptModal(false)}
              disabled={updatingStatus}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleAccept}
              disabled={updatingStatus}
            >
              {updatingStatus ? "Aceptando..." : "Sí, aceptar"}
            </Button>
          </div>
        </div>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={showWhatsappModal}
        onClose={() => setShowWhatsappModal(false)}
        title="Postulación aceptada"
        subtitle={`Comunicate por WhatsApp con ${professorName} y avisale que su postulación fue aceptada.`}
      >
        <div className="application-detail__whatsapp-modal">
          {!whatsappUrl ? (
            <ApiMessage type="error">
              El profesor no tiene un WhatsApp cargado en su perfil.
            </ApiMessage>
          ) : null}

          <div className="application-detail__delete-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowWhatsappModal(false)}
            >
              Cerrar
            </Button>

            <Button
              type="button"
              icon={<MessageCircle size={16} />}
              onClick={handleOpenWhatsapp}
              disabled={!whatsappUrl}
            >
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={showRejectModal}
        onClose={() => {
          if (!updatingStatus) setShowRejectModal(false);
        }}
        title="¿Querés rechazar esta postulación?"
        subtitle="Se notificará al profesor que su postulación fue rechazada."
      >
        <div className="application-detail__delete-modal">
          <div className="application-detail__delete-warning">
            <AlertTriangle size={18} />
            <span>
              {`¿Confirmás que querés rechazar la postulación a "${jobTitle}"?`}
            </span>
          </div>

          <div className="application-detail__delete-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowRejectModal(false)}
              disabled={updatingStatus}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="application-detail__delete-confirm"
              onClick={handleReject}
              disabled={updatingStatus}
            >
              {updatingStatus ? "Rechazando..." : "Sí, rechazar"}
            </Button>
          </div>
        </div>
      </ProfileSectionModal>
    </div>
  );
}

export default ApplicationDetailPage;
