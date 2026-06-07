import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock3,
  FileText,
  Info,
  Trash2,
  AlertTriangle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  CalendarDays,
  Briefcase,
  Gift,
  Flame,
  UserRoundCheck,
  Trophy,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  getApplicationById,
  deleteApplication,
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

const contractTypeOptions = [
  { value: 0, label: "Full Time" },
  { value: 1, label: "Part Time" },
  { value: 2, label: "Por hora" },
  { value: 3, label: "Temporal" },
  { value: 4, label: "Freelance" },
];

function getEnumLabel(options, value, fallback = "No especificado") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return (
    options.find((option) => Number(option.value) === Number(value))?.label ||
    fallback
  );
}

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

function getJobPostingStatusLabel(status) {
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

function getJobPostingStatusClass(status) {
  switch (Number(status)) {
    case 1:
      return "application-detail__job-badge application-detail__job-badge--open";
    case 2:
      return "application-detail__job-badge application-detail__job-badge--inactive";
    case 3:
      return "application-detail__job-badge application-detail__job-badge--closed";
    case 4:
      return "application-detail__job-badge application-detail__job-badge--deleted";
    default:
      return "application-detail__job-badge application-detail__job-badge--neutral";
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

function getDisplayValue(value, fallback = "No especificado") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return value;
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

  const [isDeletedJobPosting, setIsDeletedJobPosting] = useState(false);
  const [jobPostingDetail, setJobPostingDetail] = useState(null);
  const [professorDetail, setProfessorDetail] = useState(null);

  const [showJobPostingDetail, setShowJobPostingDetail] = useState(false);

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

          if (Number(job?.status || job?.Status) === 4) {
            setIsDeletedJobPosting(true);
          }
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
      jobPostingDetail?.institutionTradeName ||
      jobPostingDetail?.InstitutionTradeName ||
      jobPostingDetail?.institutionName ||
      jobPostingDetail?.InstitutionName ||
      user?.tradeName ||
      user?.TradeName ||
      user?.legalName ||
      user?.LegalName ||
      "Institución"
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

  const jobLocationText = useMemo(() => {
    if (!jobPostingDetail) return "No especificada";

    return (
      [
        getValue(jobPostingDetail, "city", "City"),
        getValue(jobPostingDetail, "province", "Province"),
        getValue(jobPostingDetail, "country", "Country"),
      ]
        .filter(Boolean)
        .join(", ") || "No especificada"
    );
  }, [jobPostingDetail]);

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

  const handleDeleteApplication = async () => {
    if (!application || withdrawing) return;

    try {
      setWithdrawing(true);

      await deleteApplication(application.id);

      showToast("Postulación eliminada definitivamente.", "success");
      setShowWithdrawModal(false);
      navigate("/professor/applications");
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "No se pudo eliminar la postulación."),
        "error",
      );
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

  const jobStatus = getValue(jobPostingDetail, "status", "Status");
  const jobDescription = getValue(
    jobPostingDetail,
    "description",
    "Description",
  );
  const jobRequirements = getValue(
    jobPostingDetail,
    "requirementsText",
    "RequirementsText",
  );
  const jobBenefits = getValue(
    jobPostingDetail,
    "benefitsText",
    "BenefitsText",
  );
  const jobSalary = getValue(jobPostingDetail, "salaryText", "SalaryText");
  const jobProfessionalType = getValue(
    jobPostingDetail,
    "professionalType",
    "ProfessionalType",
  );
  const jobDiscipline = getValue(jobPostingDetail, "discipline", "Discipline");
  const jobContractType = getValue(
    jobPostingDetail,
    "contractType",
    "ContractType",
  );
  const jobWorkMode = getValue(jobPostingDetail, "workMode", "WorkMode");
  const jobAvailability = getValue(
    jobPostingDetail,
    "availability",
    "Availability",
  );
  const jobIsUrgent = Boolean(
    getValue(jobPostingDetail, "isUrgent", "IsUrgent"),
  );

  return (
    <div className="page-shell application-detail">
      <div className="application-detail__topbar">
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
          <div className="application-detail__hero-title">
            <h1 className="application-detail__job-title">{jobTitle}</h1>

            {isDeletedJobPosting ? (
              <span className="application-detail__job-removed-note">
                Esta vacante fue eliminada y ya no está disponible.
              </span>
            ) : null}
          </div>

          <div className="application-detail__hero-actions">
            <span className={getApplicationStatusClass(application.status)}>
              {getApplicationStatusLabel(application.status)}
            </span>

            {isProfessor && canWithdraw ? (
              <button
                type="button"
                className="application-detail__delete-button"
                onClick={() => setShowWithdrawModal(true)}
                aria-label="Eliminar postulación"
                title="Eliminar postulación"
              >
                <Trash2 size={18} />
              </button>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="application-detail__job-toggle"
          onClick={() => setShowJobPostingDetail((current) => !current)}
          disabled={!jobPostingDetail}
        >
          <span>
            {showJobPostingDetail ? "Ocultar detalle" : "Ver detalle"}
          </span>

          {showJobPostingDetail ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
      </Card>

      {showJobPostingDetail ? (
        <Card className="application-detail__job-detail-card">
          {!jobPostingDetail ? (
            <ApiMessage type="error">
              No se pudo cargar el detalle de la vacante.
            </ApiMessage>
          ) : (
            <>
              <div className="application-detail__job-detail-header">
                <div>
                  <h2>{jobTitle}</h2>
                  <p>
                    {jobDescription ||
                      "La vacante no tiene descripción cargada."}
                  </p>
                </div>

                <div className="application-detail__job-detail-badges">
                  {jobIsUrgent ? (
                    <span className="application-detail__job-badge application-detail__job-badge--urgent">
                      <Flame size={14} />
                      Urgente
                    </span>
                  ) : null}

                  <span className={getJobPostingStatusClass(jobStatus)}>
                    {getJobPostingStatusLabel(jobStatus)}
                  </span>
                </div>
              </div>

              <div className="application-detail__job-meta-grid">
                <div className="application-detail__job-meta-card">
                  <Building2 size={16} />
                  <div>
                    <strong>Institución</strong>
                    <span>{institutionName}</span>
                  </div>
                </div>

                <div className="application-detail__job-meta-card">
                  <UserRoundCheck size={16} />
                  <div>
                    <strong>Tipo de profesional</strong>
                    <span>
                      {getEnumLabel(
                        professionalTypeOptions,
                        jobProfessionalType,
                      )}
                    </span>
                  </div>
                </div>

                <div className="application-detail__job-meta-card">
                  <Trophy size={16} />
                  <div>
                    <strong>Disciplina</strong>
                    <span>
                      {getEnumLabel(disciplineOptions, jobDiscipline)}
                    </span>
                  </div>
                </div>

                <div className="application-detail__job-meta-card">
                  <CalendarDays size={16} />
                  <div>
                    <strong>Días y horarios</strong>
                    <span>{getDisplayValue(jobDaysAndHours)}</span>
                  </div>
                </div>

                <div className="application-detail__job-meta-card">
                  <MapPin size={16} />
                  <div>
                    <strong>Ubicación</strong>
                    <span>{jobLocationText}</span>
                  </div>
                </div>

                <div className="application-detail__job-meta-card">
                  <Briefcase size={16} />
                  <div>
                    <strong>Tipo de contrato</strong>
                    <span>
                      {getEnumLabel(contractTypeOptions, jobContractType)}
                    </span>
                  </div>
                </div>

                <div className="application-detail__job-meta-card">
                  <Gift size={16} />
                  <div>
                    <strong>Salario</strong>
                    <span>{getDisplayValue(jobSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="application-detail__job-text-section">
                <h3>Descripción del puesto</h3>
                <p>{jobDescription || "Sin descripción."}</p>
              </div>

              <div className="application-detail__job-text-section">
                <h3>Requisitos</h3>
                <p>{jobRequirements || "No especificados."}</p>
              </div>

              <div className="application-detail__job-text-section">
                <h3>Beneficios</h3>
                <p>{jobBenefits || "No especificados."}</p>
              </div>
            </>
          )}
        </Card>
      ) : null}

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
        title="¿Querés eliminar esta postulación?"
        subtitle="Esta acción eliminará definitivamente tu postulación para esta vacante."
      >
        <div className="application-detail__delete-modal">
          <div className="application-detail__delete-warning">
            <AlertTriangle size={18} />
            <span>
              {`¿Estás seguro de que querés eliminar tu postulación a "${jobTitle}"?`}
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
              onClick={handleDeleteApplication}
              disabled={withdrawing}
            >
              {withdrawing ? "Eliminando..." : "Sí, eliminar postulación"}
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
