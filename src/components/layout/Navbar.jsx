import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  LogIn,
  BriefcaseBusiness,
  House,
  Briefcase,
  UserPlus,
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  Bell,
  Bookmark,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { isAdmin, isInstitution } from "../../utils/roleUtils";
import Modal from "../common/Modal";
import "./Navbar.css";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const links = !isAuthenticated
    ? [
        {
          to: "/",
          label: "Inicio",
          icon: <House size={20} />,
          mobileClassName: "",
        },
        {
          to: "/jobs",
          label: "Vacantes",
          icon: <Briefcase size={20} />,
          mobileClassName: "",
        },
        {
          to: "/register",
          label: "Registro",
          icon: <UserPlus size={20} />,
          mobileClassName: "mobile-bottom-nav__item--register",
        },
      ]
    : isAdmin(user)
      ? [
          {
            to: "/admin",
            label: "Dashboard",
            icon: <House size={20} />,
            mobileClassName: "",
          },
          {
            to: "/admin/users",
            label: "Usuarios",
            icon: <Users size={20} />,
            mobileClassName: "",
          },
        ]
      : isInstitution(user)
        ? [
            {
              to: "/institution",
              label: "Dashboard",
              icon: <LayoutDashboard size={20} />,
              mobileClassName: "",
            },
            {
              to: "/jobs",
              label: "Vacantes",
              icon: <Briefcase size={20} />,
              mobileClassName: "",
            },
            {
              to: "/institution/jobs",
              label: "Mis vacantes",
              icon: <Bookmark size={20} />,
              mobileClassName: "",
            },
            {
              to: "/institution/professors",
              label: "Profesores",
              icon: <Users size={20} />,
              mobileClassName: "",
            },

            {
              to: "/institution/notifications",
              label: "Notificaciones",
              icon: <Bell size={20} />,
              mobileClassName: "",
            },
            {
              to: "/institution/profile",
              label: "Perfil",
              icon: <UserCircle size={20} />,
              mobileClassName: "",
            },
          ]
        : [
            {
              to: "/jobs",
              label: "Vacantes",
              icon: <Briefcase size={20} />,
              mobileClassName: "",
            },
            {
              to: "/professor/institutions",
              label: "Instituciones",
              icon: <Building2 size={20} />,
              mobileClassName: "",
            },

            {
              to: "/professor/profile",
              label: "Perfil",
              icon: <UserCircle size={20} />,
              mobileClassName: "",
            },
            {
              to: "/professor/applications",
              label: "Postulaciones",
              icon: <LayoutDashboard size={20} />,
              mobileClassName: "",
            },
            {
              to: "/professor/saved-jobs",
              label: "Guardados",
              icon: <Bookmark size={20} />,
              mobileClassName: "",
            },
            {
              to: "/professor/favorite-institutions",
              label: "Favoritas",
              icon: <Star size={20} />,
              mobileClassName: "",
            },
            {
              to: "/professor/notifications",
              label: "Notificaciones",
              icon: <Bell size={20} />,
              mobileClassName: "",
            },
          ];

  return (
    <>
      <header className="navbar navbar--desktop">
        <div className="page-shell navbar__inner">
          <Link to="/" className="navbar__brand">
            <div className="navbar__logo">
              <BriefcaseBusiness size={20} />
            </div>
            <div>
              <strong>Busco Profe</strong>
              <span>Portal laboral deportivo</span>
            </div>
          </Link>

          <nav className="navbar__links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                className="navbar__logout navbar__logout--desktop"
                onClick={handleLogoutClick}
              >
                <LogOut size={16} /> Salir
              </button>
            ) : (
              <Link
                to="/login"
                className="navbar__login navbar__login--desktop"
              >
                <LogIn size={16} /> Ingresar
              </Link>
            )}
          </nav>
        </div>
      </header>

      <header className="mobile-top-brand">
        <Link to="/" className="mobile-top-brand__link">
          <div className="mobile-top-brand__logo">
            <BriefcaseBusiness size={18} />
          </div>
          <span>BUSCO PROFE</span>
        </Link>
      </header>

      <nav
        className={`mobile-bottom-nav ${!isAuthenticated ? "mobile-bottom-nav--guest" : ""}`}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `mobile-bottom-nav__item ${link.mobileClassName || ""} ${isActive ? "mobile-bottom-nav__item--active" : ""}`.trim()
            }
            aria-label={link.label}
            title={link.label}
          >
            <span className="mobile-bottom-nav__icon">{link.icon}</span>
          </NavLink>
        ))}

        {isAuthenticated ? (
          <button
            type="button"
            className="mobile-bottom-nav__item mobile-bottom-nav__item--logout"
            onClick={handleLogoutClick}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <span className="mobile-bottom-nav__icon">
              <LogOut size={20} />
            </span>
          </button>
        ) : (
          <Link
            to="/login"
            className="mobile-bottom-nav__item mobile-bottom-nav__item--login"
            aria-label="Iniciar sesión"
            title="Iniciar sesión"
          >
            <span className="mobile-bottom-nav__icon">
              <LogIn size={20} />
            </span>
          </Link>
        )}
      </nav>

      <Modal
        open={showLogoutModal}
        onClose={cancelLogout}
        icon={<LogOut size={24} />}
        tone="danger"
        title="¿Querés cerrar sesión?"
        description="Esto evita cierres accidentales si tocaste el ícono sin querer."
        actions={
          <>
            <button
              type="button"
              className="app-modal__button app-modal__button--secondary"
              onClick={cancelLogout}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="app-modal__button app-modal__button--danger"
              onClick={confirmLogout}
            >
              Cerrar sesión
            </button>
          </>
        }
      />
    </>
  );
}

export default Navbar;
