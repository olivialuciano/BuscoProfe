import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, KeyRound } from "lucide-react";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ApiMessage from "../../components/common/ApiMessage";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setError("Ingresá tu email.");
      return;
    }

    if (!form.password) {
      setError("Ingresá tu contraseña.");
      return;
    }

    try {
      await login(email, form.password);
      navigate("/");
    } catch (err) {
      const data = err?.response?.data;

      if (data?.requiresEmailVerification) {
        const pendingEmail = data.email || email;

        navigate(
          `/verify-email-code?email=${encodeURIComponent(
            pendingEmail,
          )}&from=login`,
          {
            state: {
              message:
                data.message ||
                "Tu cuenta todavía no fue verificada. Ingresá el código de 6 dígitos.",
            },
          },
        );

        return;
      }

      setError(getApiErrorMessage(err, "No se pudo iniciar sesión."));
    }
  };

  return (
    <div className="page-shell auth-page">
      <Card className="auth-page__card">
        <div className="auth-page__header">
          <div className="auth-page__icon">
            <LogIn size={26} />
          </div>

          <div>
            <h1>Ingresar</h1>
            <p>Usá tu email y contraseña para acceder al portal.</p>
          </div>
        </div>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
          />

          <InputField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <ApiMessage type="error">{error}</ApiMessage>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </Button>
          <div className="auth-page__forgot-row">
            <Link to="/forgot-password" className="auth-page__forgot-link">
              <KeyRound size={15} />
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="auth-page__footer">
            <span>¿Todavía no tenés cuenta?</span>
            <Link to="/register">Crear cuenta</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
