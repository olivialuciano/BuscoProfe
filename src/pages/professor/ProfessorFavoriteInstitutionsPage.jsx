import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Globe, MapPin, Star } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getAllInstitutions } from "../../api/usersService";
import {
  getFavoriteInstitutionsByProfessor,
  deleteFavoriteInstitutionByProfessorAndInstitution,
} from "../../api/favoriteInstitutionsService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import EmptyState from "../../components/common/EmptyState";
import { getApiErrorMessage } from "../../utils/errorUtils";
import { INSTITUTION_TYPE_OPTIONS, ROLES } from "../../utils/constants";
import "./ProfessorFavoriteInstitutionsPage.css";

function getInstitutionTypeLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }

  return (
    INSTITUTION_TYPE_OPTIONS.find(
      (option) => Number(option.value) === Number(value),
    )?.label || "No especificado"
  );
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

function ProfessorFavoriteInstitutionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteInstitutions, setFavoriteInstitutions] = useState([]);
  const [removingInstitutionId, setRemovingInstitutionId] = useState(null);

  const canSeePage = useMemo(() => {
    return user?.role === ROLES.PROFESSOR;
  }, [user?.role]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.id || user.role !== ROLES.PROFESSOR) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [institutionsResponse, favoritesResponse] = await Promise.all([
          getAllInstitutions(),
          getFavoriteInstitutionsByProfessor(user.id),
        ]);

        const institutions = Array.isArray(institutionsResponse)
          ? institutionsResponse
          : [];

        const favorites = Array.isArray(favoritesResponse)
          ? favoritesResponse
          : [];

        const matchedInstitutions = institutions.filter((institution) =>
          favorites.some((favorite) =>
            institutionMatchesFavorite(favorite, institution.id),
          ),
        );

        setFavoriteInstitutions(matchedInstitutions);
      } catch (err) {
        setError(
          getApiErrorMessage(
            err,
            "No se pudieron cargar las instituciones favoritas.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user?.id, user?.role]);

  const handleRemoveFavorite = async (event, institutionId) => {
    event.stopPropagation();

    if (!user?.id || removingInstitutionId) return;

    try {
      setRemovingInstitutionId(institutionId);

      await deleteFavoriteInstitutionByProfessorAndInstitution(
        user.id,
        institutionId,
      );

      setFavoriteInstitutions((current) =>
        current.filter((item) => Number(item.id) !== Number(institutionId)),
      );
    } catch (err) {
      showToast(
        getApiErrorMessage(
          err,
          "No se pudo quitar la institución de favoritos.",
        ),
        "error",
      );
    } finally {
      setRemovingInstitutionId(null);
    }
  };

  if (!canSeePage) {
    return (
      <div className="page-shell professor-favorite-institutions-page">
        <ApiMessage type="error">
          Esta sección solo está disponible para profesores.
        </ApiMessage>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-shell professor-favorite-institutions-page">
        <LoadingSpinner text="Cargando instituciones favoritas..." />
      </div>
    );
  }

  return (
    <div className="page-shell professor-favorite-institutions-page">
      <header className="professor-favorite-institutions-page__header">
        <div>
          <h1 className="section-title">Instituciones favoritas</h1>
          <p className="section-subtitle">
            Acá podés ver todas las instituciones que guardaste como favoritas.
          </p>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {favoriteInstitutions.length ? (
        <div className="professor-favorite-institutions-page__grid">
          {favoriteInstitutions.map((institution) => {
            const institutionName =
              institution.tradeName || institution.legalName || "Institución";

            const locationText =
              [institution.city, institution.province, institution.country]
                .filter(Boolean)
                .join(", ") || "Ubicación no informada";

            return (
              <div
                key={institution.id}
                className="professor-favorite-institutions-page__card-wrapper"
                onClick={() => navigate(`/institutions/${institution.id}`)}
              >
                <Card className="professor-favorite-institutions-page__card">
                  <div className="professor-favorite-institutions-page__card-top">
                    <div className="professor-favorite-institutions-page__title-row">
                      <div className="professor-favorite-institutions-page__icon-box">
                        <Building2 size={20} />
                      </div>

                      <div className="professor-favorite-institutions-page__title-block">
                        <h3>{institutionName}</h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="professor-favorite-institutions-page__favorite-button"
                      onClick={(event) =>
                        handleRemoveFavorite(event, institution.id)
                      }
                      disabled={removingInstitutionId === institution.id}
                      aria-label="Quitar de favoritos"
                      title="Quitar de favoritos"
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  </div>

                  <div className="professor-favorite-institutions-page__meta">
                    <span>
                      <Building2 size={14} />
                      {getInstitutionTypeLabel(institution.institutionType)}
                    </span>
                    <span>
                      <MapPin size={14} />
                      {locationText}
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Todavía no tenés instituciones favoritas"
          description="Cuando marques instituciones como favoritas, van a aparecer acá."
        />
      )}
    </div>
  );
}

export default ProfessorFavoriteInstitutionsPage;
