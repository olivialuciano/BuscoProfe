import { Link } from "react-router-dom";
import {
  Building2,
  UserRoundSearch,
  LayoutDashboard,
  Send,
  Waves,
  Briefcase,
  Bookmark,
  ClipboardList,
  Plus,
  UsersRound,
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

    const isInstitutionUser = isInstitution(user);
    const isAdminUser = isAdmin(user);

    const authenticatedTitle = isLoadingProfile
      ? "Hola..."
      : isAdminUser
        ? `Hola, ${adminName}`
        : isInstitutionUser
          ? `Hola, ${institutionName}`
          : `Hola, ${professorName}`;

    const authenticatedDescription = isAdminUser
      ? "Gestioná usuarios, perfiles y el funcionamiento general de la plataforma desde tu panel administrativo."
      : isInstitutionUser
        ? "Accedé rápido a tus vacantes, postulaciones y nuevas búsquedas laborales."
        : "Explorá oportunidades, seguí tus postulaciones y revisá las vacantes que guardaste.";

    const dashboardPath = isAdminUser
      ? "/admin"
      : isInstitutionUser
        ? "/institution"
        : "/professor";

    const primaryActions = isAdminUser
      ? [
          {
            to: dashboardPath,
            label: "Ir a mi panel",
            icon: <LayoutDashboard size={16} />,
            variant: "primary",
          },
          {
            to: "/admin/users",
            label: "Usuarios",
            icon: <UsersRound size={16} />,
            variant: "secondary",
          },
        ]
      : isInstitutionUser
        ? [
            {
              to: dashboardPath,
              label: "Ir a mi panel",
              icon: <LayoutDashboard size={16} />,
              variant: "primary",
            },
            {
              to: "/institution/jobs/new",
              label: "Publicar vacante",
              icon: <Plus size={16} />,
              variant: "secondary",
            },
          ]
        : [
            {
              to: dashboardPath,
              label: "Ir a mi panel",
              icon: <LayoutDashboard size={16} />,
              variant: "primary",
            },
            {
              to: "/jobs",
              label: "Ver vacantes",
              icon: <Briefcase size={16} />,
              variant: "secondary",
            },
          ];

    const secondaryActions = isAdminUser
      ? []
      : isInstitutionUser
        ? [
            {
              to: "/institution/jobs",
              label: "Mis vacantes",
              icon: <Briefcase size={16} />,
            },
            {
              to: "/institution/applications",
              label: "Postulaciones",
              icon: <ClipboardList size={16} />,
            },
          ]
        : [
            {
              to: "/professor/applications",
              label: "Mis postulaciones",
              icon: <ClipboardList size={16} />,
            },
            {
              to: "/professor/saved-jobs",
              label: "Vacantes guardadas",
              icon: <Bookmark size={16} />,
            },
          ];

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
              <h1>{authenticatedTitle}</h1>

              <h3>{authenticatedDescription}</h3>

              <div className="home-page__hero-actions">
                {primaryActions.map((action) => (
                  <Link key={action.to} to={action.to}>
                    <Button
                      variant={
                        action.variant === "secondary" ? "secondary" : undefined
                      }
                      icon={action.icon}
                    >
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>

              {secondaryActions.length ? (
                <div className="home-page__hero-actions">
                  {secondaryActions.map((action) => (
                    <Link key={action.to} to={action.to}>
                      <Button variant="secondary" icon={action.icon}>
                        {action.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
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
            <span className="home-page__eyebrow">Portal laboral deportivo</span>

            <div className="home-page__section-heading home-page__reveal">
              <h2>
                El portal laboral para profesionales de la educación física, el
                deporte y actividades afines.
              </h2>

              <h3>
                Busco Profe conecta profesores, instructores, preparadores
                físicos, entrenadores y profesionales afines con instituciones
                que buscan cubrir vacantes de forma rápida y simple.
              </h3>
            </div>

            <div className="home-page__hero-actions">
              <Link to="/register">
                <Button variant="primary">Crear cuenta</Button>
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

            <h4>
              Publican vacantes, muestran su perfil institucional y contactan
              con profesionales.
            </h4>
          </Card>

          <Card className="home-page__feature-card home-page__feature-card--highlight home-page__reveal">
            <div className="home-page__feature-icon">
              <UserRoundSearch size={28} />
            </div>

            <h3>Para profesores</h3>

            <h4>
              Crean un perfil y se postulan a oportunidades de manera simple y
              directa.
            </h4>
          </Card>
        </div>
      </section>

      <section className="home-page__flow-section">
        <div className="page-shell home-page__section">
          <div className="home-page__section-heading home-page__reveal">
            <span className="home-page__eyebrow">Flujo simple</span>
            <h2>Diseñada para hacer más simple la búsqueda laboral.</h2>
            <h3>
              Encontrá oportunidades reales en instituciones deportivas,
              educativas y recreativas. Postulate fácil, ahorrá tiempo y seguí
              tus procesos desde un solo lugar.
            </h3>
          </div>
        </div>
      </section>

      <section className="page-shell home-page__final-cta">
        <Card className="home-page__final-cta-card home-page__reveal">
          <div>
            <span className="home-page__eyebrow">Empezá ahora</span>
            <h2>
              Creá tu cuenta y empezá a conectar con oportunidades reales.
            </h2>
            <h3>
              Registrate como profesional para postularte a vacantes o como
              institución para encontrar al profe que necesitás.
            </h3>
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
