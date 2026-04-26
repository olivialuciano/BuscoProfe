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

function sanitizeInstagramUsername(value) {
  return (value || "").replace("@", "").trim();
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
    instagramUrl: sanitizeInstagramUsername(base.instagramUrl) || null,
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

function getProfileFormValues(data) {
  return {
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
  const [savingSection, setSavingSection] = useState("");

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
      ...getProfileFormValues(data),
      validationStatus: data.validationStatus ?? null,
    };

    setProfile(normalized);
    setInstitutionInfoForm(getProfileFormValues(normalized));
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
    setInstitutionInfoForm(getProfileFormValues(profile));
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
      [name]:
        name === "instagramUrl"
          ? sanitizeInstagramUsername(value)
          : type === "checkbox"
            ? checked
            : value,
    }));
  };

  const validateSectionForm = (sectionName) => {
    const requiredBySection = {
      name: [
        { key: "tradeName", label: "Nombre de la institución" },
        { key: "shortDescription", label: "Descripción corta" },
      ],
      description: [{ key: "description", label: "Descripción" }],
      institutionInfo: [
        { key: "institutionType", label: "Tipo de institución" },
      ],
      contact: [
        { key: "whatsApp1", label: "WhatsApp 1" },
        { key: "country", label: "País" },
        { key: "province", label: "Provincia" },
        { key: "city", label: "Ciudad" },
      ],
      links: [],
    };

    const requiredFields = requiredBySection[sectionName] || [];

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

  const getSectionSuccessMessage = (sectionName) => {
    const messages = {
      name: "Nombre e imagen actualizados.",
      description: "Descripción actualizada.",
      institutionInfo: "Información institucional actualizada.",
      contact: "Información de contacto actualizada.",
      links: "Redes y enlaces actualizados.",
    };

    return messages[sectionName] || "Perfil actualizado.";
  };

  const saveProfileSection = async (event, sectionName) => {
    event.preventDefault();

    if (savingSection) return;

    setSectionError("");

    const validationMessage = validateSectionForm(sectionName);
    if (validationMessage) {
      setSectionError(validationMessage);
      return;
    }

    setSavingSection(sectionName);

    try {
      const cleanedForm = {
        ...institutionInfoForm,
        instagramUrl: sanitizeInstagramUsername(
          institutionInfoForm.instagramUrl,
        ),
      };

      const nextProfile = {
        ...profile,
        ...cleanedForm,
      };

      const payload = buildInstitutionUpdatePayload(nextProfile);

      await updateUser(user.id, payload);

      setProfile(nextProfile);
      setInstitutionInfoForm(getProfileFormValues(nextProfile));
      showToast(getSectionSuccessMessage(sectionName), "success");
      closeSectionModal();
    } catch (err) {
      console.error(
        "PUT institution profile section error:",
        err.response?.data || err,
      );
      setSectionError(
        getApiErrorMessage(
          err,
          "No se pudo actualizar esta sección del perfil.",
        ),
      );
    } finally {
      setSavingSection("");
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
            <img
              src={profile.coverImageUrl || defaultimage}
              alt={`Imagen de ${institutionName}`}
              className="institution-profile__cover-image"
            />
          </div>

          <div className="institution-profile__name-row">
            <div>
              <h1>{institutionName}</h1>
              <h2>{shortDescription}</h2>
            </div>

            <button
              type="button"
              className="institution-profile__icon-button"
              onClick={() => openSectionModal("name")}
              aria-label="Editar nombre e imagen institucional"
              title="Editar nombre e imagen institucional"
            >
              <Pencil size={18} />
            </button>
          </div>
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
              onClick={() => openSectionModal("description")}
              aria-label="Editar descripción"
              title="Editar descripción"
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
              aria-label="Editar información institucional"
              title="Editar información institucional"
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
              onClick={() => openSectionModal("links")}
              aria-label="Editar redes y enlaces"
              title="Editar redes y enlaces"
            >
              <Pencil size={18} />
            </button>
          </div>
        </div>

        <div className="institution-profile__details-grid">
          <div className="institution-profile__detail-card">
            <div>
              <strong>Sitio web</strong>

              {profile.website ? (
                <a
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.website}
                </a>
              ) : (
                <span>No especificado</span>
              )}
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>Instagram</strong>

              {profile.instagramUrl ? (
                <a
                  href={`https://www.instagram.com/${profile.instagramUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{profile.instagramUrl}
                </a>
              ) : (
                <span>No especificado</span>
              )}
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>Facebook</strong>

              {profile.facebookUrl ? (
                <a
                  href={
                    profile.facebookUrl.startsWith("http")
                      ? profile.facebookUrl
                      : `https://${profile.facebookUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver Facebook
                </a>
              ) : (
                <span>No especificado</span>
              )}
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>LinkedIn</strong>

              {profile.linkedInUrl ? (
                <a
                  href={
                    profile.linkedInUrl.startsWith("http")
                      ? profile.linkedInUrl
                      : `https://${profile.linkedInUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver LinkedIn
                </a>
              ) : (
                <span>No especificado</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <ProfileSectionModal
        open={openModal === "contactInfoView"}
        onClose={closeSectionModal}
        title="Información de contacto"
      >
        <div className="institution-profile__contact-modal">
          <div className="institution-profile__contact-modal-header">
            <strong>Contacto visible</strong>

            <button
              type="button"
              className="institution-profile__icon-button institution-profile__icon-button--small"
              onClick={() => openSectionModal("contact")}
              aria-label="Editar contacto"
              title="Editar contacto"
            >
              <Pencil size={16} />
            </button>
          </div>

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
        open={openModal === "name"}
        onClose={closeSectionModal}
        title="Editar nombre de la institución"
        subtitle="Actualizá el nombre visible, la descripción corta y la imagen principal."
      >
        <form
          className="institution-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "name")}
        >
          <InputField
            label="Nombre de la institución"
            name="tradeName"
            value={institutionInfoForm.tradeName}
            onChange={handleInstitutionInfoChange}
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
            label="URL de imagen institucional"
            name="coverImageUrl"
            value={institutionInfoForm.coverImageUrl}
            onChange={handleInstitutionInfoChange}
          />

          <div className="institution-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingSection === "name"}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={savingSection === "name"}>
              {savingSection === "name" ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "description"}
        onClose={closeSectionModal}
        title="Editar descripción"
        subtitle="Contá quiénes son, qué ofrecen y qué tipo de profesores buscan."
      >
        <form
          className="institution-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "description")}
        >
          <InputField
            label="Descripción"
            name="description"
            textarea
            value={institutionInfoForm.description}
            onChange={handleInstitutionInfoChange}
            required
          />

          <div className="institution-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingSection === "description"}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={savingSection === "description"}>
              {savingSection === "description" ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "institutionInfo"}
        onClose={closeSectionModal}
        title="Editar información institucional"
        subtitle="Modificá únicamente los datos institucionales principales."
      >
        <form
          className="institution-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "institutionInfo")}
        >
          <InputField
            label="Razón social"
            name="legalName"
            value={institutionInfoForm.legalName}
            onChange={handleInstitutionInfoChange}
          />

          <SelectField
            label="Tipo de institución"
            name="institutionType"
            value={institutionInfoForm.institutionType}
            onChange={handleInstitutionInfoChange}
            options={institutionTypeOptionsWithEmpty}
            required
          />

          <div className="institution-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingSection === "institutionInfo"}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={savingSection === "institutionInfo"}
            >
              {savingSection === "institutionInfo" ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "links"}
        onClose={closeSectionModal}
        title="Editar redes y enlaces"
        subtitle="Agregá el sitio web y las redes sociales visibles de la institución."
      >
        <form
          className="institution-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "links")}
        >
          <InputField
            label="Sitio web"
            name="website"
            value={institutionInfoForm.website}
            onChange={handleInstitutionInfoChange}
            placeholder="Ej: www.misitio.com"
          />

          <InputField
            label="Instagram"
            name="instagramUrl"
            value={institutionInfoForm.instagramUrl}
            onChange={handleInstitutionInfoChange}
            placeholder="Ej: buscoprofe"
          />

          <InputField
            label="URL de Facebook"
            name="facebookUrl"
            value={institutionInfoForm.facebookUrl}
            onChange={handleInstitutionInfoChange}
            placeholder="Ej: https://www.facebook.com/miinstitucion"
          />

          <InputField
            label="URL de LinkedIn"
            name="linkedInUrl"
            value={institutionInfoForm.linkedInUrl}
            onChange={handleInstitutionInfoChange}
            placeholder="Ej: https://www.linkedin.com/company/miinstitucion"
          />

          <div className="institution-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingSection === "links"}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={savingSection === "links"}>
              {savingSection === "links" ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>

      <ProfileSectionModal
        open={openModal === "contact"}
        onClose={closeSectionModal}
        title="Editar contacto"
        subtitle="Actualizá los teléfonos, la ubicación y la dirección visible."
      >
        <form
          className="institution-profile__modal-form"
          onSubmit={(event) => saveProfileSection(event, "contact")}
        >
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

          <InputField
            label="WhatsApp 3"
            name="whatsApp3"
            value={institutionInfoForm.whatsApp3}
            onChange={handleInstitutionInfoChange}
          />

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

          <div className="institution-profile__modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSectionModal}
              disabled={savingSection === "contact"}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={savingSection === "contact"}>
              {savingSection === "contact" ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ProfileSectionModal>
    </div>
  );
}

export default InstitutionProfilePage;
