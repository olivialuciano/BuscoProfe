import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Funnel, X, UserRound } from "lucide-react";
import { getAllProfessors } from "../../api/usersService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import {
  availabilityOptions,
  workModeOptions,
  contractTypeOptions,
} from "../../utils/enumOptions";
import "./InstitutionProfessorsPage.css";

function getEnumLabel(options, value) {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }

  return (
    options.find((option) => Number(option.value) === Number(value))?.label ||
    "No especificado"
  );
}

function InstitutionProfessorsPage() {
  const navigate = useNavigate();

  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    availability: "",
    workModePreference: "",
    contractPreference: "",
  });

  const loadProfessors = async (isReload = false) => {
    if (isReload) {
      setReloading(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getAllProfessors();
      const items = Array.isArray(data) ? data : [];

      const activeProfessors = items.filter((item) => item.isActive !== false);
      setProfessors(activeProfessors);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "No se pudieron cargar los profesores."),
      );
    } finally {
      if (isReload) {
        setReloading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProfessors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      availability: "",
      workModePreference: "",
      contractPreference: "",
    });
  };

  const filteredProfessors = useMemo(() => {
    return professors
      .filter((professor) => {
        const fullName =
          `${professor.firstName || ""} ${professor.lastName || ""}`.trim();

        return filters.search.trim() === ""
          ? true
          : fullName
              .toLowerCase()
              .includes(filters.search.trim().toLowerCase());
      })
      .filter((professor) =>
        filters.availability === ""
          ? true
          : Number(professor.availability) === Number(filters.availability),
      )
      .filter((professor) =>
        filters.workModePreference === ""
          ? true
          : Number(professor.workModePreference) ===
            Number(filters.workModePreference),
      )
      .filter((professor) =>
        filters.contractPreference === ""
          ? true
          : Number(professor.contractPreference) ===
            Number(filters.contractPreference),
      );
  }, [professors, filters]);

  if (loading) {
    return (
      <div className="page-shell institution-professors-page">
        <LoadingSpinner text="Cargando profesores..." />
      </div>
    );
  }

  return (
    <div className="page-shell institution-professors-page">
      <header className="institution-professors-page__header">
        <div>
          <h1 className="section-title">Profesores</h1>
          <p className="section-subtitle">
            Explorá profesores activos y entrá a sus perfiles.
          </p>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      <Card className="institution-professors-page__search-card">
        <div className="institution-professors-page__search-row">
          <div className="institution-professors-page__search-wrap">
            <InputField
              label="Buscar profesores"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Nombre y apellido..."
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            className="institution-professors-page__filter-button"
            icon={showFilters ? <X size={18} /> : <Funnel size={18} />}
            onClick={() => setShowFilters((current) => !current)}
            aria-label={showFilters ? "Cerrar filtros" : "Abrir filtros"}
            title={showFilters ? "Cerrar filtros" : "Abrir filtros"}
          />
        </div>
      </Card>

      <aside
        className={`institution-professors-page__filters-panel ${
          showFilters ? "institution-professors-page__filters-panel--open" : ""
        }`}
      >
        <div className="institution-professors-page__filters-header">
          <h2>Filtros</h2>
          <button
            type="button"
            className="institution-professors-page__filters-close"
            onClick={() => setShowFilters(false)}
            aria-label="Cerrar filtros"
          >
            <X size={18} />
          </button>
        </div>

        <div className="institution-professors-page__filters-content">
          <SelectField
            label="Disponibilidad"
            name="availability"
            value={filters.availability}
            onChange={handleChange}
            options={[{ value: "", label: "Todas" }, ...availabilityOptions]}
          />

          <SelectField
            label="Modalidad"
            name="workModePreference"
            value={filters.workModePreference}
            onChange={handleChange}
            options={[{ value: "", label: "Todas" }, ...workModeOptions]}
          />

          <SelectField
            label="Tipo de contrato"
            name="contractPreference"
            value={filters.contractPreference}
            onChange={handleChange}
            options={[{ value: "", label: "Todos" }, ...contractTypeOptions]}
          />

          <Button type="button" variant="secondary" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </aside>

      {showFilters ? (
        <button
          type="button"
          className="institution-professors-page__filters-backdrop"
          onClick={() => setShowFilters(false)}
          aria-label="Cerrar filtros"
        />
      ) : null}

      {filteredProfessors.length ? (
        <div className="institution-professors-page__grid">
          {filteredProfessors.map((professor) => {
            const fullName =
              `${professor.firstName || ""} ${professor.lastName || ""}`.trim() ||
              "Profesor";

            return (
              <div
                key={professor.id}
                className="institution-professors-page__card-wrapper"
                onClick={() => navigate(`/professors/${professor.id}`)}
              >
                <Card className="institution-professors-page__card">
                  <div className="institution-professors-page__card-top">
                    <div className="institution-professors-page__title-row">
                      <div className="institution-professors-page__person-icon">
                        <UserRound size={18} />
                      </div>

                      <div className="institution-professors-page__title-block">
                        <h3>{fullName}</h3>
                        <p>
                          {professor.title || "Profesor de educación física"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No hay profesores para esos filtros"
          description="Probá cambiando el texto de búsqueda o los filtros."
        />
      )}
    </div>
  );
}

export default InstitutionProfessorsPage;
