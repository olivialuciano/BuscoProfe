import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  UserRoundSearch,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import Hero from "../../components/common/Hero";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../contexts/AuthContext";
import { isAdmin, isInstitution } from "../../utils/roleUtils";
import "./HomePage.css";

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="page-shell home-page">
        <Hero
          title="Bienvenido/a a Busco Profe"
          subtitle="Ya iniciaste sesión. Desde acá podés entrar rápidamente a tu panel y seguir trabajando según tu rol."
          primaryAction={
            <Link
              to={
                isAdmin(user)
                  ? "/admin"
                  : isInstitution(user)
                    ? "/institution"
                    : "/professor"
              }
            >
              <Button icon={<LayoutDashboard size={16} />}>
                Ir a mi panel
              </Button>
            </Link>
          }
          secondaryAction={
            <Link to="/jobs">
              <Button variant="secondary">Ver vacantes</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell home-page">
      <Hero
        title="Encontrá talento deportivo o tu próximo trabajo"
        subtitle="Busco Profe profesionaliza las búsquedas laborales para instituciones y profesores de educación física con perfiles, vacantes y postulaciones formales."
        primaryAction={
          <Link to="/jobs">
            <Button icon={<ArrowRight size={16} />}>Ver vacantes</Button>
          </Link>
        }
        secondaryAction={
          <Link to="/register">
            <Button variant="secondary">Crear cuenta</Button>
          </Link>
        }
      />

      <section className="home-page__features">
        <Card className="home-page__feature-card">
          <Building2 size={28} />
          <h3>Instituciones</h3>
          <p>
            Publican vacantes, gestionan postulaciones y mejoran su visibilidad
            dentro del ecosistema deportivo.
          </p>
        </Card>

        <Card className="home-page__feature-card">
          <UserRoundSearch size={28} />
          <h3>Profesores</h3>
          <p>
            Crean un perfil profesional, guardan vacantes favoritas y postulan
            de forma ordenada y transparente.
          </p>
        </Card>

        <Card className="home-page__feature-card">
          <ShieldCheck size={28} />
          <h3>Administración</h3>
          <p>
            El admin controla usuarios, aprobaciones de instituciones, deportes
            y la salud general de la plataforma.
          </p>
        </Card>
      </section>
    </div>
  );
}

export default HomePage;
