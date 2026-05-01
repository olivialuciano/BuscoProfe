import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BellRing,
  Bookmark,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flame,
  Heart,
  MapPin,
  SearchCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getProfessorApplications } from "../../api/applicationsService";
import { getFavoriteJobPostingsByProfessor } from "../../api/favoriteJobPostingsService";
import { getPublicJobPostings } from "../../api/jobPostingsService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./ProfessorDashboardPage.css";

function getValue(source, camelCaseName, pascalCaseName) {
  return source?.[camelCaseName] ?? source?.[pascalCaseName];
}

function formatDate(value) {
  if (!value) return "Fecha no informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Fecha no informada";

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShortDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
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
      return "professor-dashboard__badge professor-dashboard__badge--applied";
    case 1:
      return "professor-dashboard__badge professor-dashboard__badge--review";
    case 2:
      return "professor-dashboard__badge professor-dashboard__badge--rejected";
    case 3:
      return "professor-dashboard__badge professor-dashboard__badge--accepted";
    case 4:
      return "professor-dashboard__badge professor-dashboard__badge--withdrawn";
    default:
      return "professor-dashboard__badge professor-dashboard__badge--neutral";
  }
}

function getJobStatusLabel(status) {
  switch (Number(status)) {
    case 1:
      return "Activa";
    case 2:
      return "Inactiva";
    case 3:
      return "Cerrada";
    default:
      return "No especificado";
  }
}

function getJobStatusClass(status) {
  switch (Number(status)) {
    case 1:
      return "professor-dashboard__badge professor-dashboard__badge--open";
    case 2:
      return "professor-dashboard__badge professor-dashboard__badge--inactive";
    case 3:
      return "professor-dashboard__badge professor-dashboard__badge--closed";
    default:
      return "professor-dashboard__badge professor-dashboard__badge--neutral";
  }
}

function getJobFromFavorite(favorite) {
  return (
    favorite?.jobPosting ||
    favorite?.JobPosting ||
    favorite?.job ||
    favorite?.Job ||
    null
  );
}

function getApplicationJobPostingId(application) {
  return Number(
    application?.jobPostingId ||
      application?.JobPostingId ||
      application?.jobPosting?.id ||
      application?.JobPosting?.Id,
  );
}

function getJobFromApplication(application) {
  return (
    application?.jobPosting ||
    application?.JobPosting ||
    application?.job ||
    application?.Job ||
    null
  );
}

function findJobByApplication(application, jobs) {
  const applicationJobPostingId = getApplicationJobPostingId(application);

  if (!applicationJobPostingId) return null;

  return (
    jobs.find((job) => Number(getJobId(job)) === applicationJobPostingId) ||
    null
  );
}

function getInstitutionNameFromApplication(application, job) {
  return getInstitutionName(job) !== "Institución no informada"
    ? getInstitutionName(job)
    : application?.institutionName ||
        application?.InstitutionName ||
        application?.jobPosting?.institutionName ||
        application?.JobPosting?.InstitutionName ||
        application?.jobPosting?.institution?.tradeName ||
        application?.JobPosting?.Institution?.TradeName ||
        application?.job?.institutionName ||
        application?.Job?.InstitutionName ||
        application?.job?.institution?.tradeName ||
        application?.Job?.Institution?.TradeName ||
        "Institución no informada";
}

function getJobId(job) {
  return getValue(job, "id", "Id");
}

function getJobTitleFromApplication(application) {
  return (
    application?.jobTitle ||
    application?.JobTitle ||
    application?.jobPostingTitle ||
    application?.JobPostingTitle ||
    application?.jobPosting?.title ||
    application?.JobPosting?.Title ||
    "Vacante sin título"
  );
}

function getJobTitle(job) {
  return getValue(job, "title", "Title") || "Vacante sin título";
}

function getJobLocation(job) {
  return (
    [
      getValue(job, "city", "City"),
      getValue(job, "province", "Province"),
      getValue(job, "country", "Country"),
    ]
      .filter(Boolean)
      .join(", ") || "Ubicación no informada"
  );
}

function getInstitutionName(job) {
  return (
    job?.institutionName ||
    job?.InstitutionName ||
    job?.institution?.tradeName ||
    job?.Institution?.TradeName ||
    job?.institution?.firstName ||
    job?.Institution?.FirstName ||
    "Institución no informada"
  );
}

function isUrgentJob(job) {
  return Boolean(
    getValue(job, "urgent", "Urgent") ??
    getValue(job, "isUrgent", "IsUrgent") ??
    false,
  );
}

function getJobCreatedAt(job) {
  return getValue(job, "createdAt", "CreatedAt");
}

function getApplicationAppliedAt(application) {
  return getValue(application, "appliedAt", "AppliedAt");
}

function MetricCard({ icon, label, value, detail, tone = "blue" }) {
  return (
    <article
      className={`professor-dashboard__metric professor-dashboard__metric--${tone}`}
    >
      <div className="professor-dashboard__metric-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <p>{detail}</p> : null}
      </div>
    </article>
  );
}

function DashboardSection({
  icon,
  title,
  description,
  count,
  isOpen,
  onToggle,
  children,
  accent = "blue",
}) {
  return (
    <section
      className={`professor-dashboard__section-card professor-dashboard__section-card--${accent} ${
        isOpen ? "professor-dashboard__section-card--open" : ""
      }`}
    >
      <button
        type="button"
        className="professor-dashboard__section-main"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="professor-dashboard__section-header">
          <div className="professor-dashboard__section-icon">{icon}</div>

          <div className="professor-dashboard__section-title-content">
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
        </div>

        <div className="professor-dashboard__section-side">
          <strong className="professor-dashboard__section-number">
            {count}
          </strong>

          <span
            className={`professor-dashboard__section-toggle ${
              isOpen ? "professor-dashboard__section-toggle--open" : ""
            }`}
          >
            {isOpen ? "Ocultar" : "Ver más"}
            <ChevronDown size={16} />
          </span>
        </div>
      </button>

      {isOpen ? (
        <div className="professor-dashboard__section-content">{children}</div>
      ) : null}
    </section>
  );
}

function JobMiniCard({ job, alreadyApplied, onClick, variant = "default" }) {
  const status = getValue(job, "status", "Status");
  const urgent = isUrgentJob(job);

  return (
    <button
      type="button"
      className={`professor-dashboard__mini-card professor-dashboard__mini-card--${variant}`}
      onClick={onClick}
    >
      <div className="professor-dashboard__mini-card-top">
        <div className="professor-dashboard__mini-card-title">
          <h3>{getJobTitle(job)}</h3>
          <p>{getInstitutionName(job)}</p>
        </div>

        <div className="professor-dashboard__badge-row">
          {urgent ? (
            <span className="professor-dashboard__badge professor-dashboard__badge--urgent">
              Urgente
            </span>
          ) : null}

          <span className={getJobStatusClass(status)}>
            {getJobStatusLabel(status)}
          </span>

          {alreadyApplied ? (
            <span className="professor-dashboard__badge professor-dashboard__badge--accepted">
              Ya te postulaste
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function ApplicationMiniCard({ job, application, onClick }) {
  const status = getValue(application, "status", "Status");
  const institutionName = getInstitutionNameFromApplication(application, job);

  return (
    <button
      type="button"
      className="professor-dashboard__application-mini-card"
      onClick={onClick}
    >
      <div className="professor-dashboard__mini-card-top">
        <div className="professor-dashboard__mini-card-title">
          <h3>{getJobTitleFromApplication(application)}</h3>
          <p>{institutionName}</p>
        </div>

        <span className={getApplicationStatusClass(status)}>
          {getApplicationStatusLabel(status)}
        </span>
      </div>
    </button>
  );
}

function EmptyState({ icon, title, text, actionLabel, onAction }) {
  return (
    <div className="professor-dashboard__empty">
      <div className="professor-dashboard__empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>

      {actionLabel && onAction ? (
        <button
          type="button"
          className="professor-dashboard__empty-action"
          onClick={onAction}
        >
          {actionLabel}
          <ArrowUpRight size={16} />
        </button>
      ) : null}
    </div>
  );
}

function ProfessorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [favoriteJobPostings, setFavoriteJobPostings] = useState([]);
  const [todayJobPostings, setTodayJobPostings] = useState([]);
  const [allJobPostings, setAllJobPostings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    todayJobs: true,
    applications: false,
    savedJobs: false,
    savedNotApplied: false,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [applicationsData, favoritesData, jobsData] = await Promise.all([
          getProfessorApplications(user.id),
          getFavoriteJobPostingsByProfessor(user.id),
          getPublicJobPostings(),
        ]);

        const applicationsList = Array.isArray(applicationsData)
          ? applicationsData
          : [];

        const favoritesList = Array.isArray(favoritesData)
          ? favoritesData
              .map((favorite) => getJobFromFavorite(favorite))
              .filter(Boolean)
          : [];

        const jobsList = Array.isArray(jobsData) ? jobsData : [];

        setAllJobPostings(jobsList);

        const todayJobs = jobsList
          .filter((job) => Number(getValue(job, "status", "Status")) !== 4)
          .filter((job) => isToday(getValue(job, "createdAt", "CreatedAt")))
          .sort((a, b) => {
            const aDate = new Date(getValue(a, "createdAt", "CreatedAt") || 0);
            const bDate = new Date(getValue(b, "createdAt", "CreatedAt") || 0);
            return bDate - aDate;
          });

        setApplications(applicationsList);
        setFavoriteJobPostings(favoritesList);
        setTodayJobPostings(todayJobs);
      } catch (error) {
        console.error("Error cargando dashboard del profesor:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.id]);

  const toggleSection = (sectionName) => {
    setOpenSections((current) => ({
      ...current,
      [sectionName]: !current[sectionName],
    }));
  };

  const appliedJobPostingIds = useMemo(() => {
    return new Set(
      applications
        .map((application) => getApplicationJobPostingId(application))
        .filter(Boolean),
    );
  }, [applications]);

  const savedNotAppliedJobPostings = useMemo(() => {
    return favoriteJobPostings.filter((job) => {
      const jobId = Number(getJobId(job));
      return jobId && !appliedJobPostingIds.has(jobId);
    });
  }, [favoriteJobPostings, appliedJobPostingIds]);

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const aDate = new Date(getApplicationAppliedAt(a) || 0);
      const bDate = new Date(getApplicationAppliedAt(b) || 0);
      return bDate - aDate;
    });
  }, [applications]);

  const sortedFavoriteJobPostings = useMemo(() => {
    return [...favoriteJobPostings].sort((a, b) => {
      const aDate = new Date(getJobCreatedAt(a) || 0);
      const bDate = new Date(getJobCreatedAt(b) || 0);
      return bDate - aDate;
    });
  }, [favoriteJobPostings]);

  const sortedSavedNotAppliedJobPostings = useMemo(() => {
    return [...savedNotAppliedJobPostings].sort((a, b) => {
      const aDate = new Date(getJobCreatedAt(a) || 0);
      const bDate = new Date(getJobCreatedAt(b) || 0);
      return bDate - aDate;
    });
  }, [savedNotAppliedJobPostings]);

  const acceptedApplicationsCount = useMemo(() => {
    return applications.filter(
      (application) => Number(getValue(application, "status", "Status")) === 3,
    ).length;
  }, [applications]);

  const reviewApplicationsCount = useMemo(() => {
    return applications.filter((application) => {
      const status = Number(getValue(application, "status", "Status"));
      return status === 0 || status === 1;
    }).length;
  }, [applications]);

  const urgentTodayJobsCount = useMemo(() => {
    return todayJobPostings.filter((job) => isUrgentJob(job)).length;
  }, [todayJobPostings]);

  const profileName =
    user?.firstName || user?.FirstName || user?.name || user?.Name || "Profe";

  if (loading) {
    return (
      <div className="page-shell professor-dashboard">
        <div className="professor-dashboard__loading-card">
          <LoadingSpinner text="Preparando tu panel..." />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell professor-dashboard">
      <section className="professor-dashboard__hero">
        <div className="professor-dashboard__hero-glow professor-dashboard__hero-glow--one" />
        <div className="professor-dashboard__hero-glow professor-dashboard__hero-glow--two" />

        <div className="professor-dashboard__hero-content">
          <span className="professor-dashboard__eyebrow">
            <Sparkles size={15} />
            Resumen personal
          </span>

          <h1>Tu próxima oportunidad puede estar acá.</h1>

          <p>
            Seguí tus postulaciones, descubrí vacantes nuevas y retomá las
            oportunidades que guardaste para postularte cuando quieras.
          </p>

          <div className="professor-dashboard__hero-actions">
            <button
              type="button"
              className="professor-dashboard__primary-action"
              onClick={() => navigate("/jobs")}
            >
              Explorar vacantes
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="professor-dashboard__metrics">
        <MetricCard
          icon={<BellRing size={20} />}
          label="Publicadas hoy"
          value={todayJobPostings.length}
          tone="blue"
        />

        <MetricCard
          icon={<Briefcase size={20} />}
          label="Mis postulaciones"
          value={applications.length}
          tone="violet"
        />

        <MetricCard
          icon={<Bookmark size={20} />}
          label="Guardadas"
          value={favoriteJobPostings.length}
          tone="amber"
        />

        <MetricCard
          icon={<CheckCircle2 size={20} />}
          label="Aceptadas"
          value={acceptedApplicationsCount}
          tone="green"
        />
      </section>

      <section className="professor-dashboard__opportunity-strip">
        <div>
          <span>
            <TrendingUp size={18} />
            Recomendación rápida
          </span>

          <p>
            Revisá primero las vacantes publicadas hoy y después las guardadas
            sin postulación. Son las que tienen más potencial de acción
            inmediata.
          </p>
        </div>
      </section>

      <div className="professor-dashboard__sections">
        <DashboardSection
          icon={<CalendarDays size={22} />}
          title="Vacantes publicadas hoy"
          description="Oportunidades nuevas para revisar antes que otros profesores."
          count={todayJobPostings.length}
          isOpen={openSections.todayJobs}
          onToggle={() => toggleSection("todayJobs")}
          accent="blue"
        >
          {todayJobPostings.length ? (
            <div className="professor-dashboard__list">
              {todayJobPostings.map((job) => {
                const jobId = getJobId(job);
                const alreadyApplied = appliedJobPostingIds.has(Number(jobId));

                return (
                  <JobMiniCard
                    key={jobId}
                    job={job}
                    alreadyApplied={alreadyApplied}
                    variant={isUrgentJob(job) ? "urgent" : "default"}
                    onClick={() => navigate(`/jobs/${jobId}`)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarDays size={24} />}
              title="Hoy todavía no se publicaron vacantes"
              text="Cuando una institución publique una oportunidad nueva, va a aparecer en esta sección."
              actionLabel="Explorar vacantes activas"
              onAction={() => navigate("/jobs")}
            />
          )}
        </DashboardSection>

        <DashboardSection
          icon={<Briefcase size={22} />}
          title="Vacantes a las que me postulé"
          description="Tu historial de postulaciones y el estado actual de cada proceso."
          count={applications.length}
          isOpen={openSections.applications}
          onToggle={() => toggleSection("applications")}
          accent="violet"
        >
          {sortedApplications.length ? (
            <div className="professor-dashboard__list professor-dashboard__list--compact">
              {sortedApplications.map((application) => {
                const applicationId = getValue(application, "id", "Id");

                const job =
                  getJobFromApplication(application) ||
                  findJobByApplication(application, allJobPostings) ||
                  findJobByApplication(application, favoriteJobPostings) ||
                  findJobByApplication(application, todayJobPostings);

                return (
                  <ApplicationMiniCard
                    key={applicationId}
                    job={job}
                    application={application}
                    onClick={() =>
                      navigate(`/professor/applications/${applicationId}`)
                    }
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase size={24} />}
              title="Todavía no te postulaste"
              text="Buscá una vacante que coincida con tu perfil y enviá tu primera postulación."
              actionLabel="Ver vacantes disponibles"
              onAction={() => navigate("/jobs")}
            />
          )}
        </DashboardSection>

        <DashboardSection
          icon={<Bookmark size={22} />}
          title="Vacantes guardadas"
          description="Todas las oportunidades que marcaste para revisar después."
          count={favoriteJobPostings.length}
          isOpen={openSections.savedJobs}
          onToggle={() => toggleSection("savedJobs")}
          accent="amber"
        >
          {sortedFavoriteJobPostings.length ? (
            <div className="professor-dashboard__list">
              {sortedFavoriteJobPostings.map((job) => {
                const jobId = getJobId(job);
                const alreadyApplied = appliedJobPostingIds.has(Number(jobId));

                return (
                  <JobMiniCard
                    key={jobId}
                    job={job}
                    alreadyApplied={alreadyApplied}
                    onClick={() => navigate(`/jobs/${jobId}`)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Star size={24} />}
              title="No guardaste vacantes todavía"
              text="Guardá las oportunidades que te interesen para volver a ellas fácilmente."
              actionLabel="Descubrir vacantes"
              onAction={() => navigate("/jobs")}
            />
          )}
        </DashboardSection>

        <DashboardSection
          icon={<Heart size={22} />}
          title="Guardadas sin postulación"
          description="Vacantes que te interesaron, pero que todavía no convertiste en postulación."
          count={savedNotAppliedJobPostings.length}
          isOpen={openSections.savedNotApplied}
          onToggle={() => toggleSection("savedNotApplied")}
          accent="rose"
        >
          {sortedSavedNotAppliedJobPostings.length ? (
            <div className="professor-dashboard__list">
              {sortedSavedNotAppliedJobPostings.map((job) => {
                const jobId = getJobId(job);

                return (
                  <JobMiniCard
                    key={jobId}
                    job={job}
                    alreadyApplied={false}
                    onClick={() => navigate(`/jobs/${jobId}`)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Flame size={24} />}
              title="No tenés pendientes"
              text="Excelente. No hay vacantes guardadas esperando una postulación."
              actionLabel="Buscar nuevas oportunidades"
              onAction={() => navigate("/jobs")}
            />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

export default ProfessorDashboardPage;
