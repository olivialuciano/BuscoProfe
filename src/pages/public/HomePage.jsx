import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  UserRoundSearch,
  ShieldCheck,
  LayoutDashboard,
  Search,
  ClipboardCheck,
  MessageCircle,
  Sparkles,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Send,
  Waves,
  Target,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../contexts/AuthContext";
import { isAdmin, isInstitution } from "../../utils/roleUtils";
import "./HomePage.css";

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress = documentHeight > 0 ? scrollTop / documentHeight : 0;

      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    updateScrollProgress();

    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, []);

  const pageStyle = {
    "--scroll-progress": scrollProgress,
    "--flow-y": `${scrollProgress * 220}px`,
    "--flow-x": `${scrollProgress * 90}px`,
    "--flow-rotate": `${scrollProgress * 28}deg`,
  };

  if (isAuthenticated) {
    const dashboardPath = isAdmin(user)
      ? "/admin"
      : isInstitution(user)
        ? "/institution"
        : "/professor";

    const roleLabel = isAdmin(user)
      ? "Administrador"
      : isInstitution(user)
        ? "Institución"
        : "Profesor";

    return (
      <div className="home-page home-page--authenticated" style={pageStyle}>
        <div className="home-page__liquid-background">
          <div className="home-page__liquid home-page__liquid--one" />
          <div className="home-page__liquid home-page__liquid--two" />
          <div className="home-page__liquid home-page__liquid--three" />
          <div className="home-page__water-line home-page__water-line--one" />
          <div className="home-page__water-line home-page__water-line--two" />
        </div>

        <section className="home-page__auth-hero">
          <div className="page-shell home-page__auth-content">
            <div className="home-page__auth-copy home-page__reveal">
              <span className="home-page__eyebrow">
                <Sparkles size={16} />
                Sesión activa · {roleLabel}
              </span>

              <h1>Bienvenido/a a Busco Profe</h1>

              <p>
                Accedé rápidamente a tu panel, mantené tu perfil actualizado y
                seguí gestionando tus oportunidades dentro de la plataforma.
              </p>

              <div className="home-page__hero-actions">
                <Link to={dashboardPath}>
                  <Button icon={<LayoutDashboard size={16} />}>
                    Ir a mi panel
                  </Button>
                </Link>

                <Link to="/jobs">
                  <Button variant="secondary">Ver vacantes</Button>
                </Link>
              </div>
            </div>

            <Card className="home-page__auth-panel home-page__glass-card">
              <div className="home-page__panel-icon">
                <BriefcaseBusiness size={28} />
              </div>

              <h2>Tu espacio de trabajo</h2>

              <p>
                La plataforma organiza tus acciones principales según tu rol,
                para que puedas avanzar sin perder tiempo.
              </p>

              <div className="home-page__panel-list">
                <span>
                  <CheckCircle2 size={16} />
                  Acceso rápido a funcionalidades
                </span>
                <span>
                  <CheckCircle2 size={16} />
                  Perfil y datos actualizables
                </span>
                <span>
                  <CheckCircle2 size={16} />
                  Navegación simple y responsive
                </span>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home-page" style={pageStyle}>
      <div className="home-page__liquid-background">
        <div className="home-page__liquid home-page__liquid--one" />
        <div className="home-page__liquid home-page__liquid--two" />
        <div className="home-page__liquid home-page__liquid--three" />
        <div className="home-page__water-line home-page__water-line--one" />
        <div className="home-page__water-line home-page__water-line--two" />
        <div className="home-page__background-noise" />
      </div>

      <section className="home-page__hero">
        <div className="page-shell home-page__hero-content">
          <div className="home-page__hero-copy home-page__reveal">
            <span className="home-page__eyebrow">
              <Waves size={16} />
              Portal laboral deportivo
            </span>

            <h1>
              El punto de encuentro entre instituciones deportivas y profesores.
            </h1>

            <p>
              Busco Profe ayuda a ordenar, profesionalizar y simplificar las
              búsquedas laborales del mundo deportivo mediante perfiles,
              vacantes, postulaciones y contacto directo.
            </p>

            <div className="home-page__hero-actions">
              <Link to="/jobs">
                <Button icon={<ArrowRight size={16} />}>Ver vacantes</Button>
              </Link>

              <Link to="/register">
                <Button variant="secondary">Crear cuenta</Button>
              </Link>
            </div>

            <div className="home-page__trust-row">
              <span>
                <BadgeCheck size={16} />
                Perfiles profesionales
              </span>
              <span>
                <BadgeCheck size={16} />
                Búsquedas deportivas
              </span>
              <span>
                <BadgeCheck size={16} />
                Contacto directo
              </span>
            </div>
          </div>

          <div className="home-page__abstract-visual">
            <div className="home-page__orb home-page__orb--main">
              <div className="home-page__orb-inner">
                <Target size={68} />
              </div>
            </div>

            <Card className="home-page__floating-info home-page__floating-info--top">
              <Building2 size={22} />
              <div>
                <strong>Instituciones</strong>
                <span>Publican y gestionan búsquedas</span>
              </div>
            </Card>

            <Card className="home-page__floating-info home-page__floating-info--bottom">
              <UserRoundSearch size={22} />
              <div>
                <strong>Profesores</strong>
                <span>Crean perfiles y se postulan</span>
              </div>
            </Card>

            <div className="home-page__orbit home-page__orbit--one" />
            <div className="home-page__orbit home-page__orbit--two" />
          </div>
        </div>
      </section>

      <section className="page-shell home-page__section">
        <div className="home-page__section-heading home-page__reveal">
          <span className="home-page__eyebrow">
            Una plataforma, dos caminos
          </span>
          <h2>
            Diseñada para quienes buscan talento y para quienes buscan trabajo
          </h2>
          <p>
            Cada tipo de usuario tiene una experiencia clara, enfocada y simple
            de usar.
          </p>
        </div>

        <div className="home-page__features">
          <Card className="home-page__feature-card home-page__reveal">
            <div className="home-page__feature-icon">
              <Building2 size={28} />
            </div>

            <h3>Para instituciones</h3>

            <p>
              Publican vacantes, muestran su perfil institucional y contactan
              profesores de forma ordenada.
            </p>

            <ul>
              <li>Perfil público de institución</li>
              <li>Publicación de vacantes</li>
              <li>Gestión de búsquedas laborales</li>
            </ul>
          </Card>

          <Card className="home-page__feature-card home-page__feature-card--highlight home-page__reveal">
            <div className="home-page__feature-icon">
              <UserRoundSearch size={28} />
            </div>

            <h3>Para profesores</h3>

            <p>
              Crean un perfil profesional, cargan experiencia, aptitudes,
              educación, idiomas y se postulan a oportunidades.
            </p>

            <ul>
              <li>Perfil profesional completo</li>
              <li>Postulación a vacantes</li>
              <li>Favoritos y seguimiento</li>
            </ul>
          </Card>

          <Card className="home-page__feature-card home-page__reveal">
            <div className="home-page__feature-icon">
              <ShieldCheck size={28} />
            </div>

            <h3>Para administración</h3>

            <p>
              Permite cuidar la calidad de la plataforma, gestionar usuarios y
              mantener el ecosistema ordenado.
            </p>

            <ul>
              <li>Gestión de usuarios</li>
              <li>Control de instituciones</li>
              <li>Supervisión general</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="home-page__flow-section">
        <div className="page-shell home-page__section">
          <div className="home-page__section-heading home-page__reveal">
            <span className="home-page__eyebrow">Flujo simple</span>
            <h2>Una experiencia pensada para avanzar sin fricción</h2>
            <p>
              Desde el registro hasta el contacto, la plataforma guía al usuario
              con pasos claros.
            </p>
          </div>

          <div className="home-page__steps">
            <Card className="home-page__step-card home-page__reveal">
              <span className="home-page__step-number">01</span>
              <Search size={28} />
              <h3>Explorar</h3>
              <p>
                Los usuarios pueden navegar perfiles, vacantes e información
                relevante del ecosistema deportivo.
              </p>
            </Card>

            <Card className="home-page__step-card home-page__reveal">
              <span className="home-page__step-number">02</span>
              <ClipboardCheck size={28} />
              <h3>Accionar</h3>
              <p>
                Las instituciones publican búsquedas y los profesores se
                postulan desde una experiencia clara.
              </p>
            </Card>

            <Card className="home-page__step-card home-page__reveal">
              <span className="home-page__step-number">03</span>
              <MessageCircle size={28} />
              <h3>Conectar</h3>
              <p>
                El contacto directo ayuda a que ambas partes puedan avanzar sin
                procesos innecesarios.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="page-shell home-page__section">
        <Card className="home-page__value-card home-page__reveal">
          <div>
            <span className="home-page__eyebrow">Enfoque especializado</span>
            <h2>
              No es una bolsa laboral genérica. Es una plataforma deportiva.
            </h2>
            <p>
              Busco Profe pone en primer plano los datos que realmente importan
              en el mundo deportivo: experiencia, ubicación, disponibilidad,
              modalidad, aptitudes, idiomas y formas de contacto.
            </p>
          </div>

          <div className="home-page__value-list">
            <span>
              <CheckCircle2 size={18} />
              Información ordenada por secciones
            </span>
            <span>
              <CheckCircle2 size={18} />
              Perfiles públicos claros
            </span>
            <span>
              <CheckCircle2 size={18} />
              Diseño responsive
            </span>
            <span>
              <CheckCircle2 size={18} />
              Contacto directo entre usuarios
            </span>
          </div>
        </Card>
      </section>

      <section className="page-shell home-page__final-cta">
        <Card className="home-page__final-cta-card home-page__reveal">
          <div>
            <span className="home-page__eyebrow">Empezá ahora</span>
            <h2>
              Sumate a una forma más profesional de buscar y ofrecer trabajo
              deportivo
            </h2>
            <p>
              Creá tu cuenta, completá tu perfil y empezá a conectar con el
              ecosistema deportivo.
            </p>
          </div>

          <div className="home-page__final-actions">
            <Link to="/register">
              <Button icon={<Send size={16} />}>Crear cuenta</Button>
            </Link>

            <Link to="/jobs">
              <Button variant="secondary">Explorar vacantes</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default HomePage;
