import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Languages,
  Plus,
  Pencil,
  Trash2,
  MessageCircle,
  Star,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getMyUser, updateUser } from "../../api/usersService";
import {
  getProfessorExperiences,
  createProfessorExperience,
  deleteProfessorExperience,
} from "../../api/professorExperiencesService";
import {
  getProfessorEducations,
  createProfessorEducation,
  deleteProfessorEducation,
} from "../../api/professorEducationsService";
import {
  getProfessorCertifications,
  createProfessorCertification,
  deleteProfessorCertification,
} from "../../api/professorCertificationsService";
import {
  getProfessorSkills,
  createProfessorSkill,
  deleteProfessorSkill,
} from "../../api/professorSkillsService";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
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
import "./ProfessorProfilePage.css";

function sanitizeWhatsAppNumber(value) {
  return (value || "").replace(/\D/g, "");
}

function buildUserUpdatePayload(base) {
  return {
    firstName: base.firstName || null,
    lastName: base.lastName || null,
    title: base.title || null,
    aboutMe: base.aboutMe || null,
    languages: base.languages || null,
    whatsApp1: base.whatsApp1 || null,
    whatsApp2: base.whatsApp2 || null,
    whatsApp3: base.whatsApp3 || null,
    country: base.country || null,
    province: base.province || null,
    city: base.city || null,
    address: base.address || null,
    preferredZone: base.preferredZone || null,
    availability:
      base.availability === "" ||
      base.availability === null ||
      base.availability === undefined
        ? null
        : Number(base.availability),
    workModePreference:
      base.workModePreference === "" ||
      base.workModePreference === null ||
      base.workModePreference === undefined
        ? null
        : Number(base.workModePreference),
    contractPreference:
      base.contractPreference === "" ||
      base.contractPreference === null ||
      base.contractPreference === undefined
        ? null
        : Number(base.contractPreference),
  };
}

function getProfileFormValues(data) {
  return {
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    title: data.title || "",
    aboutMe: data.aboutMe || "",
    languages: data.languages || "",
    city: data.city || "",
    province: data.province || "",
    country: data.country || "",
    address: data.address || "",
    preferredZone: data.preferredZone || "",
    availability: data.availability ?? "",
    workModePreference: data.workModePreference ?? "",
    contractPreference: data.contractPreference ?? "",
    whatsApp1: data.whatsApp1 || "",
    whatsApp2: data.whatsApp2 || "",
    whatsApp3: data.whatsApp3 || "",
  };
}

const availabilityOptionsWithEmpty = [
  { value: "", label: "No especificado" },
  ...availabilityOptions,
];

const workModeOptionsWithEmpty = [
  { value: "", label: "No especificado" },
  ...workModeOptions,
];

const contractTypeOptionsWithEmpty = [
  { value: "", label: "No especificado" },
  ...contractTypeOptions,
];

function ProfessorProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sectionError, setSectionError] = useState("");
  const [openModal, setOpenModal] = useState(null);

  const [savingProfileSection, setSavingProfileSection] = useState("");
  const [savingLanguages, setSavingLanguages] = useState(false);

  const [addingExperience, setAddingExperience] = useState(false);
  const [addingEducation, setAddingEducation] = useState(false);
  const [addingCertification, setAddingCertification] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);

  const [deletingExperienceId, setDeletingExperienceId] = useState(null);
  const [deletingEducationId, setDeletingEducationId] = useState(null);
  const [deletingCertificationId, setDeletingCertificationId] = useState(null);
  const [deletingSkillId, setDeletingSkillId] = useState(null);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    title: "",
    aboutMe: "",
    languages: "",
    city: "",
    province: "",
    country: "",
    address: "",
    preferredZone: "",
    availability: "",
    workModePreference: "",
    contractPreference: "",
    whatsApp1: "",
    whatsApp2: "",
    whatsApp3: "",
  });

  const [basicInfoForm, setBasicInfoForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    aboutMe: "",
    city: "",
    province: "",
    country: "",
    address: "",
    preferredZone: "",
    availability: "",
    workModePreference: "",
    contractPreference: "",
  });

  const [contactForm, setContactForm] = useState({
    whatsApp1: "",
    whatsApp2: "",
    whatsApp3: "",
  });

  const [languagesForm, setLanguagesForm] = useState({
    languages: "",
  });

  const [experienceForm, setExperienceForm] = useState({
    institutionName: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [educationForm, setEducationForm] = useState({
    institutionName: "",
    title: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [certificationForm, setCertificationForm] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  });

  const [skillForm, setSkillForm] = useState({
    name: "",
  });

  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [skills, setSkills] = useState([]);

  const fullName = useMemo(() => {
    return (
      `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
      "Nombre del profesor"
    );
  }, [profile.firstName, profile.lastName]);

  const shortDescription = useMemo(() => {
    return profile.title || "Profesor/a de educación física";
  }, [profile.title]);

  const longDescription = useMemo(() => {
    return (
      profile.aboutMe ||
      "Completá tu descripción profesional para mostrar mejor tu perfil, tu experiencia y tu propuesta de valor."
    );
  }, [profile.aboutMe]);

  const languageChips = useMemo(() => {
    return (profile.languages || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [profile.languages]);

  const whatsappNumbers = useMemo(() => {
    return [profile.whatsApp1, profile.whatsApp2, profile.whatsApp3].filter(
      Boolean,
    );
  }, [profile.whatsApp1, profile.whatsApp2, profile.whatsApp3]);

  const primaryWhatsapp = useMemo(() => {
    return sanitizeWhatsAppNumber(
      profile.whatsApp1 || profile.whatsApp2 || profile.whatsApp3 || "",
    );
  }, [profile.whatsApp1, profile.whatsApp2, profile.whatsApp3]);

  const availabilityLabel = useMemo(() => {
    if (
      profile.availability === "" ||
      profile.availability === null ||
      profile.availability === undefined
    ) {
      return "No especificado";
    }

    return (
      availabilityOptions.find(
        (x) => Number(x.value) === Number(profile.availability),
      )?.label || "No especificado"
    );
  }, [profile.availability]);

  const workModeLabel = useMemo(() => {
    if (
      profile.workModePreference === "" ||
      profile.workModePreference === null ||
      profile.workModePreference === undefined
    ) {
      return "No especificado";
    }

    return (
      workModeOptions.find(
        (x) => Number(x.value) === Number(profile.workModePreference),
      )?.label || "No especificado"
    );
  }, [profile.workModePreference]);

  const contractPreferenceLabel = useMemo(() => {
    if (
      profile.contractPreference === "" ||
      profile.contractPreference === null ||
      profile.contractPreference === undefined
    ) {
      return "No especificado";
    }

    return (
      contractTypeOptions.find(
        (x) => Number(x.value) === Number(profile.contractPreference),
      )?.label || "No especificado"
    );
  }, [profile.contractPreference]);

  const resetExperienceForm = () => {
    setExperienceForm({
      institutionName: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  const resetEducationForm = () => {
    setEducationForm({
      institutionName: "",
      title: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  const resetCertificationForm = () => {
    setCertificationForm({
      name: "",
      issuer: "",
      issueDate: "",
      credentialUrl: "",
    });
  };

  const resetSkillForm = () => {
    setSkillForm({
      name: "",
    });
  };

  const syncFormsFromProfile = (data) => {
    const normalized = getProfileFormValues(data);

    setProfile(normalized);

    setBasicInfoForm({
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      title: normalized.title,
      aboutMe: normalized.aboutMe,
      city: normalized.city,
      province: normalized.province,
      country: normalized.country,
      address: normalized.address,
      preferredZone: normalized.preferredZone,
      availability: normalized.availability,
      workModePreference: normalized.workModePreference,
      contractPreference: normalized.contractPreference,
    });

    setContactForm({
      whatsApp1: normalized.whatsApp1,
      whatsApp2: normalized.whatsApp2,
      whatsApp3: normalized.whatsApp3,
    });

    setLanguagesForm({
      languages: normalized.languages,
    });
  };

  const syncEditableFormsFromCurrentProfile = () => {
    setBasicInfoForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      title: profile.title,
      aboutMe: profile.aboutMe,
      city: profile.city,
      province: profile.province,
      country: profile.country,
      address: profile.address,
      preferredZone: profile.preferredZone,
      availability: profile.availability,
      workModePreference: profile.workModePreference,
      contractPreference: profile.contractPreference,
    });

    setContactForm({
      whatsApp1: profile.whatsApp1,
      whatsApp2: profile.whatsApp2,
      whatsApp3: profile.whatsApp3,
    });

    setLanguagesForm({
      languages: profile.languages,
    });
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    setSectionError("");

    try {
      const [userData, exp, edu, cert, skill] = await Promise.all([
        getMyUser(user.id),
        getProfessorExperiences(user.id),
        getProfessorEducations(user.id),
        getProfessorCertifications(user.id),
        getProfessorSkills(user.id),
      ]);

      syncFormsFromProfile(userData);
      setExperiences(exp);
      setEducations(edu);
      setCertifications(cert);
      setSkills(skill);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "No se pudo cargar el perfil del profesor."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [user.id]);

  const openSectionModal = (modalName) => {
    setSectionError("");

    if (
      [
        "nameInfo",
        "aboutInfo",
        "contactInfo",
        "preferencesInfo",
        "languages",
        "contactInfoView",
      ].includes(modalName)
    ) {
      syncEditableFormsFromCurrentProfile();
    }

    setOpenModal(modalName);
  };

  const closeSectionModal = () => {
    setSectionError("");
    setOpenModal(null);
  };

  const handleBasicInfoChange = (event) => {
    const { name, value, type, checked } = event.target;

    setBasicInfoForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContactChange = (event) => {
    setContactForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleLanguagesChange = (event) => {
    setLanguagesForm({
      languages: event.target.value,
    });
  };

  const getSectionSuccessMessage = (sectionName) => {
    const messages = {
      nameInfo: "Nombre y título actualizados.",
      aboutInfo: "Presentación actualizada.",
      contactInfo: "Información de contacto actualizada.",
      preferencesInfo: "Preferencias laborales actualizadas.",
    };

    return messages[sectionName] || "Perfil actualizado.";
  };

  const saveProfileSection = async (event, sectionName) => {
    event.preventDefault();
    if (savingProfileSection) return;

    setSectionError("");
    setSavingProfileSection(sectionName);

    try {
      const nextProfile = {
        ...profile,
        ...basicInfoForm,
        ...contactForm,
      };

      const payload = buildUserUpdatePayload(nextProfile);

      await updateUser(user.id, payload);

      setProfile(nextProfile);
      showToast(getSectionSuccessMessage(sectionName), "success");
      closeSectionModal();
    } catch (err) {
      console.error(
        "PUT professor profile section error:",
        err.response?.data || err,
      );
      setSectionError(
        getApiErrorMessage(err, "No se pudo actualizar esta sección."),
      );
    } finally {
      setSavingProfileSection("");
    }
  };

  const saveLanguages = async (event) => {
    event.preventDefault();
    if (savingLanguages) return;

    setSectionError("");
    setSavingLanguages(true);

    try {
      const payload = buildUserUpdatePayload({
        ...profile,
        languages: languagesForm.languages,
      });

      await updateUser(user.id, payload);

      const nextProfile = {
        ...profile,
        languages: languagesForm.languages,
      };

      setProfile(nextProfile);
      showToast("Idiomas actualizados.", "success");
      closeSectionModal();
    } catch (err) {
      console.error("PUT languages error:", err.response?.data || err);
      setSectionError(
        getApiErrorMessage(err, "No se pudieron actualizar los idiomas."),
      );
    } finally {
      setSavingLanguages(false);
    }
  };

  const handleExperienceChange = (event) => {
    setExperienceForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEducationChange = (event) => {
    setEducationForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCertificationChange = (event) => {
    setCertificationForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSkillChange = (event) => {
    setSkillForm({
      name: event.target.value,
    });
  };

  const addExperience = async (event) => {
    event.preventDefault();
    if (addingExperience) return;

    setSectionError("");
    setAddingExperience(true);

    try {
      const created = await createProfessorExperience({
        userId: user.id,
        institutionName: experienceForm.institutionName,
        position: experienceForm.position,
        sportId: null,
        startDate: experienceForm.startDate || null,
        endDate: experienceForm.endDate || null,
        description: experienceForm.description || null,
      });

      setExperiences((current) => [created, ...current]);
      resetExperienceForm();
      showToast("Experiencia agregada.", "success");
      closeSectionModal();
    } catch (err) {
      setSectionError(
        getApiErrorMessage(err, "No se pudo agregar la experiencia."),
      );
    } finally {
      setAddingExperience(false);
    }
  };

  const addEducation = async (event) => {
    event.preventDefault();
    if (addingEducation) return;

    setSectionError("");
    setAddingEducation(true);

    try {
      const created = await createProfessorEducation({
        userId: user.id,
        institutionName: educationForm.institutionName,
        title: educationForm.title,
        startDate: educationForm.startDate || null,
        endDate: educationForm.endDate || null,
        description: educationForm.description || null,
      });

      setEducations((current) => [created, ...current]);
      resetEducationForm();
      showToast("Educación agregada.", "success");
      closeSectionModal();
    } catch (err) {
      setSectionError(
        getApiErrorMessage(err, "No se pudo agregar la educación."),
      );
    } finally {
      setAddingEducation(false);
    }
  };

  const addCertification = async (event) => {
    event.preventDefault();
    if (addingCertification) return;

    setSectionError("");
    setAddingCertification(true);

    try {
      const created = await createProfessorCertification({
        userId: user.id,
        name: certificationForm.name,
        issuer: certificationForm.issuer || null,
        issueDate: certificationForm.issueDate || null,
        credentialUrl: certificationForm.credentialUrl || null,
      });

      setCertifications((current) => [created, ...current]);
      resetCertificationForm();
      showToast("Certificación agregada.", "success");
      closeSectionModal();
    } catch (err) {
      setSectionError(
        getApiErrorMessage(err, "No se pudo agregar la certificación."),
      );
    } finally {
      setAddingCertification(false);
    }
  };

  const addSkill = async (event) => {
    event.preventDefault();
    if (addingSkill) return;

    setSectionError("");
    setAddingSkill(true);

    try {
      const created = await createProfessorSkill({
        userId: user.id,
        name: skillForm.name,
      });

      setSkills((current) => [created, ...current]);
      resetSkillForm();
      showToast("Aptitud agregada.", "success");
      closeSectionModal();
    } catch (err) {
      setSectionError(
        getApiErrorMessage(err, "No se pudo agregar la aptitud."),
      );
    } finally {
      setAddingSkill(false);
    }
  };

  const removeExperience = async (id) => {
    if (deletingExperienceId) return;

    try {
      setDeletingExperienceId(id);
      await deleteProfessorExperience(id);
      setExperiences((current) => current.filter((item) => item.id !== id));
      showToast("Experiencia eliminada.", "info");
    } catch (err) {
      setSectionError(
        getApiErrorMessage(err, "No se pudo eliminar la experiencia."),
      );
    } finally {
      setDeletingExperienceId(null);
    }
  };

  const removeEducation = async (id) => {
    if (deletingEducationId) return;

    try {
      setDeletingEducationId(id);
      await deleteProfessorEducation(id);
      setEducations((current) => current.filter((item) => item.id !== id));
      showToast("Educación eliminada.", "info");
    } catch (err) {
      setSectionError(
        getApiErrorMessage(err, "No se pudo eliminar la educación."),
      );
    } finally {
      setDeletingEducationId(null);
    }
  };

  const removeCertification = async (id) => {
    if (deletingCertificationId) return;

    try {
      setDeletingCertificationId(id);
      await deleteProfessorCertification(id);
      setCertifications((current) => current.filter((item) => item.id !== id));
      showToast("Certificación eliminada.", "info");
    } catch (err) {
      setSectionError(
        getApiErrorMessage(err, "No se pudo eliminar la certificación."),
      );
    } finally {
      setDeletingCertificationId(null);
    }
  };

  const removeSkill = async (id) => {
    if (deletingSkillId) return;

    try {
      setDeletingSkillId(id);
      await deleteProfessorSkill(id);
      setSkills((current) => current.filter((item) => item.id !== id));
      showToast("Aptitud eliminada.", "info");
    } catch (err) {
      setSectionError(
        getApiErrorMessage(err, "No se pudo eliminar la aptitud."),
      );
    } finally {
      setDeletingSkillId(null);
    }
  };

  const openWhatsAppChat = () => {
    if (!primaryWhatsapp) {
      showToast("No hay un número de WhatsApp principal cargado.", "error");
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

  return (
    <div className="page-shell linkedin-profile">
      <ApiMessage type="error">{error}</ApiMessage>
      <ApiMessage type="error">{sectionError}</ApiMessage>

      <Card className="linkedin-profile__top-card">
        <div className="linkedin-profile__top-card-content">
          <div className="linkedin-profile__name-row">
            <div>
              <h1>{fullName}</h1>
              <h2>{shortDescription}</h2>
            </div>

            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("nameInfo")}
              aria-label="Editar nombre y título"
              title="Editar nombre y título"
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>
      </Card>

      <Card className="linkedin-profile__section">
        <div className="linkedin-profile__section-header">
          <div className="linkedin-profile__section-title-wrap">
            <h3>Presentación</h3>
          </div>

          <div className="linkedin-profile__icon-actions">
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("aboutInfo")}
              aria-label="Editar presentación"
              title="Editar presentación"
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        <div className="linkedin-profile__summary-block">
          <p className="linkedin-profile__summary-long">{longDescription}</p>
        </div>

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

      <Card className="linkedin-profile__section">
        <div className="linkedin-profile__section-header">
          <div className="linkedin-profile__section-title-wrap">
            <Star size={20} />
            <h3>Preferencias</h3>
          </div>

          <div className="linkedin-profile__icon-actions">
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("preferencesInfo")}
              aria-label="Editar preferencias"
              title="Editar preferencias"
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        <div className="linkedin-profile__details-grid">
          <div className="linkedin-profile__detail-card">
            <div>
              <strong>Zona preferida</strong>
              <span>{profile.preferredZone || "No informada"}</span>
            </div>
          </div>

          <div className="linkedin-profile__detail-card">
            <div>
              <strong>Disponibilidad</strong>
              <span>{availabilityLabel}</span>
            </div>
          </div>

          <div className="linkedin-profile__detail-card">
            <div>
              <strong>Modalidad</strong>
              <span>{workModeLabel}</span>
            </div>
          </div>

          <div className="linkedin-profile__detail-card">
            <div>
              <strong>Tipo de contrato</strong>
              <span>{contractPreferenceLabel}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="linkedin-profile__section">
        <div className="linkedin-profile__section-header">
          <div className="linkedin-profile__section-title-wrap">
            <Briefcase size={20} />
            <h3>Experiencia</h3>
          </div>

          <div className="linkedin-profile__icon-actions">
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("addExperience")}
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("manageExperience")}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        {experiences.length ? (
          <div className="linkedin-profile__list">
            {experiences.map((item) => (
              <div key={item.id} className="linkedin-profile__list-item">
                <div>
                  <strong>{item.position}</strong>
                  <p>{item.institutionName}</p>
                  <span>
                    {item.startDate || "Sin fecha"} -{" "}
                    {item.endDate || "Actualidad"}
                  </span>
                  {item.description ? <small>{item.description}</small> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin experiencias"
            description="Agregá tu primera experiencia laboral."
          />
        )}
      </Card>

      <Card className="linkedin-profile__section">
        <div className="linkedin-profile__section-header">
          <div className="linkedin-profile__section-title-wrap">
            <GraduationCap size={20} />
            <h3>Educación</h3>
          </div>

          <div className="linkedin-profile__icon-actions">
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("addEducation")}
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("manageEducation")}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        {educations.length ? (
          <div className="linkedin-profile__list">
            {educations.map((item) => (
              <div key={item.id} className="linkedin-profile__list-item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.institutionName}</p>
                  {item.description ? <small>{item.description}</small> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin educación cargada"
            description="Agregá tus estudios y formación."
          />
        )}
      </Card>

      <Card className="linkedin-profile__section">
        <div className="linkedin-profile__section-header">
          <div className="linkedin-profile__section-title-wrap">
            <Award size={20} />
            <h3>Certificaciones</h3>
          </div>

          <div className="linkedin-profile__icon-actions">
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("addCertification")}
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("manageCertification")}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        {certifications.length ? (
          <div className="linkedin-profile__list">
            {certifications.map((item) => (
              <div key={item.id} className="linkedin-profile__list-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.issuer || "Emisor no informado"}</p>
                  <span>{item.issueDate || "Fecha no informada"}</span>
                  {item.credentialUrl ? (
                    <small>{item.credentialUrl}</small>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin certificaciones"
            description="Agregá tus credenciales y certificados."
          />
        )}
      </Card>

      <Card className="linkedin-profile__section">
        <div className="linkedin-profile__section-header">
          <div className="linkedin-profile__section-title-wrap">
            <Sparkles size={20} />
            <h3>Aptitudes</h3>
          </div>

          <div className="linkedin-profile__icon-actions">
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("addSkill")}
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("manageSkill")}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        {skills.length ? (
          <div className="linkedin-profile__skills">
            {skills.map((item) => (
              <div key={item.id} className="linkedin-profile__skill-chip">
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin aptitudes"
            description="Agregá tus aptitudes como chips visuales."
          />
        )}
      </Card>

      <Card className="linkedin-profile__section">
        <div className="linkedin-profile__section-header">
          <div className="linkedin-profile__section-title-wrap">
            <Languages size={20} />
            <h3>Idiomas</h3>
          </div>

          <div className="linkedin-profile__icon-actions">
            <button
              type="button"
              className="linkedin-profile__icon-button"
              onClick={() => openSectionModal("languages")}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        {languageChips.length ? (
          <div className="linkedin-profile__languages">
            {languageChips.map((language, index) => (
              <span
                key={`${language}-${index}`}
                className="linkedin-profile__language-pill"
              >
                {language}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin idiomas cargados"
            description="Agregá idiomas escribiéndolos separados por coma."
          />
        )}
      </Card>

      <ProfileSectionModal
        open={openModal === "contactInfoView"}
        onClose={closeSectionModal}
        title=""
        subtitle=""
      >
        <Card className="linkedin-profile__section">
          <div className="linkedin-profile__section-header">
            <div className="linkedin-profile__section-title-wrap">
              <h3>Información de contacto</h3>
            </div>

            <div className="linkedin-profile__icon-actions">
              <button
                type="button"
                className="linkedin-profile__icon-button"
                onClick={() => openSectionModal("contactInfo")}
                aria-label="Editar contacto"
                title="Editar contacto"
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          <div className="linkedin-profile__details-grid">
            {profile.whatsApp1 ? (
              <div className="linkedin-profile__detail-card">
                <Phone size={16} />
                <div>
                  <strong>WhatsApp 1</strong>
                  <span>{profile.whatsApp1}</span>
                </div>
              </div>
            ) : null}

            {profile.whatsApp2 ? (
              <div className="linkedin-profile__detail-card">
                <Phone size={16} />
                <div>
                  <strong>WhatsApp 2</strong>
                  <span>{profile.whatsApp2}</span>
                </div>
              </div>
            ) : null}

            {profile.whatsApp3 ? (
              <div className="linkedin-profile__detail-card">
                <Phone size={16} />
                <div>
                  <strong>WhatsApp 3</strong>
                  <span>{profile.whatsApp3}</span>
                </div>
              </div>
            ) : null}

            <div className="linkedin-profile__detail-card">
              <MapPin size={16} />
              <div>
                <strong>Ubicación</strong>
                <span>
                  {[profile.city, profile.province, profile.country]
                    .filter(Boolean)
                    .join(", ") || "No informada"}
                </span>
              </div>
            </div>

            <div className="linkedin-profile__detail-card">
              <MapPin size={16} />
              <div>
                <strong>Dirección</strong>
                <span>{profile.address || "No informada"}</span>
              </div>
            </div>
          </div>
        </Card>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "nameInfo"}
        onClose={closeSectionModal}
        title="Editar nombre y título"
        subtitle="Actualizá cómo se muestra tu nombre y tu descripción corta."
      >
        <form
          className="linkedin-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "nameInfo")}
        >
          <div className="linkedin-profile__grid">
            <InputField
              label="Nombre"
              name="firstName"
              value={basicInfoForm.firstName}
              onChange={handleBasicInfoChange}
            />
            <InputField
              label="Apellido"
              name="lastName"
              value={basicInfoForm.lastName}
              onChange={handleBasicInfoChange}
            />
          </div>

          <InputField
            label="Título o descripción corta"
            name="title"
            value={basicInfoForm.title}
            onChange={handleBasicInfoChange}
            placeholder="Ej: Profesor/a de educación física"
          />

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingProfileSection === "nameInfo"}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={savingProfileSection === "nameInfo"}
            >
              {savingProfileSection === "nameInfo" ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "aboutInfo"}
        onClose={closeSectionModal}
        title="Editar presentación"
        subtitle="Contá quién sos, tu experiencia y tu propuesta profesional."
      >
        <form
          className="linkedin-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "aboutInfo")}
        >
          <InputField
            label="Sobre mí"
            name="aboutMe"
            textarea
            value={basicInfoForm.aboutMe}
            onChange={handleBasicInfoChange}
            placeholder="Ej: Soy profesor/a con experiencia en entrenamiento funcional, grupos deportivos y preparación física..."
          />

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingProfileSection === "aboutInfo"}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={savingProfileSection === "aboutInfo"}
            >
              {savingProfileSection === "aboutInfo"
                ? "Guardando..."
                : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "contactInfo"}
        onClose={closeSectionModal}
        title="Editar contacto"
        subtitle="Actualizá tus números de WhatsApp y tu ubicación."
      >
        <form
          className="linkedin-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "contactInfo")}
        >
          <div className="linkedin-profile__grid">
            <InputField
              label="WhatsApp 1"
              name="whatsApp1"
              value={contactForm.whatsApp1}
              onChange={handleContactChange}
            />
            <InputField
              label="WhatsApp 2"
              name="whatsApp2"
              value={contactForm.whatsApp2}
              onChange={handleContactChange}
            />
          </div>

          <InputField
            label="WhatsApp 3"
            name="whatsApp3"
            value={contactForm.whatsApp3}
            onChange={handleContactChange}
          />

          <div className="linkedin-profile__grid">
            <InputField
              label="Ciudad"
              name="city"
              value={basicInfoForm.city}
              onChange={handleBasicInfoChange}
            />
            <InputField
              label="Provincia"
              name="province"
              value={basicInfoForm.province}
              onChange={handleBasicInfoChange}
            />
          </div>

          <div className="linkedin-profile__grid">
            <InputField
              label="País"
              name="country"
              value={basicInfoForm.country}
              onChange={handleBasicInfoChange}
            />
            <InputField
              label="Dirección"
              name="address"
              value={basicInfoForm.address}
              onChange={handleBasicInfoChange}
            />
          </div>

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingProfileSection === "contactInfo"}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={savingProfileSection === "contactInfo"}
            >
              {savingProfileSection === "contactInfo"
                ? "Guardando..."
                : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "preferencesInfo"}
        onClose={closeSectionModal}
        title="Editar preferencias"
      >
        <form
          className="linkedin-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "preferencesInfo")}
        >
          <InputField
            label="Zona preferida"
            name="preferredZone"
            value={basicInfoForm.preferredZone}
            onChange={handleBasicInfoChange}
            placeholder="Ej: Rosario centro, zona norte, modalidad online..."
          />

          <div className="linkedin-profile__grid">
            <SelectField
              label="Disponibilidad"
              name="availability"
              value={basicInfoForm.availability}
              onChange={handleBasicInfoChange}
              options={availabilityOptionsWithEmpty}
            />
            <SelectField
              label="Modalidad"
              name="workModePreference"
              value={basicInfoForm.workModePreference}
              onChange={handleBasicInfoChange}
              options={workModeOptionsWithEmpty}
            />
          </div>

          <SelectField
            label="Tipo de contrato"
            name="contractPreference"
            value={basicInfoForm.contractPreference}
            onChange={handleBasicInfoChange}
            options={contractTypeOptionsWithEmpty}
          />

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingProfileSection === "preferencesInfo"}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={savingProfileSection === "preferencesInfo"}
            >
              {savingProfileSection === "preferencesInfo"
                ? "Guardando..."
                : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "languages"}
        onClose={closeSectionModal}
        title="Editar idiomas"
        subtitle="Escribí los idiomas en una sola línea, separados por coma."
      >
        <form className="linkedin-profile__modal-form" onSubmit={saveLanguages}>
          <InputField
            label="Idiomas"
            name="languages"
            value={languagesForm.languages}
            onChange={handleLanguagesChange}
            placeholder="Español, Inglés, Portugués"
          />

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingLanguages}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={savingLanguages}>
              {savingLanguages ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "addExperience"}
        onClose={addingExperience ? () => {} : closeSectionModal}
        title="Agregar experiencia"
        subtitle="Sumá una nueva experiencia laboral."
      >
        <form className="linkedin-profile__modal-form" onSubmit={addExperience}>
          <div className="linkedin-profile__grid">
            <InputField
              label="Institución"
              name="institutionName"
              value={experienceForm.institutionName}
              onChange={handleExperienceChange}
            />
            <InputField
              label="Puesto"
              name="position"
              value={experienceForm.position}
              onChange={handleExperienceChange}
            />
          </div>

          <div className="linkedin-profile__grid">
            <InputField
              label="Fecha inicio"
              name="startDate"
              type="date"
              value={experienceForm.startDate}
              onChange={handleExperienceChange}
            />
            <InputField
              label="Fecha fin"
              name="endDate"
              type="date"
              value={experienceForm.endDate}
              onChange={handleExperienceChange}
            />
          </div>

          <InputField
            label="Descripción"
            name="description"
            textarea
            value={experienceForm.description}
            onChange={handleExperienceChange}
          />

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={addingExperience}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addingExperience}>
              {addingExperience ? "Agregando..." : "Guardar experiencia"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "manageExperience"}
        onClose={closeSectionModal}
        title="Gestionar experiencias"
        subtitle="Podés eliminar experiencias existentes."
      >
        {experiences.length ? (
          <div className="linkedin-profile__manager-list">
            {experiences.map((item) => (
              <div key={item.id} className="linkedin-profile__manager-item">
                <div>
                  <strong>{item.position}</strong>
                  <p>{item.institutionName}</p>
                </div>
                <button
                  type="button"
                  className="linkedin-profile__manager-delete"
                  onClick={() => removeExperience(item.id)}
                  disabled={deletingExperienceId === item.id}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay experiencias"
            description="Todavía no tenés experiencias cargadas."
          />
        )}
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "addEducation"}
        onClose={addingEducation ? () => {} : closeSectionModal}
        title="Agregar educación"
        subtitle="Sumá una nueva formación."
      >
        <form className="linkedin-profile__modal-form" onSubmit={addEducation}>
          <div className="linkedin-profile__grid">
            <InputField
              label="Institución"
              name="institutionName"
              value={educationForm.institutionName}
              onChange={handleEducationChange}
            />
            <InputField
              label="Título"
              name="title"
              value={educationForm.title}
              onChange={handleEducationChange}
            />
          </div>

          <div className="linkedin-profile__grid">
            <InputField
              label="Fecha inicio"
              name="startDate"
              type="date"
              value={educationForm.startDate}
              onChange={handleEducationChange}
            />
            <InputField
              label="Fecha fin"
              name="endDate"
              type="date"
              value={educationForm.endDate}
              onChange={handleEducationChange}
            />
          </div>

          <InputField
            label="Descripción"
            name="description"
            textarea
            value={educationForm.description}
            onChange={handleEducationChange}
          />

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={addingEducation}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addingEducation}>
              {addingEducation ? "Agregando..." : "Guardar educación"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "manageEducation"}
        onClose={closeSectionModal}
        title="Gestionar educación"
        subtitle="Podés eliminar registros existentes."
      >
        {educations.length ? (
          <div className="linkedin-profile__manager-list">
            {educations.map((item) => (
              <div key={item.id} className="linkedin-profile__manager-item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.institutionName}</p>
                </div>
                <button
                  type="button"
                  className="linkedin-profile__manager-delete"
                  onClick={() => removeEducation(item.id)}
                  disabled={deletingEducationId === item.id}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay educación"
            description="Todavía no tenés estudios cargados."
          />
        )}
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "addCertification"}
        onClose={addingCertification ? () => {} : closeSectionModal}
        title="Agregar certificación"
        subtitle="Sumá una nueva credencial."
      >
        <form
          className="linkedin-profile__modal-form"
          onSubmit={addCertification}
        >
          <div className="linkedin-profile__grid">
            <InputField
              label="Nombre"
              name="name"
              value={certificationForm.name}
              onChange={handleCertificationChange}
            />
            <InputField
              label="Emisor"
              name="issuer"
              value={certificationForm.issuer}
              onChange={handleCertificationChange}
            />
          </div>

          <div className="linkedin-profile__grid">
            <InputField
              label="Fecha de emisión"
              name="issueDate"
              type="date"
              value={certificationForm.issueDate}
              onChange={handleCertificationChange}
            />
            <InputField
              label="Enlace de la credencial"
              name="credentialUrl"
              value={certificationForm.credentialUrl}
              onChange={handleCertificationChange}
            />
          </div>

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={addingCertification}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addingCertification}>
              {addingCertification ? "Agregando..." : "Guardar certificación"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "manageCertification"}
        onClose={closeSectionModal}
        title="Gestionar certificaciones"
        subtitle="Podés eliminar registros existentes."
      >
        {certifications.length ? (
          <div className="linkedin-profile__manager-list">
            {certifications.map((item) => (
              <div key={item.id} className="linkedin-profile__manager-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.issuer || "Emisor no informado"}</p>
                </div>
                <button
                  type="button"
                  className="linkedin-profile__manager-delete"
                  onClick={() => removeCertification(item.id)}
                  disabled={deletingCertificationId === item.id}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay certificaciones"
            description="Todavía no tenés certificaciones cargadas."
          />
        )}
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "addSkill"}
        onClose={addingSkill ? () => {} : closeSectionModal}
        title="Agregar aptitud"
        subtitle="Sumá una nueva aptitud a tu perfil."
      >
        <form className="linkedin-profile__modal-form" onSubmit={addSkill}>
          <InputField
            label="Aptitud"
            name="name"
            value={skillForm.name}
            onChange={handleSkillChange}
          />

          <div className="linkedin-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={addingSkill}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addingSkill}>
              {addingSkill ? "Agregando..." : "Guardar aptitud"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "manageSkill"}
        onClose={closeSectionModal}
        title="Gestionar aptitudes"
        subtitle="Podés eliminar aptitudes existentes."
      >
        {skills.length ? (
          <div className="linkedin-profile__manager-list">
            {skills.map((item) => (
              <div key={item.id} className="linkedin-profile__manager-item">
                <div>
                  <strong>{item.name}</strong>
                </div>
                <button
                  type="button"
                  className="linkedin-profile__manager-delete"
                  onClick={() => removeSkill(item.id)}
                  disabled={deletingSkillId === item.id}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay aptitudes"
            description="Todavía no tenés aptitudes cargadas."
          />
        )}
      </ProfileSectionModal>
    </div>
  );
}

export default ProfessorProfilePage;
