import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  MessageCircle,
  Globe,
  Star,
  Briefcase,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getAllInstitutions } from "../../api/usersService";
import {
  getFavoriteInstitutionsByProfessor,
  createFavoriteInstitution,
  deleteFavoriteInstitutionByProfessorAndInstitution,
} from "../../api/favoriteInstitutionsService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import EmptyState from "../../components/common/EmptyState";
import ProfileSectionModal from "../../components/profile/ProfileSectionModal";
import { getApiErrorMessage } from "../../utils/errorUtils";
import { INSTITUTION_TYPE_OPTIONS, ROLES } from "../../utils/constants";
import defaultimage from "../../assets/img/default-image.png";
import "../institution/InstitutionProfilePage.css";
import "./InstitutionDetailPage.css";

function sanitizeWhatsAppNumber(value) {
  return (value || "").replace(/\D/g, "");
}

function institutionMatchesFavorite(item, institutionId) {
  const candidateIds = [
    item?.institutionUserId,
    item?.InstitutionUserId,
    item?.institutionUser?.id,
    item?.institutionUser?.Id,
    item?.InstitutionUser?.id,
    item?.InstitutionUser?.Id,
  ];

  return candidateIds.some((value) => Number(value) === Number(institutionId));
}

function InstitutionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [institution, setInstitution] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavoriteInstitution, setIsFavoriteInstitution] = useState(false);

  useEffect(() => {
    const loadInstitution = async () => {
      setLoading(true);
      setError("");

      try {
        const institutions = await getAllInstitutions();
        const items = Array.isArray(institutions) ? institutions : [];
        const found = items.find((item) => Number(item.id) === Number(id));

        if (!found) {
          setError("No se encontró la institución.");
          return;
        }

        setInstitution(found);
      } catch (err) {
        setError(getApiErrorMessage(err, "No se pudo cargar la institución."));
      } finally {
        setLoading(false);
      }
    };

    loadInstitution();
  }, [id]);

  useEffect(() => {
    const loadFavoriteState = async () => {
      if (!user?.id || user.role !== ROLES.PROFESSOR) return;

      try {
        const favorites = await getFavoriteInstitutionsByProfessor(user.id);
        const favoriteItems = Array.isArray(favorites) ? favorites : [];

        const exists = favoriteItems.some((item) =>
          institutionMatchesFavorite(item, id),
        );

        setIsFavoriteInstitution(exists);
      } catch {
        // No bloqueo la pantalla si falla el estado de favoritos.
      }
    };

    loadFavoriteState();
  }, [user?.id, user?.role, id]);

  const institutionName = useMemo(() => {
    return institution?.tradeName || institution?.legalName || "Institución";
  }, [institution]);

  const shortDescription = useMemo(() => {
    return institution?.shortDescription || "Institución deportiva";
  }, [institution]);

  const longDescription = useMemo(() => {
    return (
      institution?.description ||
      "Esta institución todavía no cargó una descripción completa."
    );
  }, [institution]);

  const institutionTypeLabel = useMemo(() => {
    if (
      institution?.institutionType === "" ||
      institution?.institutionType === null ||
      institution?.institutionType === undefined
    ) {
      return "No especificado";
    }

    return (
      INSTITUTION_TYPE_OPTIONS.find(
        (option) =>
          Number(option.value) === Number(institution.institutionType),
      )?.label || "No especificado"
    );
  }, [institution]);

  const primaryWhatsapp = useMemo(() => {
    return sanitizeWhatsAppNumber(
      institution?.whatsApp1 ||
        institution?.whatsApp2 ||
        institution?.whatsApp3 ||
        "",
    );
  }, [institution]);

  const locationText = useMemo(() => {
    if (!institution) return "";

    return [institution.city, institution.province, institution.country]
      .filter(Boolean)
      .join(", ");
  }, [institution]);

  const canFavoriteInstitution = useMemo(() => {
    return !!user && user.role === ROLES.PROFESSOR && !!institution;
  }, [user, institution]);

  const handleToggleFavoriteInstitution = async () => {
    if (!user?.id || !institution || favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      if (isFavoriteInstitution) {
        await deleteFavoriteInstitutionByProfessorAndInstitution(
          user.id,
          institution.id,
        );

        setIsFavoriteInstitution(false);
        return;
      }

      await createFavoriteInstitution({
        professorUserId: user.id,
        institutionUserId: institution.id,
      });

      setIsFavoriteInstitution(true);
    } catch (err) {
      const backendMessage = getApiErrorMessage(
        err,
        "No se pudo actualizar el favorito de la institución.",
      );

      if (
        backendMessage.toLowerCase().includes("ya está en favoritos") ||
        backendMessage.toLowerCase().includes("ya esta en favoritos")
      ) {
        setIsFavoriteInstitution(true);
      } else {
        showToast(backendMessage, "error");
      }
    } finally {
      setFavoriteLoading(false);
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
        <LoadingSpinner text="Cargando institución..." />
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="page-shell institution-profile">
        <ApiMessage type="error">
          {error || "No se encontró la institución."}
        </ApiMessage>
      </div>
    );
  }

  return (
    <div className="page-shell institution-profile">
      <ApiMessage type="error">{error}</ApiMessage>

      <Card className="institution-profile__top-card">
        <div className="institution-profile__top-card-content">
          <div className="institution-profile__cover-wrap">
            {institution.coverImageUrl ? (
              <img
                src={institution.coverImageUrl}
                alt={`Imagen de ${institutionName}`}
                className="institution-profile__cover-image"
              />
            ) : (
              <img
                src={defaultimage}
                alt="Imagen default"
                className="institution-profile__cover-image"
              />
            )}
          </div>

          <div className="institution-detail__public-title-row">
            <div>
              <h1>{institutionName}</h1>
              <h2>{shortDescription}</h2>
            </div>

            {canFavoriteInstitution ? (
              <button
                type="button"
                className={`institution-detail__favorite-button ${
                  isFavoriteInstitution
                    ? "institution-detail__favorite-button--active"
                    : ""
                }`}
                onClick={handleToggleFavoriteInstitution}
                disabled={favoriteLoading}
                aria-label="Guardar institución"
                title={
                  isFavoriteInstitution
                    ? "Quitar de favoritos"
                    : "Guardar institución"
                }
              >
                <Star
                  size={18}
                  fill={isFavoriteInstitution ? "currentColor" : "none"}
                />
              </button>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="institution-profile__section">
        <div className="institution-profile__section-header">
          <div className="institution-profile__section-title-wrap">
            <h3>Presentación</h3>
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
            onClick={() => setShowContactModal(true)}
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

          <Button
            type="button"
            icon={<Briefcase size={16} />}
            onClick={() => navigate(`/institutions/${institution.id}/jobs`)}
          >
            Ver vacantes
          </Button>
        </div>
      </Card>

      <Card className="institution-profile__section">
        <div className="institution-profile__section-header">
          <div className="institution-profile__section-title-wrap">
            <Building2 size={20} />
            <h3>Información institucional</h3>
          </div>
        </div>

        <div className="institution-profile__details-grid">
          <div className="institution-profile__detail-card">
            <div>
              <strong>Razón social</strong>
              <span>{institution.legalName || "No informada"}</span>
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
        </div>

        <div className="institution-profile__details-grid">
          <div className="institution-profile__detail-card">
            <div>
              <strong>Sitio web</strong>

              {institution.website ? (
                <a
                  href={
                    institution.website.startsWith("http")
                      ? institution.website
                      : `https://${institution.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {institution.website}
                </a>
              ) : (
                <span>No especificado</span>
              )}
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>Instagram</strong>

              {institution.instagramUrl ? (
                <a
                  href={`https://www.instagram.com/${institution.instagramUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{institution.instagramUrl}
                </a>
              ) : (
                <span>No especificado</span>
              )}
            </div>
          </div>

          <div className="institution-profile__detail-card">
            <div>
              <strong>Facebook</strong>

              {institution.facebookUrl ? (
                <a
                  href={
                    institution.facebookUrl.startsWith("http")
                      ? institution.facebookUrl
                      : `https://${institution.facebookUrl}`
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

              {institution.linkedInUrl ? (
                <a
                  href={
                    institution.linkedInUrl.startsWith("http")
                      ? institution.linkedInUrl
                      : `https://${institution.linkedInUrl}`
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
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Información de contacto"
        subtitle="Datos de contacto visibles de la institución."
      >
        <div className="institution-profile__contact-modal">
          {institution.whatsApp1 ? (
            <div className="institution-profile__contact-row">
              <Phone size={16} />
              <span>{institution.whatsApp1}</span>
            </div>
          ) : (
            <div className="institution-profile__contact-row">
              <Phone size={16} />
              <span>Tel no informado.</span>
            </div>
          )}

          {institution.whatsApp2 ? (
            <div className="institution-profile__contact-row">
              <Phone size={16} />
              <span>{institution.whatsApp2}</span>
            </div>
          ) : null}

          {institution.whatsApp3 ? (
            <div className="institution-profile__contact-row">
              <Phone size={16} />
              <span>{institution.whatsApp3}</span>
            </div>
          ) : null}

          {locationText ? (
            <div className="institution-profile__contact-row">
              <MapPin size={16} />
              <span>{locationText}</span>
            </div>
          ) : null}

          {institution.address ? (
            <div className="institution-profile__contact-row">
              <MapPin size={16} />
              <span>{institution.address}</span>
            </div>
          ) : null}

          {!institution.whatsApp1 &&
          !institution.whatsApp2 &&
          !institution.whatsApp3 &&
          !locationText &&
          !institution.address ? (
            <EmptyState
              title="Sin contacto cargado"
              description="Todavía no hay datos de contacto visibles."
            />
          ) : null}
        </div>
      </ProfileSectionModal>
    </div>
  );
}

export default InstitutionDetailPage;
