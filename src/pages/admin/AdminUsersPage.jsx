import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  activateUser,
  inactivateUser,
} from "../../api/usersService";
import { UserCircle, Building2, ShieldCheck, Search } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import "./AdminUsersPage.css";

function normalizeRole(role) {
  const value = String(role).toLowerCase();

  if (value === "0" || value.includes("admin")) return "admin";
  if (value === "1" || value.includes("professor")) return "professor";
  if (value === "2" || value.includes("institution")) return "institution";

  return "unknown";
}

function getRoleLabel(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") return "Administrador";
  if (normalizedRole === "professor") return "Profesor";
  if (normalizedRole === "institution") return "Institución";

  return "Desconocido";
}

function getRoleIcon(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") return <ShieldCheck size={18} />;
  if (normalizedRole === "professor") return <UserCircle size={18} />;
  if (normalizedRole === "institution") return <Building2 size={18} />;

  return <UserCircle size={18} />;
}

const roleFilterOptions = [
  { value: "", label: "Todos los roles" },
  { value: "professor", label: "Profesores" },
  { value: "institution", label: "Instituciones" },
  { value: "admin", label: "Administradores" },
];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
  });

  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const search = filters.search.trim().toLowerCase();

        if (!search) return true;

        const searchableText = [
          user.email,
          user.firstName,
          user.lastName,
          user.tradeName,
          user.legalName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(search);
      })
      .filter((user) => {
        if (!filters.role) return true;
        return normalizeRole(user.role) === filters.role;
      });
  }, [users, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleToggleActive = async (user) => {
    try {
      if (user.isActive) {
        await inactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }

      await loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavigate = (user) => {
    const role = normalizeRole(user.role);

    if (role === "professor") {
      navigate(`/professors/${user.id}`);
    }

    if (role === "institution") {
      navigate(`/institutions/${user.id}`);
    }
  };

  return (
    <div className="page-shell admin-users">
      <header>
        <h1 className="section-title">Usuarios</h1>
        <p className="section-subtitle">
          Gestión general de usuarios del sistema.
        </p>
      </header>

      <Card className="admin-users__filters">
        <div className="admin-users__search">
          <InputField
            label="Buscar usuario"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Buscar por email, nombre, apellido o institución"
            icon={<Search size={16} />}
          />
        </div>

        <div className="admin-users__role-filter">
          <SelectField
            label="Rol"
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            options={roleFilterOptions}
          />
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner text="Cargando usuarios..." />
      ) : filteredUsers.length ? (
        <div className="admin-users__grid">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="admin-users__card"
              onClick={() => handleNavigate(user)}
            >
              <div className="admin-users__top">
                <div className="admin-users__identity">
                  <div className="admin-users__icon">
                    {getRoleIcon(user.role)}
                  </div>

                  <div>
                    <h3>{user.email}</h3>
                    <p>{getRoleLabel(user.role)}</p>
                  </div>
                </div>

                <span
                  className={`admin-users__status ${
                    user.isActive
                      ? "admin-users__status--active"
                      : "admin-users__status--inactive"
                  }`}
                >
                  {user.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div
                className="admin-users__actions"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant={user.isActive ? "danger" : "success"}
                  onClick={() => handleToggleActive(user)}
                >
                  {user.isActive ? "Inactivar" : "Activar"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay usuarios para esos filtros"
          description="Probá cambiando el texto de búsqueda o el rol seleccionado."
        />
      )}
    </div>
  );
}

export default AdminUsersPage;
