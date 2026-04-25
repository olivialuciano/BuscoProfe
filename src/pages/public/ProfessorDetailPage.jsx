import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Briefcase,
  Sparkles,
  Clock3,
  FileText,
  Globe,
  Languages,
  GraduationCap,
  MapPin,
  Award,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getProfessorPublicProfile } from "../../api/usersService";
import { useToast } from "../../contexts/ToastContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import EmptyState from "../../components/common/EmptyState";
import ProfileSectionModal from "../../components/profile/ProfileSectionModal";
import { getApiErrorMessage } from "../../utils/errorUtils";
import {
  availabilityOptions,
  workModeOptions,
  contractTypeOptions,
} from "../../utils/enumOptions";
import "./ProfessorDetailPage.css";

function sanitizeWhatsAppNumber(value) {
  return (value || "").replace(/\D/g, "");
}

function getEnumLabel(options, value) {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }

  return (
    options.find((option) => Number(option.value) === Number(value))?.label ||
    "No especificado"
  );
}

function formatDate(value) {
  if (!value) return "No especificada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No especificada";
  return date.toLocaleDateString();
}

function formatRange(startDate, endDate, isCurrent = false) {
  const start = startDate ? formatDate(startDate) : "Inicio no especificado";
  if (isCurrent) return `${start} - Actualidad`;
  const end = endDate ? formatDate(endDate) : "Actualidad";
  return `${start} - ${end}`;
}

function ProfessorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [openModal, setOpenModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [professor, setProfessor] = useState(null);

  useEffect(() => {
    const loadProfessor = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProfessorPublicProfile(id);
        setProfessor(data);
      } catch (err) {
        setError(
          getApiErrorMessage(err, "No se pudo cargar el perfil del profesor."),
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfessor();
  }, [id]);

  const closeSectionModal = () => {
    setOpenModal(null);
  };

  const openSectionModal = (modalName) => {
    setOpenModal(modalName);
  };

  const fullName = useMemo(() => {
    if (!professor) return "Profesor";
    return (
      `${professor.firstName || ""} ${professor.lastName || ""}`.trim() ||
      "Profesor"
    );
  }, [professor]);

  const titleText = useMemo(() => {
    return professor?.title || "Profesor de educación física";
  }, [professor]);

  const whatsappNumbers = useMemo(() => {
    if (!professor) return [];

    return [
      professor.whatsApp1,
      professor.whatsApp2,
      professor.whatsApp3,
    ].filter(Boolean);
  }, [professor]);

  const primaryWhatsapp = useMemo(() => {
    if (!professor) return "";

    return sanitizeWhatsAppNumber(
      professor.whatsApp1 || professor.whatsApp2 || professor.whatsApp3 || "",
    );
  }, [professor]);

  const aboutText = useMemo(() => {
    return (
      professor?.aboutMe ||
      "Este profesor todavía no cargó una presentación pública."
    );
  }, [professor]);

  const locationText = useMemo(() => {
    if (!professor) return "No informada";

    return (
      [professor.city, professor.province, professor.country]
        .filter(Boolean)
        .join(", ") || "No informada"
    );
  }, [professor]);

  const languages = useMemo(() => {
    if (!professor?.languages) return [];
    return professor.languages
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [professor]);

  const experiences = useMemo(
    () => (Array.isArray(professor?.experiences) ? professor.experiences : []),
    [professor],
  );

  const educations = useMemo(
    () => (Array.isArray(professor?.educations) ? professor.educations : []),
    [professor],
  );

  const certifications = useMemo(
    () =>
      Array.isArray(professor?.certifications) ? professor.certifications : [],
    [professor],
  );

  const skills = useMemo(
    () => (Array.isArray(professor?.skills) ? professor.skills : []),
    [professor],
  );

  const openWhatsAppChat = () => {
    if (!primaryWhatsapp) {
      showToast("No hay un número de WhatsApp cargado.", "error");
      return;
    }

    window.open(`https://wa.me/${primaryWhatsapp}`, "_blank");
  };

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingSpinner text="Cargando perfil..." />
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="page-shell professor-detail">
        <ApiMessage type="error">
          {error || "No se encontró el perfil del profesor."}
        </ApiMessage>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell professor-detail">
      <Card className="professor-detail__top-card">
        <div className="professor-detail__top-card-content">
          <h1>{fullName}</h1>
          <h2>{titleText}</h2>
        </div>
      </Card>

      <Card className="professor-detail__section">
        <div className="professor-detail__section-title-wrap">
          <h3>Presentación</h3>
        </div>

        <p className="professor-detail__summary-long">{aboutText}</p>

        <div className="linkedin-profile__hero-actions">
          <Button
            type="button"
            variant="secondary"
            icon={<Mail size={16} />}
            onClick={() => openSectionModal("contactInfoView")}
          >
            Contactar
          </Button>

          <button
            type="button"
            className="linkedin-profile__whatsapp-button"
            onClick={openWhatsAppChat}
            aria-label="Abrir WhatsApp"
            title="Abrir WhatsApp"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </Card>

      <Card className="professor-detail__section">
        <div className="professor-detail__section-title-wrap">
          <Briefcase size={20} />
          <h3>Experiencia</h3>
        </div>

        {experiences.length ? (
          <div className="professor-detail__stack">
            {experiences.map((experience) => (
              <div key={experience.id} className="professor-detail__item-card">
                <h4>{experience.position || "Puesto no especificado"}</h4>
                <p className="professor-detail__item-subtitle">
                  {experience.companyName || "Empresa no especificada"}
                </p>
                <span className="professor-detail__item-range">
                  {formatRange(
                    experience.startDate,
                    experience.endDate,
                    experience.isCurrent,
                  )}
                </span>
                <p className="professor-detail__item-description">
                  {experience.description || "Sin descripción."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin experiencia cargada"
            description="Este profesor todavía no informó experiencia laboral."
          />
        )}
      </Card>

      <Card className="professor-detail__section">
        <div className="professor-detail__section-title-wrap">
          <GraduationCap size={20} />
          <h3>Educación</h3>
        </div>

        {educations.length ? (
          <div className="professor-detail__stack">
            {educations.map((education) => (
              <div key={education.id} className="professor-detail__item-card">
                <h4>{education.title || "Título no especificado"}</h4>
                <p className="professor-detail__item-subtitle">
                  {education.institutionName || "Institución no especificada"}
                </p>
                <span className="professor-detail__item-range">
                  {formatRange(education.startDate, education.endDate)}
                </span>
                <p className="professor-detail__item-description">
                  {education.description ||
                    education.status ||
                    "Sin descripción."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin educación cargada"
            description="Este profesor todavía no informó formación académica."
          />
        )}
      </Card>

      <Card className="professor-detail__section">
        <div className="professor-detail__section-title-wrap">
          <Award size={20} />
          <h3>Certificaciones</h3>
        </div>

        {certifications.length ? (
          <div className="professor-detail__stack">
            {certifications.map((certification) => (
              <div
                key={certification.id}
                className="professor-detail__item-card"
              >
                <h4>{certification.name || "Certificación"}</h4>
                <p className="professor-detail__item-subtitle">
                  {certification.issuer || "Emisor no especificado"}
                </p>
                <span className="professor-detail__item-range">
                  {formatDate(certification.issueDate)}
                </span>
                <p className="professor-detail__item-description">
                  {certification.credentialUrl || "Sin enlace de credencial."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin certificaciones cargadas"
            description="Este profesor todavía no informó certificaciones."
          />
        )}
      </Card>

      <Card className="professor-detail__section">
        <div className="professor-detail__section-title-wrap">
          <Sparkles size={20} />
          <h3>Aptitudes</h3>
        </div>

        {skills.length ? (
          <div className="professor-detail__chips">
            {skills.map((skill) => (
              <span key={skill.id} className="professor-detail__chip">
                {skill.name}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin aptitudes cargadas"
            description="Este profesor todavía no informó aptitudes."
          />
        )}
      </Card>

      <Card className="professor-detail__section">
        <div className="professor-detail__section-title-wrap">
          <Languages size={20} />
          <h3>Idiomas</h3>
        </div>

        {languages.length ? (
          <div className="professor-detail__chips">
            {languages.map((language) => (
              <span key={language} className="professor-detail__chip">
                {language}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin idiomas cargados"
            description="Este profesor todavía no informó idiomas."
          />
        )}
      </Card>

      <ProfileSectionModal
        open={openModal === "contactInfoView"}
        onClose={closeSectionModal}
        title="Información de contacto"
        subtitle="Datos de contacto visibles del profesor."
      >
        <div className="linkedin-profile__contact-modal">
          {[professor.whatsApp1, professor.whatsApp2, professor.whatsApp3]
            .map((whatsapp, index) => ({
              value: whatsapp,
              label: `WhatsApp ${index + 1}`,
            }))
            .filter((item) => item.value)
            .map((item) => (
              <div key={item.label} className="professor-detail__detail-card">
                <Phone size={16} />
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
              </div>
            ))}

          <div className="professor-detail__detail-card">
            <MapPin size={16} />
            <div>
              <strong>Ubicación</strong>

              <span>{locationText}</span>
            </div>
          </div>

          {professor.address ? (
            <div className="professor-detail__detail-card">
              <MapPin size={16} />
              <div>
                <strong>Dirección</strong>
                <span>{professor.address}</span>
              </div>
            </div>
          ) : null}

          {professor.preferredZone ? (
            <div className="professor-detail__detail-card">
              <Briefcase size={16} />
              <div>
                <strong>Zona preferida</strong>

                <span>{professor.preferredZone}</span>
              </div>
            </div>
          ) : null}

          {!whatsappNumbers.length &&
          locationText === "No informada" &&
          !professor.address &&
          !professor.preferredZone ? (
            <EmptyState
              title="Sin contacto cargado"
              description="Todavía no hay datos de contacto visibles."
            />
          ) : null}

          <div className="professor-detail__detail-card">
            <Clock3 size={16} />
            <div>
              <strong>Disponibilidad</strong>
              <span>
                {getEnumLabel(availabilityOptions, professor.availability)}
              </span>
            </div>
          </div>

          <div className="professor-detail__detail-card">
            <Briefcase size={16} />
            <div>
              <strong>Modalidad</strong>
              <span>
                {getEnumLabel(workModeOptions, professor.workModePreference)}
              </span>
            </div>
          </div>

          <div className="professor-detail__detail-card">
            <FileText size={16} />
            <div>
              <strong>Tipo de contrato</strong>
              <span>
                {getEnumLabel(
                  contractTypeOptions,
                  professor.contractPreference,
                )}
              </span>
            </div>
          </div>
        </div>
      </ProfileSectionModal>
    </div>
  );
}

export default ProfessorDetailPage;
