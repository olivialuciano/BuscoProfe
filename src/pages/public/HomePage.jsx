import { Link } from "react-router-dom";
import {
  Building2,
  UserRoundSearch,
  LayoutDashboard,
  Sparkles,
  BriefcaseBusiness,
  CheckCircle2,
  Send,
  Waves,
} from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../contexts/AuthContext";
import { isAdmin, isInstitution } from "../../utils/roleUtils";
import "./HomePage.css";
import { getMyUser } from "../../api/usersService";

const getJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken")
  );
};

const getLoggedUserId = (user) => {
  const token = getStoredToken();
  const payload = token ? getJwtPayload(token) : null;

  return (
    user?.id ||
    user?.Id ||
    user?.userId ||
    user?.UserId ||
    user?.nameIdentifier ||
    user?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    payload?.id ||
    payload?.Id ||
    payload?.userId ||
    payload?.UserId ||
    payload?.nameid ||
    payload?.sub ||
    payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ]
  );
};

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [profileUser, setProfileUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

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

  useEffect(() => {
    const fetchLoggedUserData = async () => {
      if (!isAuthenticated || !user) return;

      const loggedUserId = getLoggedUserId(user);

      if (!loggedUserId) {
        console.warn("No se pudo detectar el ID del usuario logueado.");
        setProfileUser(user);
        return;
      }

      try {
        setIsLoadingProfile(true);

        const data = await getMyUser(loggedUserId);

        console.log("Usuario completo desde API:", data);

        setProfileUser(data);
      } catch (error) {
        console.error("Error obteniendo datos del usuario logueado:", error);
        setProfileUser(user);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchLoggedUserData();
  }, [isAuthenticated, user]);

  const pageStyle = {
    "--scroll-progress": scrollProgress,
    "--flow-y": `${scrollProgress * 220}px`,
    "--flow-x": `${scrollProgress * 90}px`,
    "--flow-rotate": `${scrollProgress * 28}deg`,
  };

  if (isAuthenticated) {
    const currentUser = profileUser || user;

    const professorName =
      currentUser?.firstName || currentUser?.FirstName || "profe";

    const institutionName =
      currentUser?.tradeName || currentUser?.TradeName || "institución";

    const adminName =
      currentUser?.firstName ||
      currentUser?.FirstName ||
      currentUser?.name ||
      currentUser?.Name ||
      "Administrador";

    const authenticatedTitle = isLoadingProfile
      ? "Hola..."
      : isAdmin(user)
        ? `Hola, ${adminName}`
        : isInstitution(user)
          ? `Hola, ${institutionName}`
          : `Hola, ${professorName}`;

    const authenticatedDescription = isAdmin(user)
      ? "Gestioná usuarios, perfiles y el funcionamiento general de la plataforma desde tu panel administrativo."
      : isInstitution(user)
        ? "Publicá vacantes, mantené actualizado tu perfil institucional y conectá con profesionales del mundo deportivo."
        : "Mantené tu perfil actualizado, explorá vacantes deportivas y postuláte a oportunidades que se ajusten a tu experiencia.";

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

              <h1>{authenticatedTitle}</h1>

              <p>{authenticatedDescription}</p>

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
              <Link to="/register">
                <Button variant="secondary">Crear cuenta</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell home-page__section">
        <div className="home-page__section-heading home-page__reveal">
          <span className="home-page__eyebrow">Una plataforma, dos roles</span>
          <h2>
            Diseñada para quienes buscan profesionales y para quienes buscan
            oportunidades.
          </h2>
        </div>

        <div className="home-page__features">
          <Card className="home-page__feature-card home-page__reveal">
            <div className="home-page__feature-icon">
              <Building2 size={28} />
            </div>

            <h3>Para instituciones</h3>

            <p>
              Publican vacantes, muestran su perfil institucional y contactan
              con profesionales.
            </p>
          </Card>

          <Card className="home-page__feature-card home-page__feature-card--highlight home-page__reveal">
            <div className="home-page__feature-icon">
              <UserRoundSearch size={28} />
            </div>

            <h3>Para profesores</h3>

            <p>
              Crean un perfil y se postulan a oportunidades de manera simple y
              directa.
            </p>
          </Card>
        </div>
      </section>

      <section className="home-page__flow-section">
        <div className="page-shell home-page__section">
          <div className="home-page__section-heading home-page__reveal">
            <span className="home-page__eyebrow">Flujo simple</span>
            <h2>Una experiencia pensada para avanzar sin fricción.</h2>
            <p>
              Desde el registro hasta el contacto, la plataforma guía al usuario
              con pasos claros. <br />
              Los usuarios pueden navegar perfiles, vacantes e información del
              ecosistema deportivo. <br />
              Las instituciones publican búsquedas y los profesores se postulan
              de manera directa.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell home-page__final-cta">
        <Card className="home-page__final-cta-card home-page__reveal">
          <div>
            <span className="home-page__eyebrow">Empezá ahora</span>
            <h2>Creá tu cuenta y conectá con oportunidades deportivas.</h2>
          </div>

          <div className="home-page__final-actions">
            <Link to="/register">
              <Button icon={<Send size={16} />}>Crear cuenta</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default HomePage;
