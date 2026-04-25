import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock3,
  MapPin,
  FileText,
  Bookmark,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFavoriteJobPostingsByProfessor } from "../../api/favoriteJobPostingsService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import {
  availabilityOptions,
  workModeOptions,
  contractTypeOptions,
} from "../../utils/enumOptions";
import "./SavedJobPostingsPage.css";

function getEnumLabel(options, value) {
  if (value === null || value === undefined || value === "") {
    return "No especificado";
  }

  return (
    options.find((option) => Number(option.value) === Number(value))?.label ||
    "No especificado"
  );
}

function SavedJobPostingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedJobPostings, setSavedJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");

  const loadSavedJobPostings = async (isReload = false) => {
    if (!user?.id) return;

    if (isReload) {
      setReloading(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getFavoriteJobPostingsByProfessor(user.id);
      const favorites = Array.isArray(data) ? data : [];

      const jobs = favorites
        .map((item) => item?.jobPosting || item?.JobPosting || null)
        .filter(Boolean);

      setSavedJobPostings(jobs);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron cargar las vacantes guardadas.",
        ),
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
    if (user?.id) {
      loadSavedJobPostings();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="page-shell saved-job-postings-page">
        <LoadingSpinner text="Cargando vacantes guardadas..." />
      </div>
    );
  }

  return (
    <div className="page-shell saved-job-postings-page">
      <header className="saved-job-postings-page__header">
        <div>
          <h1 className="section-title">Vacantes guardadas</h1>
          <p className="section-subtitle">
            Acá vas a ver todas las vacantes que marcaste para revisar después.
          </p>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {savedJobPostings.length ? (
        <div className="saved-job-postings-page__grid">
          {savedJobPostings.map((job) => {
            const locationText =
              [job.city, job.province, job.country]
                .filter(Boolean)
                .join(", ") || "Ubicación no informada";

            return (
              <div
                key={job.id}
                className="saved-job-postings-page__card-wrapper"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <Card className="saved-job-postings-page__card">
                  <div className="saved-job-postings-page__card-top">
                    <div className="saved-job-postings-page__bookmark-chip">
                      <Bookmark size={14} fill="currentColor" />
                      <span>Guardada</span>
                    </div>
                  </div>

                  <h3>{job.title || "Vacante sin título"}</h3>

                  <div className="saved-job-postings-page__meta">
                    <span>
                      <MapPin size={14} />
                      {locationText}
                    </span>

                    <span>
                      <Briefcase size={14} />
                      {getEnumLabel(workModeOptions, job.workMode)}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      {getEnumLabel(availabilityOptions, job.availability)}
                    </span>

                    <span>
                      <FileText size={14} />
                      {getEnumLabel(contractTypeOptions, job.contractType)}
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Todavía no guardaste vacantes"
          description="Cuando guardes una vacante, va a aparecer acá."
        />
      )}
    </div>
  );
}

export default SavedJobPostingsPage;
