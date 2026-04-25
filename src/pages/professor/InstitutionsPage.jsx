import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getAllInstitutions } from "../../api/usersService";
import {
  getFavoriteInstitutionsByProfessor,
  createFavoriteInstitution,
  deleteFavoriteInstitutionByProfessorAndInstitution,
} from "../../api/favoriteInstitutionsService";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import { ROLES, INSTITUTION_TYPE_OPTIONS } from "../../utils/constants";
import "./InstitutionsPage.css";
import "./ProfessorFavoriteInstitutionsPage.css";

const institutionTypeOptions = [
  { value: "", label: "Todos los tipos" },
  ...INSTITUTION_TYPE_OPTIONS,
];

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

function InstitutionsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState([]);
  const [favoriteInstitutions, setFavoriteInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    institutionType: "",
  });

  useEffect(() => {
    const loadInstitutions = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError("");

      try {
        const [institutionsData, favoritesData] = await Promise.all([
          getAllInstitutions(),
          getFavoriteInstitutionsByProfessor(user.id),
        ]);

        const institutionItems = Array.isArray(institutionsData)
          ? institutionsData
          : [];
        const favoriteItems = Array.isArray(favoritesData) ? favoritesData : [];

        setInstitutions(institutionItems);
        setFavoriteInstitutions(favoriteItems);
      } catch (err) {
        setError(
          getApiErrorMessage(err, "No se pudieron cargar las instituciones."),
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && user.role === ROLES.PROFESSOR) {
      loadInstitutions();
    }
  }, [user?.id, user?.role]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleToggleFavoriteInstitution = async (event, institutionId) => {
    event.stopPropagation();

    if (!user?.id || favoriteLoadingId) return;

    const isFavorite = favoriteInstitutions.some((item) =>
      institutionMatchesFavorite(item, institutionId),
    );

    try {
      setFavoriteLoadingId(institutionId);

      if (isFavorite) {
        await deleteFavoriteInstitutionByProfessorAndInstitution(
          user.id,
          institutionId,
        );

        setFavoriteInstitutions((current) =>
          current.filter(
            (item) => !institutionMatchesFavorite(item, institutionId),
          ),
        );

        return;
      }

      const created = await createFavoriteInstitution({
        professorUserId: user.id,
        institutionUserId: institutionId,
      });

      setFavoriteInstitutions((current) => [...current, created]);
    } catch (err) {
      const backendMessage = getApiErrorMessage(
        err,
        "No se pudo actualizar el favorito de la institución.",
      );

      if (
        backendMessage.toLowerCase().includes("ya está en favoritos") ||
        backendMessage.toLowerCase().includes("ya esta en favoritos")
      ) {
        const fallbackFavorite = {
          institutionUserId: institutionId,
          professorUserId: user.id,
        };

        setFavoriteInstitutions((current) => [...current, fallbackFavorite]);
      } else {
        showToast(backendMessage, "error");
      }
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  const filteredInstitutions = useMemo(() => {
    return institutions
      .filter((institution) =>
        filters.search.trim() === ""
          ? true
          : `${institution.tradeName || ""} ${institution.legalName || ""}`
              .toLowerCase()
              .includes(filters.search.trim().toLowerCase()),
      )
      .filter((institution) =>
        filters.institutionType === ""
          ? true
          : Number(institution.institutionType) ===
            Number(filters.institutionType),
      );
  }, [institutions, filters]);

  if (user?.role !== ROLES.PROFESSOR) {
    return (
      <div className="page-shell institutions-page">
        <ApiMessage type="error">
          Esta sección es solo para usuarios profesor.
        </ApiMessage>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-shell institutions-page">
        <LoadingSpinner text="Cargando instituciones..." />
      </div>
    );
  }

  return (
    <div className="page-shell institutions-page">
      <header className="institutions-page__header">
        <div>
          <h1 className="section-title">Instituciones</h1>
          <p className="section-subtitle">
            Explorá instituciones y entrá a su perfil para ver más información.
          </p>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      <Card className="institutions-page__filters">
        <div className="institutions-page__search">
          <InputField
            label="Buscar por nombre"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Nombre comercial o razón social"
          />
        </div>

        <div className="institutions-page__filters-grid">
          <SelectField
            label="Tipo de institución"
            name="institutionType"
            value={filters.institutionType}
            onChange={handleFilterChange}
            options={institutionTypeOptions}
          />
        </div>
      </Card>

      {filteredInstitutions.length ? (
        <div className="professor-favorite-institutions-page__grid">
          {filteredInstitutions.map((institution) => {
            const institutionName =
              institution.tradeName || institution.legalName || "Institución";

            const locationText =
              [institution.city, institution.province, institution.country]
                .filter(Boolean)
                .join(", ") || "Ubicación no informada";

            const isFavorite = favoriteInstitutions.some((item) =>
              institutionMatchesFavorite(item, institution.id),
            );

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
                      className={`professor-favorite-institutions-page__favorite-button ${
                        isFavorite
                          ? "professor-favorite-institutions-page__favorite-button--active"
                          : ""
                      }`}
                      onClick={(event) =>
                        handleToggleFavoriteInstitution(event, institution.id)
                      }
                      disabled={favoriteLoadingId === institution.id}
                      aria-label="Guardar institución"
                      title={
                        isFavorite
                          ? "Quitar de favoritos"
                          : "Guardar institución"
                      }
                    >
                      <Star
                        size={18}
                        fill={isFavorite ? "currentColor" : "none"}
                      />
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
          title="No hay instituciones para esos filtros"
          description="Probá cambiando el texto de búsqueda o los filtros."
        />
      )}
    </div>
  );
}

export default InstitutionsPage;
