import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { canAccessRole } from "../utils/roleUtils";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !canAccessRole(user, allowedRoles))
    return <Navigate to="/" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
