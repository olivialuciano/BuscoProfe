import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  LogIn,
  Dumbbell,
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
  Menu,
  X,
  MessageSquareText,
  ChevronDown,
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDesktopMoreMenu, setShowDesktopMoreMenu] = useState(false);

  const handleLogoutClick = () => {
    setShowMobileMenu(false);
    setShowDesktopMoreMenu(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    setShowMobileMenu(false);
    setShowDesktopMoreMenu(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const closeDesktopMoreMenu = () => {
    setShowDesktopMoreMenu(false);
  };

  const links = !isAuthenticated
    ? [
        {
          to: "/",
          label: "Inicio",
          icon: <House size={20} />,
        },

        {
          to: "/sugerencias",
          label: "Sugerencias",
          icon: <MessageSquareText size={20} />,
        },
        {
          to: "/register",
          label: "Registro",
          icon: <UserPlus size={20} />,
        },
      ]
    : isAdmin(user)
      ? [
          {
            to: "/admin",
            label: "Dashboard",
            icon: <House size={20} />,
          },
          {
            to: "/admin/users",
            label: "Usuarios",
            icon: <Users size={20} />,
          },
          {
            to: "/sugerencias",
            label: "Sugerencias",
            icon: <MessageSquareText size={20} />,
          },
        ]
      : isInstitution(user)
        ? [
            {
              to: "/institution",
              label: "Dashboard",
              icon: <LayoutDashboard size={20} />,
            },
            {
              to: "/institution/jobs",
              label: "Mis vacantes",
              icon: <Bookmark size={20} />,
            },
            {
              to: "/institution/professors",
              label: "Profesores",
              icon: <Users size={20} />,
            },
            {
              to: "/jobs",
              label: "Vacantes",
              icon: <Briefcase size={20} />,
            },
            {
              to: "/institution/notifications",
              label: "Notificaciones",
              icon: <Bell size={20} />,
            },
            {
              to: "/institution/profile",
              label: "Perfil",
              icon: <UserCircle size={20} />,
            },
            {
              to: "/sugerencias",
              label: "Sugerencias",
              icon: <MessageSquareText size={20} />,
            },
          ]
        : [
            {
              to: "/jobs",
              label: "Vacantes",
              icon: <Briefcase size={20} />,
            },
            {
              to: "/professor/applications",
              label: "Postulaciones",
              icon: <LayoutDashboard size={20} />,
            },
            {
              to: "/professor/saved-jobs",
              label: "Guardados",
              icon: <Bookmark size={20} />,
            },
            {
              to: "/professor/profile",
              label: "Perfil",
              icon: <UserCircle size={20} />,
            },
            {
              to: "/professor/institutions",
              label: "Instituciones",
              icon: <Building2 size={20} />,
            },
            {
              to: "/professor/favorite-institutions",
              label: "Favoritas",
              icon: <Star size={20} />,
            },
            {
              to: "/professor/notifications",
              label: "Notificaciones",
              icon: <Bell size={20} />,
            },
            {
              to: "/sugerencias",
              label: "Sugerencias",
              icon: <MessageSquareText size={20} />,
            },
          ];

  const getDesktopPrimaryLimit = () => {
    if (!isAuthenticated) return 3;
    if (isAdmin(user)) return 3;
    if (isInstitution(user)) return 4;
    return 4;
  };

  const desktopPrimaryLinks = links.slice(0, getDesktopPrimaryLimit());
  const desktopMoreLinks = links.slice(getDesktopPrimaryLimit());

  return (
    <>
      <header className="navbar navbar--desktop">
        <div className="page-shell navbar__inner">
          <Link to="/" className="navbar__brand" onClick={closeDesktopMoreMenu}>
            <div className="navbar__logo">
              <Dumbbell size={30} />
            </div>

            <div className="brand-title">
              <strong>Busco Profe</strong>
            </div>
          </Link>

          <nav className="navbar__links" aria-label="Navegación principal">
            {desktopPrimaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeDesktopMoreMenu}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {desktopMoreLinks.length ? (
              <div className="navbar__more-wrap">
                <button
                  type="button"
                  className={`navbar__more-button ${
                    showDesktopMoreMenu ? "navbar__more-button--open" : ""
                  }`}
                  onClick={() => setShowDesktopMoreMenu((current) => !current)}
                  aria-label="Abrir más opciones"
                  aria-expanded={showDesktopMoreMenu}
                >
                  Más
                  <ChevronDown size={16} />
                </button>

                {showDesktopMoreMenu ? (
                  <div className="navbar__more-menu">
                    {desktopMoreLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={closeDesktopMoreMenu}
                        className={({ isActive }) =>
                          `navbar__more-link ${
                            isActive ? "navbar__more-link--active" : ""
                          }`
                        }
                      >
                        <span className="navbar__more-icon">{link.icon}</span>
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

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
                onClick={closeDesktopMoreMenu}
              >
                <LogIn size={16} /> Ingresar
              </Link>
            )}
          </nav>
        </div>
      </header>

      <header className="mobile-navbar">
        <Link to="/" className="mobile-navbar__brand" onClick={closeMobileMenu}>
          <div className="mobile-navbar__logo">
            <Dumbbell size={28} />
          </div>

          <div className="mobile-navbar__brand-text">
            <div className="brand-title">
              <strong>Busco Profe</strong>
            </div>
          </div>
        </Link>

        <button
          type="button"
          className="mobile-navbar__menu-button"
          onClick={() => setShowMobileMenu((current) => !current)}
          aria-label={showMobileMenu ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={showMobileMenu}
        >
          {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <nav
            className="mobile-menu"
            onClick={(event) => event.stopPropagation()}
            aria-label="Navegación mobile"
          >
            <div className="mobile-menu__header">
              <div className="mobile-menu__brand">
                <div className="mobile-navbar__logo">
                  <Dumbbell size={24} />
                </div>

                <div>
                  <strong>Busco Profe</strong>
                  <span>Menú principal</span>
                </div>
              </div>

              <button
                type="button"
                className="mobile-menu__close"
                onClick={closeMobileMenu}
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-menu__links">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `mobile-menu__link ${
                      isActive ? "mobile-menu__link--active" : ""
                    }`
                  }
                >
                  <span className="mobile-menu__icon">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="mobile-menu__footer">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="mobile-menu__action mobile-menu__action--logout"
                  onClick={handleLogoutClick}
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/login"
                  className="mobile-menu__action mobile-menu__action--login"
                  onClick={closeMobileMenu}
                >
                  <LogIn size={18} />
                  Ingresar
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      {showDesktopMoreMenu ? (
        <button
          type="button"
          className="navbar__desktop-backdrop"
          aria-label="Cerrar menú"
          onClick={closeDesktopMoreMenu}
        />
      ) : null}

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
