import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ApiMessage from "../../components/common/ApiMessage";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
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

    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo iniciar sesión."));
    }
  };

  return (
    <div className="page-shell auth-page">
      <Card className="auth-page__card">
        <div className="auth-page__header">
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
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
