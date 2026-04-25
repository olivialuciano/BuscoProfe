import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Pencil,
  MessageCircle,
  Globe,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getMyUser, updateUser } from "../../api/usersService";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import EmptyState from "../../components/common/EmptyState";
import ProfileSectionModal from "../../components/profile/ProfileSectionModal";
import { getApiErrorMessage } from "../../utils/errorUtils";
import { INSTITUTION_TYPE_OPTIONS } from "../../utils/constants";
import "./InstitutionProfilePage.css";
import defaultimage from "../../assets/img/default-image.png";

function sanitizeWhatsAppNumber(value) {
  return (value || "").replace(/\D/g, "");
}

function buildInstitutionUpdatePayload(base) {
  return {
    legalName: base.legalName || null,
    tradeName: base.tradeName || null,
    institutionType:
      base.institutionType === "" ||
      base.institutionType === null ||
      base.institutionType === undefined
        ? null
        : Number(base.institutionType),
    shortDescription: base.shortDescription || null,
    description: base.description || null,
    website: base.website || null,
    instagramUrl: base.instagramUrl || null,
    facebookUrl: base.facebookUrl || null,
    linkedInUrl: base.linkedInUrl || null,
    benefitsText: base.benefitsText || null,
    valuesText: base.valuesText || null,
    hiringInfoText: base.hiringInfoText || null,
    whatsApp1: base.whatsApp1 || null,
    whatsApp2: base.whatsApp2 || null,
    whatsApp3: base.whatsApp3 || null,
    country: base.country || null,
    province: base.province || null,
    city: base.city || null,
    address: base.address || null,
    coverImageUrl: base.coverImageUrl || null,
  };
}

const institutionTypeOptionsWithEmpty = [
  { value: "", label: "Seleccionar tipo" },
  ...INSTITUTION_TYPE_OPTIONS,
];

function InstitutionProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sectionError, setSectionError] = useState("");
  const [openModal, setOpenModal] = useState(null);

  const [savingInstitutionInfo, setSavingInstitutionInfo] = useState(false);

  const [profile, setProfile] = useState({
    legalName: "",
    tradeName: "",
    institutionType: "",
    shortDescription: "",
    description: "",
    website: "",
    instagramUrl: "",
    facebookUrl: "",
    linkedInUrl: "",
    benefitsText: "",
    valuesText: "",
    hiringInfoText: "",
    whatsApp1: "",
    whatsApp2: "",
    whatsApp3: "",
    city: "",
    province: "",
    country: "",
    address: "",
    coverImageUrl: "",
    validationStatus: null,
  });

  const [institutionInfoForm, setInstitutionInfoForm] = useState({
    legalName: "",
    tradeName: "",
    institutionType: "",
    shortDescription: "",
    description: "",
    website: "",
    instagramUrl: "",
    facebookUrl: "",
    linkedInUrl: "",
    benefitsText: "",
    valuesText: "",
    hiringInfoText: "",
    whatsApp1: "",
    whatsApp2: "",
    whatsApp3: "",
    city: "",
    province: "",
    country: "",
    address: "",
    coverImageUrl: "",
  });

  const institutionName = useMemo(() => {
    return profile.tradeName || profile.legalName || "Nombre de la institución";
  }, [profile.tradeName, profile.legalName]);

  const shortDescription = useMemo(() => {
    return profile.shortDescription || "Institución deportiva";
  }, [profile.shortDescription]);

  const longDescription = useMemo(() => {
    return (
      profile.description ||
      "Completá la descripción institucional para mostrar tu identidad, tu propuesta y tu cultura."
    );
  }, [profile.description]);

  const whatsappNumbers = useMemo(() => {
    return [profile.whatsApp1, profile.whatsApp2, profile.whatsApp3].filter(
      Boolean,
    );
  }, [profile.whatsApp1, profile.whatsApp2, profile.whatsApp3]);

  const whatsappLine = useMemo(() => {
    return whatsappNumbers.join(" | ");
  }, [whatsappNumbers]);

  const primaryWhatsapp = useMemo(() => {
    return sanitizeWhatsAppNumber(
      profile.whatsApp1 || profile.whatsApp2 || profile.whatsApp3 || "",
    );
  }, [profile.whatsApp1, profile.whatsApp2, profile.whatsApp3]);

  const institutionTypeLabel = useMemo(() => {
    if (
      profile.institutionType === "" ||
      profile.institutionType === null ||
      profile.institutionType === undefined
    ) {
      return "No especificado";
    }

    return (
      INSTITUTION_TYPE_OPTIONS.find(
        (x) => Number(x.value) === Number(profile.institutionType),
      )?.label || "No especificado"
    );
  }, [profile.institutionType]);

  const syncFormsFromProfile = (data) => {
    const normalized = {
      legalName: data.legalName || "",
      tradeName: data.tradeName || "",
      institutionType: data.institutionType ?? "",
      shortDescription: data.shortDescription || "",
      description: data.description || "",
      website: data.website || "",
      instagramUrl: data.instagramUrl || "",
      facebookUrl: data.facebookUrl || "",
      linkedInUrl: data.linkedInUrl || "",
      benefitsText: data.benefitsText || "",
      valuesText: data.valuesText || "",
      hiringInfoText: data.hiringInfoText || "",
      whatsApp1: data.whatsApp1 || "",
      whatsApp2: data.whatsApp2 || "",
      whatsApp3: data.whatsApp3 || "",
      city: data.city || "",
      province: data.province || "",
      country: data.country || "",
      address: data.address || "",
      coverImageUrl: data.coverImageUrl || "",
      validationStatus: data.validationStatus ?? null,
    };

    setProfile(normalized);

    setInstitutionInfoForm({
      legalName: normalized.legalName,
      tradeName: normalized.tradeName,
      institutionType: normalized.institutionType,
      shortDescription: normalized.shortDescription,
      description: normalized.description,
      website: normalized.website,
      instagramUrl: normalized.instagramUrl,
      facebookUrl: normalized.facebookUrl,
      linkedInUrl: normalized.linkedInUrl,
      benefitsText: normalized.benefitsText,
      valuesText: normalized.valuesText,
      hiringInfoText: normalized.hiringInfoText,
      whatsApp1: normalized.whatsApp1,
      whatsApp2: normalized.whatsApp2,
      whatsApp3: normalized.whatsApp3,
      city: normalized.city,
      province: normalized.province,
      country: normalized.country,
      address: normalized.address,
      coverImageUrl: normalized.coverImageUrl,
    });
  };

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    setSectionError("");

    try {
      const userData = await getMyUser(user.id);
      syncFormsFromProfile(userData);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudo cargar el perfil de la institución.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const openSectionModal = (modalName) => {
    setSectionError("");
    setOpenModal(modalName);
  };

  const closeSectionModal = () => {
    setSectionError("");
    setOpenModal(null);
  };

  const handleInstitutionInfoChange = (event) => {
    const { name, value, type, checked } = event.target;

    setInstitutionInfoForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateInstitutionInfoForm = () => {
    const requiredFields = [
      { key: "tradeName", label: "Nombre comercial" },
      { key: "institutionType", label: "Tipo de institución" },
      { key: "shortDescription", label: "Descripción corta" },
      { key: "description", label: "Descripción larga" },
      { key: "whatsApp1", label: "WhatsApp 1" },
      { key: "country", label: "País" },
      { key: "province", label: "Provincia" },
      { key: "city", label: "Ciudad" },
    ];

    for (const field of requiredFields) {
      const value = institutionInfoForm[field.key];

      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        return `El campo "${field.label}" es obligatorio.`;
      }
    }

    return "";
  };

  const saveInstitutionInfo = async (event) => {
    event.preventDefault();
    if (savingInstitutionInfo) return;

    setSectionError("");

    const validationMessage = validateInstitutionInfoForm();
    if (validationMessage) {
      setSectionError(validationMessage);
      return;
    }

    setSavingInstitutionInfo(true);

    try {
      const payload = buildInstitutionUpdatePayload({
        ...profile,
        ...institutionInfoForm,
      });

      await updateUser(user.id, payload);

      const nextProfile = {
        ...profile,
        ...institutionInfoForm,
      };

      setProfile(nextProfile);
      showToast("Datos institucionales actualizados.", "success");
      closeSectionModal();
    } catch (err) {
      console.error("PUT institution info error:", err.response?.data || err);
      setSectionError(
        getApiErrorMessage(
          err,
          "No se pudieron actualizar los datos institucionales.",
        ),
      );
    } finally {
      setSavingInstitutionInfo(false);
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
    <div className="page-shell institution-profile">
      <ApiMessage type="error">{error}</ApiMessage>
      <ApiMessage type="error">{sectionError}</ApiMessage>

      <Card className="institution-profile__top-card">
        <div className="institution-profile__top-card-content">
          <div className="institution-profile__cover-wrap">
            {profile.coverImageUrl ? (
              <img
                src={profile.coverImageUrl}
                alt={`Imagen de ${institutionName}`}
                className="institution-profile__cover-image"
              />
            ) : (
              <img src={defaultimage} alt={`Imagen default`} />
            )}
          </div>

          <h1>{institutionName}</h1>
          <h2>{shortDescription}</h2>
        </div>
      </Card>

      <Card className="institution-profile__section">
        <div className="institution-profile__section-header">
          <div className="institution-profile__section-title-wrap">
            <h3>Presentación</h3>
          </div>

          <div className="institution-profile__icon-actions">
            <button
              type="button"
              className="institution-profile__icon-button"
              onClick={() => openSectionModal("institutionInfo")}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        <div className="institution-profile__summary-block">
          <p className="institution-profile__summary-long">{longDescription}</p>
        </div>

        <div className="institution-profile__hero-actions">
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
            className="institution-profile__whatsapp-button"
            onClick={openWhatsAppChat}
            aria-label="Abrir WhatsApp"
            title="Abrir WhatsApp"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </Card>

      <Card className="institution-profile__section">
        <div className="institution-profile__section-header">
          <div className="institution-profile__section-title-wrap">
            <Building2 size={20} />
            <h3>Información institucional</h3>
          </div>

          <div className="institution-profile__icon-actions">
            <button
              type="button"
              className="institution-profile__icon-button"
              onClick={() => openSectionModal("institutionInfo")}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        <div className="institution-profile__details-grid">
          <div className="institution-profile__detail-card">
            <div>
              <strong>Razón social</strong>
              <span>{profile.legalName || "No informada"}</span>
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>Tipo de institución</strong>
              <span>{institutionTypeLabel}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="institution-profile__section">
        <div className="institution-profile__section-header">
          <div className="institution-profile__section-title-wrap">
            <Globe size={20} />
            <h3>Redes y enlaces</h3>
          </div>

          <div className="institution-profile__icon-actions">
            <button
              type="button"
              className="institution-profile__icon-button"
              onClick={() => openSectionModal("institutionInfo")}
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        <div className="institution-profile__details-grid">
          <div className="institution-profile__detail-card">
            <div>
              <strong>Sitio web</strong>
              <span>{profile.website || "No especificado"}</span>
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>Instagram</strong>
              <span>{profile.instagramUrl || "No especificado"}</span>
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>Facebook</strong>
              <span>{profile.facebookUrl || "No especificado"}</span>
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>LinkedIn</strong>
              <span>{profile.linkedInUrl || "No especificado"}</span>
            </div>
          </div>
        </div>
      </Card>

      <ProfileSectionModal
        open={openModal === "contactInfoView"}
        onClose={closeSectionModal}
        title="Información de contacto"
        subtitle="Datos de contacto visibles de la institución."
      >
        <div className="institution-profile__contact-modal">
          {profile.whatsApp1 ? (
            <div className="institution-profile__contact-row">
              <Phone size={16} />
              <span>{profile.whatsApp1}</span>
            </div>
          ) : null}

          {profile.whatsApp2 ? (
            <div className="institution-profile__contact-row">
              <Phone size={16} />
              <span>{profile.whatsApp2}</span>
            </div>
          ) : null}

          {profile.whatsApp3 ? (
            <div className="institution-profile__contact-row">
              <Phone size={16} />
              <span>{profile.whatsApp3}</span>
            </div>
          ) : null}

          {[profile.city, profile.province, profile.country]
            .filter(Boolean)
            .join(", ") ? (
            <div className="institution-profile__contact-row">
              <MapPin size={16} />
              <span>
                {[profile.city, profile.province, profile.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          ) : null}

          {profile.address ? (
            <div className="institution-profile__contact-row">
              <MapPin size={16} />
              <span>{profile.address}</span>
            </div>
          ) : null}

          {!profile.whatsApp1 &&
          !profile.whatsApp2 &&
          !profile.whatsApp3 &&
          ![profile.city, profile.province, profile.country]
            .filter(Boolean)
            .join(", ") &&
          !profile.address ? (
            <EmptyState
              title="Sin contacto cargado"
              description="Todavía no hay datos de contacto visibles."
            />
          ) : null}
        </div>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "institutionInfo"}
        onClose={closeSectionModal}
        title="Editar datos institucionales"
        subtitle="Actualizá la información principal, contacto, redes y datos institucionales."
      >
        <form
          className="institution-profile__modal-form"
          onSubmit={saveInstitutionInfo}
        >
          <div className="institution-profile__grid">
            <InputField
              label="Razón social"
              name="legalName"
              value={institutionInfoForm.legalName}
              onChange={handleInstitutionInfoChange}
            />
            <InputField
              label="Nombre comercial"
              name="tradeName"
              value={institutionInfoForm.tradeName}
              onChange={handleInstitutionInfoChange}
              required
            />
          </div>

          <SelectField
            label="Tipo de institución"
            name="institutionType"
            value={institutionInfoForm.institutionType}
            onChange={handleInstitutionInfoChange}
            options={institutionTypeOptionsWithEmpty}
            required
          />

          <InputField
            label="Descripción corta"
            name="shortDescription"
            value={institutionInfoForm.shortDescription}
            onChange={handleInstitutionInfoChange}
            required
          />

          <InputField
            label="Descripción larga"
            name="description"
            textarea
            value={institutionInfoForm.description}
            onChange={handleInstitutionInfoChange}
            required
          />

          <div className="institution-profile__grid">
            <InputField
              label="WhatsApp 1"
              name="whatsApp1"
              value={institutionInfoForm.whatsApp1}
              onChange={handleInstitutionInfoChange}
              required
            />
            <InputField
              label="WhatsApp 2"
              name="whatsApp2"
              value={institutionInfoForm.whatsApp2}
              onChange={handleInstitutionInfoChange}
            />
          </div>

          <div className="institution-profile__grid">
            <InputField
              label="WhatsApp 3"
              name="whatsApp3"
              value={institutionInfoForm.whatsApp3}
              onChange={handleInstitutionInfoChange}
            />
            <InputField
              label="URL de imagen institucional"
              name="coverImageUrl"
              value={institutionInfoForm.coverImageUrl}
              onChange={handleInstitutionInfoChange}
            />
          </div>

          <div className="institution-profile__grid">
            <InputField
              label="Ciudad"
              name="city"
              value={institutionInfoForm.city}
              onChange={handleInstitutionInfoChange}
              required
            />
            <InputField
              label="Provincia"
              name="province"
              value={institutionInfoForm.province}
              onChange={handleInstitutionInfoChange}
              required
            />
          </div>

          <div className="institution-profile__grid">
            <InputField
              label="País"
              name="country"
              value={institutionInfoForm.country}
              onChange={handleInstitutionInfoChange}
              required
            />
            <InputField
              label="Dirección"
              name="address"
              value={institutionInfoForm.address}
              onChange={handleInstitutionInfoChange}
            />
          </div>

          <div className="institution-profile__grid">
            <InputField
              label="Sitio web"
              name="website"
              value={institutionInfoForm.website}
              onChange={handleInstitutionInfoChange}
            />
            <InputField
              label="Instagram"
              name="instagramUrl"
              value={institutionInfoForm.instagramUrl}
              onChange={handleInstitutionInfoChange}
            />
          </div>

          <div className="institution-profile__grid">
            <InputField
              label="Facebook"
              name="facebookUrl"
              value={institutionInfoForm.facebookUrl}
              onChange={handleInstitutionInfoChange}
            />
            <InputField
              label="LinkedIn"
              name="linkedInUrl"
              value={institutionInfoForm.linkedInUrl}
              onChange={handleInstitutionInfoChange}
            />
          </div>

          <div className="institution-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingInstitutionInfo}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={savingInstitutionInfo}>
              {savingInstitutionInfo ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>
    </div>
  );
}

export default InstitutionProfilePage;
