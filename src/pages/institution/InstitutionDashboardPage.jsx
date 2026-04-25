import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Heart,
  PauseCircle,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getInstitutionJobPostings } from "../../api/jobPostingsService";
import { getUserNotifications } from "../../api/notificationsService";
import { getApplicationsByJobPosting } from "../../api/applicationsService";
import { getFavoriteInstitutionsByInstitution } from "../../api/favoriteInstitutionsService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./InstitutionDashboardPage.css";

const JOB_POSTING_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
  CLOSED: 3,
  DELETED: 4,
};

const CHART_WEEKS_VISIBLE = 4;
const CHART_START_DATE = new Date("2026-01-05T00:00:00");

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getWeekStart(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);

  return date;
}

function addWeeks(date, weeks) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + weeks * 7);
  return copy;
}

function formatWeekLabel(dateValue) {
  return new Date(dateValue).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatRangeLabel(startDate) {
  const endDate = addWeeks(startDate, 1);
  endDate.setDate(endDate.getDate() - 1);

  return `${startDate.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  })} - ${endDate.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  })}`;
}

function buildContinuousWeeklySeries(applications) {
  const countsByWeek = new Map();

  applications.forEach((application) => {
    const appliedAt = application.appliedAt;
    const weekStart = getWeekStart(appliedAt);

    if (!weekStart) {
      return;
    }

    const key = weekStart.toISOString();
    countsByWeek.set(key, (countsByWeek.get(key) || 0) + 1);
  });

  const currentWeek = getWeekStart(new Date());
  const latestApplicationWeek =
    applications
      .map((application) => getWeekStart(application.appliedAt))
      .filter(Boolean)
      .sort((a, b) => a - b)
      .at(-1) || null;

  const endWeek =
    latestApplicationWeek && latestApplicationWeek > currentWeek
      ? latestApplicationWeek
      : currentWeek;

  const startWeek = startOfDay(CHART_START_DATE);
  const weeks = [];

  for (
    let cursor = new Date(startWeek);
    cursor <= endWeek;
    cursor = addWeeks(cursor, 1)
  ) {
    const key = cursor.toISOString();

    weeks.push({
      key,
      weekStart: new Date(cursor),
      count: countsByWeek.get(key) || 0,
      shortLabel: formatWeekLabel(cursor),
      rangeLabel: formatRangeLabel(cursor),
    });
  }

  return weeks;
}

function MetricCard({ title, value, subtitle, icon, tone = "default" }) {
  return (
    <Card
      className={`institution-dashboard__metric institution-dashboard__metric--${tone}`}
    >
      <div className="institution-dashboard__metric-icon">{icon}</div>

      <div className="institution-dashboard__metric-body">
        <p className="institution-dashboard__metric-title">{title}</p>
        <h3 className="institution-dashboard__metric-value">{value}</h3>
        {subtitle ? (
          <p className="institution-dashboard__metric-subtitle">{subtitle}</p>
        ) : null}
      </div>
    </Card>
  );
}

function InstitutionDashboardPage() {
  const { user } = useAuth();

  const [jobPostings, setJobPostings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartStartIndex, setChartStartIndex] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [jobPostingsResponse, notificationsResponse, favoritesResponse] =
          await Promise.all([
            getInstitutionJobPostings(user.id),
            getUserNotifications(user.id),
            getFavoriteInstitutionsByInstitution(user.id),
          ]);

        const safeJobPostings = Array.isArray(jobPostingsResponse)
          ? jobPostingsResponse
          : [];

        const safeNotifications = Array.isArray(notificationsResponse)
          ? notificationsResponse
          : [];

        const safeFavorites = Array.isArray(favoritesResponse)
          ? favoritesResponse
          : [];

        const applicationResponses = await Promise.all(
          safeJobPostings.map((jobPosting) =>
            getApplicationsByJobPosting(jobPosting.id).catch(() => []),
          ),
        );

        const allApplications = applicationResponses.flat();

        setJobPostings(safeJobPostings);
        setNotifications(safeNotifications);
        setFavorites(safeFavorites);
        setApplications(Array.isArray(allApplications) ? allApplications : []);
      } catch (err) {
        setError(
          getApiErrorMessage(
            err,
            "No se pudo cargar el dashboard de la institución.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadDashboard();
    }
  }, [user?.id]);

  const stats = useMemo(() => {
    const activeJobPostings = jobPostings.filter(
      (jobPosting) => Number(jobPosting.status) === JOB_POSTING_STATUS.ACTIVE,
    ).length;

    const inactiveJobPostings = jobPostings.filter(
      (jobPosting) => Number(jobPosting.status) === JOB_POSTING_STATUS.INACTIVE,
    ).length;

    const closedJobPostings = jobPostings.filter(
      (jobPosting) => Number(jobPosting.status) === JOB_POSTING_STATUS.CLOSED,
    ).length;

    const deletedJobPostings = jobPostings.filter(
      (jobPosting) => Number(jobPosting.status) === JOB_POSTING_STATUS.DELETED,
    ).length;

    const totalVisibleJobPostings = jobPostings.filter(
      (jobPosting) => Number(jobPosting.status) !== JOB_POSTING_STATUS.DELETED,
    ).length;

    const weeklyApplications = buildContinuousWeeklySeries(applications);

    return {
      totalVisibleJobPostings,
      activeJobPostings,
      inactiveJobPostings,
      closedJobPostings,
      deletedJobPostings,
      totalApplications: applications.length,
      totalFavorites: favorites.length,
      totalNotifications: notifications.length,
      weeklyApplications,
    };
  }, [applications, favorites.length, jobPostings, notifications.length]);

  useEffect(() => {
    if (!stats.weeklyApplications.length) {
      setChartStartIndex(0);
      return;
    }

    const nextIndex = Math.max(
      stats.weeklyApplications.length - CHART_WEEKS_VISIBLE,
      0,
    );

    setChartStartIndex(nextIndex);
  }, [stats.weeklyApplications.length]);

  const chartWindow = useMemo(() => {
    return stats.weeklyApplications.slice(
      chartStartIndex,
      chartStartIndex + CHART_WEEKS_VISIBLE,
    );
  }, [chartStartIndex, stats.weeklyApplications]);

  const chartAverage = useMemo(() => {
    if (!chartWindow.length) {
      return 0;
    }

    const total = chartWindow.reduce((sum, item) => sum + item.count, 0);
    return total / chartWindow.length;
  }, [chartWindow]);

  const chartMaxValue = useMemo(() => {
    const maxCount = Math.max(...chartWindow.map((item) => item.count), 0);
    return Math.max(maxCount, Math.ceil(chartAverage), 4);
  }, [chartAverage, chartWindow]);

  const chartGridValues = useMemo(() => {
    return [0, 1, 2, 3, 4].map((step) =>
      Math.round((chartMaxValue / 4) * step),
    );
  }, [chartMaxValue]);

  const averageLineBottom = useMemo(() => {
    if (chartMaxValue <= 0) {
      return 0;
    }

    return `${(chartAverage / chartMaxValue) * 100}%`;
  }, [chartAverage, chartMaxValue]);

  const canGoPrev = chartStartIndex > 0;
  const canGoNext =
    chartStartIndex + CHART_WEEKS_VISIBLE < stats.weeklyApplications.length;

  const visibleRangeText =
    chartWindow.length > 0
      ? `${chartWindow[0].rangeLabel} · ${chartWindow.at(-1).rangeLabel}`
      : "Sin datos";

  return (
    <div className="page-shell institution-dashboard">
      <header className="institution-dashboard__header">
        <div>
          <h1 className="section-title">Dashboard institucional</h1>
          <p className="section-subtitle">
            Métricas completas de vacantes, postulaciones, favoritos y
            actividad.
          </p>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {loading ? (
        <LoadingSpinner text="Cargando dashboard..." />
      ) : (
        <>
          <section className="institution-dashboard__hero-grid">
            <MetricCard
              title="Vacantes existentes"
              value={stats.totalVisibleJobPostings}
              subtitle=""
              icon={<BriefcaseBusiness size={22} />}
              tone="primary"
            />

            <Card className="institution-dashboard__panel">
              <div className="institution-dashboard__panel-header">
                <div>
                  <p>Estado actual de todas las vacantes.</p>
                </div>
              </div>

              <div className="institution-dashboard__status-grid">
                <div className="institution-dashboard__status-card">
                  <div className="institution-dashboard__status-icon institution-dashboard__status-icon--active">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p>Activas</p>
                    <strong>{stats.activeJobPostings}</strong>
                  </div>
                </div>

                <div className="institution-dashboard__status-card">
                  <div className="institution-dashboard__status-icon institution-dashboard__status-icon--inactive">
                    <PauseCircle size={18} />
                  </div>
                  <div>
                    <p>Inactivas</p>
                    <strong>{stats.inactiveJobPostings}</strong>
                  </div>
                </div>

                <div className="institution-dashboard__status-card">
                  <div className="institution-dashboard__status-icon institution-dashboard__status-icon--closed">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <p>Cerradas</p>
                    <strong>{stats.closedJobPostings}</strong>
                  </div>
                </div>

                <div className="institution-dashboard__status-card">
                  <div className="institution-dashboard__status-icon institution-dashboard__status-icon--deleted">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <p>Eliminadas</p>
                    <strong>{stats.deletedJobPostings}</strong>
                  </div>
                </div>
              </div>
            </Card>

            <MetricCard
              title="Postulaciones totales"
              value={stats.totalApplications}
              subtitle=""
              icon={<FileText size={22} />}
              tone="success"
            />

            <MetricCard
              title="Favoritos recibidos"
              value={stats.totalFavorites}
              subtitle=""
              icon={<Heart size={22} />}
              tone="pink"
            />
          </section>

          <Card className="institution-dashboard__panel institution-dashboard__panel--chart">
            <div className="institution-dashboard__panel-header institution-dashboard__panel-header--chart">
              <div>
                <h2>Postulaciones por semana</h2>
                <p>Recuento de las postulaciones a todas tus vacantes.</p>
              </div>

              <div className="institution-dashboard__chart-navigation">
                <button
                  type="button"
                  className="institution-dashboard__chart-nav-button"
                  onClick={() =>
                    setChartStartIndex((current) => Math.max(current - 1, 0))
                  }
                  disabled={!canGoPrev}
                  aria-label="Ver semana anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="institution-dashboard__chart-period">
                  <span>{visibleRangeText}</span>
                  <small>
                    Promedio 4 semanas: {chartAverage.toFixed(2)} postulaciones
                  </small>
                </div>

                <button
                  type="button"
                  className="institution-dashboard__chart-nav-button"
                  onClick={() =>
                    setChartStartIndex((current) =>
                      Math.min(
                        current + 1,
                        stats.weeklyApplications.length - CHART_WEEKS_VISIBLE,
                      ),
                    )
                  }
                  disabled={!canGoNext}
                  aria-label="Ver semana siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="institution-dashboard__chart-area">
              <div className="institution-dashboard__chart-y-axis">
                {[...chartGridValues].reverse().map((value, index) => (
                  <span key={`${value}-${index}`}>{value}</span>
                ))}
              </div>

              <div className="institution-dashboard__chart-plot">
                {[...chartGridValues].reverse().map((value, index) => {
                  const bottom =
                    chartMaxValue === 0 ? 0 : (value / chartMaxValue) * 100;

                  return (
                    <div
                      key={`${value}-${index}`}
                      className="institution-dashboard__chart-grid-line"
                      style={{ bottom: `${bottom}%` }}
                    />
                  );
                })}

                <div
                  className="institution-dashboard__chart-average-line"
                  style={{ bottom: averageLineBottom }}
                  title={`Promedio de 4 semanas: ${chartAverage.toFixed(2)}`}
                />

                <div className="institution-dashboard__chart-bars">
                  {chartWindow.map((item) => {
                    const height =
                      chartMaxValue === 0
                        ? "0%"
                        : `${(item.count / chartMaxValue) * 100}%`;

                    return (
                      <div
                        key={item.key}
                        className="institution-dashboard__chart-column"
                      >
                        <span className="institution-dashboard__chart-value">
                          {item.count}
                        </span>

                        <div className="institution-dashboard__chart-bar-wrap">
                          <div
                            className="institution-dashboard__chart-bar"
                            style={{ height }}
                            title={`${item.count} postulaciones · ${item.rangeLabel}`}
                          />
                        </div>

                        <span className="institution-dashboard__chart-label">
                          {item.shortLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="institution-dashboard__chart-legend">
              <span className="institution-dashboard__legend-item">
                <span className="institution-dashboard__legend-color institution-dashboard__legend-color--bars" />
                Postulaciones semanales
              </span>

              <span className="institution-dashboard__legend-item">
                <span className="institution-dashboard__legend-color institution-dashboard__legend-color--average" />
                Promedio de la ventana actual de 4 semanas
              </span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default InstitutionDashboardPage;
