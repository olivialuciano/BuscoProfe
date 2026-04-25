import { BrowserRouter, useNavigate } from "react-router-dom";
import { LogIn, House } from "lucide-react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/common/ToastContainer";
import Modal from "./components/common/Modal";
import { setUnauthorizedHandler } from "./api/client";
import { useEffect } from "react";

function SessionExpiredModalBridge() {
  const navigate = useNavigate();
  const { sessionExpired, expireSession, closeSessionExpiredModal } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      expireSession();
    });
  }, [expireSession]);

  const goToLogin = () => {
    closeSessionExpiredModal();
    navigate("/login");
  };

  const goToHome = () => {
    closeSessionExpiredModal();
    navigate("/");
  };

  return (
    <Modal
      open={sessionExpired}
      onClose={goToHome}
      icon={<LogIn size={24} />}
      tone="warning"
      title="Tu sesión expiró"
      description="Por seguridad, tenés que volver a iniciar sesión o regresar al inicio."
      actions={
        <>
          <button
            type="button"
            className="app-modal__button app-modal__button--secondary"
            onClick={goToHome}
          >
            <House
              size={16}
              style={{ marginRight: 8, verticalAlign: "middle" }}
            />
            Home
          </button>
          <button
            type="button"
            className="app-modal__button app-modal__button--primary"
            onClick={goToLogin}
          >
            <LogIn
              size={16}
              style={{ marginRight: 8, verticalAlign: "middle" }}
            />
            Iniciar sesión
          </button>
        </>
      }
    />
  );
}

function AppInner() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
      <SessionExpiredModalBridge />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
