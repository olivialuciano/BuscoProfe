import { useEffect, useState } from "react";
import { Briefcase, Heart, Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getProfessorApplications } from "../../api/applicationsService";
import { getFavoriteJobPostings } from "../../api/favoritesService";
import { getUserNotifications } from "../../api/notificationsService";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./ProfessorDashboardPage.css";

function ProfessorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    favorites: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [applications, favorites, notifications] = await Promise.all([
          getProfessorApplications(user.id),
          getFavoriteJobPostings(user.id),
          getUserNotifications(user.id),
        ]);

        setStats({
          applications: applications.length,
          favorites: favorites.length,
          notifications: notifications.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user.id]);

  return (
    <div className="page-shell professor-dashboard">
      <header>
        <h1 className="section-title">Panel del profesor</h1>
        <p className="section-subtitle">
          Vista inicial para seguir tu actividad dentro de la plataforma.
        </p>
      </header>

      {loading ? (
        <LoadingSpinner text="Cargando panel..." />
      ) : (
        <div className="professor-dashboard__stats">
          <StatCard
            label="Postulaciones"
            value={stats.applications}
            icon={<Briefcase size={22} />}
          />
          <StatCard
            label="Favoritos"
            value={stats.favorites}
            icon={<Heart size={22} />}
          />
          <StatCard
            label="Notificaciones"
            value={stats.notifications}
            icon={<Bell size={22} />}
          />
        </div>
      )}
    </div>
  );
}

export default ProfessorDashboardPage;
