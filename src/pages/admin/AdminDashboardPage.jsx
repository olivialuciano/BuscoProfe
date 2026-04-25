import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Building2,
  Briefcase,
  UserCircle,
  ShieldCheck,
  FileText,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { getAllUsers } from "../../api/usersService";
import { getAllApplications } from "../../api/applicationsService";
import { getAllJobPostings } from "../../api/jobPostingsService";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApiMessage from "../../components/common/ApiMessage";
import "./AdminDashboardPage.css";

function normalizeRole(role) {
  const value = String(role).toLowerCase();

  if (value === "0" || value.includes("admin")) return "admin";
  if (value === "1" || value.includes("professor")) return "professor";
  if (value === "2" || value.includes("institution")) return "institution";

  return "unknown";
}

function getJobStatusLabel(status) {
  switch (Number(status)) {
    case 1:
      return "Activas";
    case 2:
      return "Inactivas";
    case 3:
      return "Cerradas";
    case 4:
      return "Eliminadas";
    default:
      return "Sin estado";
  }
}

function getApplicationStatusLabel(status) {
  switch (Number(status)) {
    case 0:
      return "Aplicadas";
    case 1:
      return "En revisión";
    case 2:
      return "Rechazadas";
    case 3:
      return "Aceptadas";
    case 4:
      return "Retiradas";
    default:
      return "Sin estado";
  }
}

function getValidationLabel(status) {
  switch (Number(status)) {
    case 0:
      return "Pendientes";
    case 1:
      return "Aprobadas";
    case 2:
      return "Rechazadas";
    default:
      return "Sin validación";
  }
}

function getWeekKey(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;

  const firstDay = new Date(date);
  const day = firstDay.getDay();
  const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1);
  firstDay.setDate(diff);
  firstDay.setHours(0, 0, 0, 0);

  return firstDay.toISOString().slice(0, 10);
}

function formatWeekLabel(weekKey) {
  const date = new Date(`${weekKey}T00:00:00`);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function countBy(items, selector) {
  return items.reduce((acc, item) => {
    const key = selector(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [usersData, jobsData, applicationsData] = await Promise.all([
          getAllUsers(),
          getAllJobPostings(),
          getAllApplications(),
        ]);

        setUsers(Array.isArray(usersData) ? usersData : []);
        setJobPostings(Array.isArray(jobsData) ? jobsData : []);
        setApplications(
          Array.isArray(applicationsData) ? applicationsData : [],
        );
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el dashboard administrativo.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const professors = users.filter(
      (u) => normalizeRole(u.role) === "professor",
    );
    const institutions = users.filter(
      (u) => normalizeRole(u.role) === "institution",
    );
    const admins = users.filter((u) => normalizeRole(u.role) === "admin");

    return {
      usersTotal: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      inactiveUsers: users.filter((u) => !u.isActive).length,
      professors: professors.length,
      institutions: institutions.length,
      admins: admins.length,
      jobPostingsTotal: jobPostings.length,
      applicationsTotal: applications.length,
    };
  }, [users, jobPostings, applications]);

  const jobStatusCounts = useMemo(() => {
    return countBy(jobPostings, (item) => Number(item.status));
  }, [jobPostings]);

  const applicationStatusCounts = useMemo(() => {
    return countBy(applications, (item) => Number(item.status));
  }, [applications]);

  const institutionValidationCounts = useMemo(() => {
    const institutions = users.filter(
      (u) => normalizeRole(u.role) === "institution",
    );

    return countBy(institutions, (item) => {
      if (
        item.validationStatus === null ||
        item.validationStatus === undefined ||
        item.validationStatus === ""
      ) {
        return "empty";
      }

      return Number(item.validationStatus);
    });
  }, [users]);

  const weeklyApplications = useMemo(() => {
    const grouped = countBy(applications, (item) => getWeekKey(item.appliedAt));

    return Object.entries(grouped)
      .filter(([key]) => key && key !== "null")
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-8)
      .map(([week, total]) => ({
        week,
        total,
      }));
  }, [applications]);

  const maxWeeklyApplications = useMemo(() => {
    return Math.max(...weeklyApplications.map((item) => item.total), 1);
  }, [weeklyApplications]);

  const alerts = useMemo(() => {
    const pendingInstitutions = institutionValidationCounts[0] || 0;
    const deletedJobs = jobStatusCounts[4] || 0;
    const pendingApplications =
      (applicationStatusCounts[0] || 0) + (applicationStatusCounts[1] || 0);

    return [
      {
        label: "Instituciones pendientes de validación",
        value: pendingInstitutions,
      },
      {
        label: "Vacantes eliminadas en el sistema",
        value: deletedJobs,
      },
    ];
  }, [institutionValidationCounts, jobStatusCounts, applicationStatusCounts]);

  if (loading) {
    return (
      <div className="page-shell admin-dashboard">
        <LoadingSpinner text="Cargando dashboard administrativo..." />
      </div>
    );
  }

  return (
    <div className="page-shell admin-dashboard">
      <header>
        <h1 className="section-title">Dashboard admin</h1>
        <p className="section-subtitle">
          Panel general para controlar usuarios, instituciones, vacantes y
          postulaciones.
        </p>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      <div className="admin-dashboard__stats">
        <div className="admin-dashboard__users-summary">
          <StatCard
            label="Usuarios"
            value={metrics.usersTotal}
            icon={<Users size={22} />}
          />

          <div className="admin-dashboard__user-types">
            <div className="admin-dashboard__user-type">
              <UserCircle size={15} />
              <span>Profesores</span>
              <strong>{metrics.professors}</strong>
            </div>

            <div className="admin-dashboard__user-type">
              <Building2 size={15} />
              <span>Instituciones</span>
              <strong>{metrics.institutions}</strong>
            </div>

            <div className="admin-dashboard__user-type">
              <ShieldCheck size={15} />
              <span>Admins</span>
              <strong>{metrics.admins}</strong>
            </div>
          </div>
        </div>
        <StatCard
          label="Vacantes"
          value={metrics.jobPostingsTotal}
          icon={<Briefcase size={22} />}
        />
        <StatCard
          label="Postulaciones"
          value={metrics.applicationsTotal}
          icon={<FileText size={22} />}
        />
      </div>

      <div className="admin-dashboard__grid">
        <Card className="admin-dashboard__panel">
          <div className="admin-dashboard__panel-header">
            <h2>Usuarios</h2>
            <Activity size={18} />
          </div>

          <div className="admin-dashboard__mini-grid">
            <div>
              <strong>{metrics.activeUsers}</strong>
              <span>Activos</span>
            </div>
            <div>
              <strong>{metrics.inactiveUsers}</strong>
              <span>Inactivos</span>
            </div>
          </div>
        </Card>

        <Card className="admin-dashboard__panel">
          <div className="admin-dashboard__panel-header">
            <h2>Instituciones por validación</h2>
            <Building2 size={18} />
          </div>

          <div className="admin-dashboard__breakdown">
            {[0, 1, 2, "empty"].map((status) => (
              <div key={status} className="admin-dashboard__breakdown-row">
                <span>
                  {status === "empty"
                    ? "Sin validación"
                    : getValidationLabel(status)}
                </span>
                <strong>{institutionValidationCounts[status] || 0}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="admin-dashboard__panel">
          <div className="admin-dashboard__panel-header">
            <h2>Vacantes por estado</h2>
            <Briefcase size={18} />
          </div>

          <div className="admin-dashboard__breakdown">
            {[1, 2, 3, 4].map((status) => (
              <div
                key={status}
                className={`admin-dashboard__breakdown-row ${
                  Number(status) === 4
                    ? "admin-dashboard__breakdown-row--danger"
                    : ""
                }`}
              >
                <span>{getJobStatusLabel(status)}</span>
                <strong>{jobStatusCounts[status] || 0}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="admin-dashboard__panel">
          <div className="admin-dashboard__panel-header">
            <h2>Postulaciones por estado</h2>
            <FileText size={18} />
          </div>

          <div className="admin-dashboard__breakdown">
            {[0, 1, 2, 3, 4].map((status) => (
              <div key={status} className="admin-dashboard__breakdown-row">
                <span>{getApplicationStatusLabel(status)}</span>
                <strong>{applicationStatusCounts[status] || 0}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="admin-dashboard__panel">
        <div className="admin-dashboard__panel-header">
          <h2>Evolución semanal de postulaciones</h2>
          <FileText size={18} />
        </div>

        {weeklyApplications.length ? (
          <div className="admin-dashboard__chart">
            {weeklyApplications.map((item) => (
              <div key={item.week} className="admin-dashboard__bar-item">
                <div className="admin-dashboard__bar-track">
                  <div
                    className="admin-dashboard__bar-fill"
                    style={{
                      height: `${Math.max(
                        (item.total / maxWeeklyApplications) * 100,
                        8,
                      )}%`,
                    }}
                  />
                </div>
                <strong>{item.total}</strong>
                <span>{formatWeekLabel(item.week)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-dashboard__empty-text">
            Todavía no hay postulaciones para graficar.
          </p>
        )}
      </Card>

      <Card className="admin-dashboard__panel">
        <div className="admin-dashboard__panel-header">
          <h2>Alertas operativas</h2>
          <AlertTriangle size={18} />
        </div>

        <div className="admin-dashboard__alerts">
          {alerts.map((alert) => (
            <div key={alert.label} className="admin-dashboard__alert">
              <span>{alert.label}</span>
              <strong>{alert.value}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default AdminDashboardPage;
