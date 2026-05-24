import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import ApiMessage from "../../components/common/ApiMessage";
import { forgotPassword, resetPassword } from "../../api/authService";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("request-code");

  const [form, setForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "code") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 6);

      setForm((current) => ({
        ...current,
        code: onlyNumbers,
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setError("Ingresá el email de tu cuenta.");
      return;
    }

    try {
      setIsRequestingCode(true);

      await forgotPassword(email);

      setForm((current) => ({
        ...current,
        email,
      }));

      setStep("reset-password");
      setMessage(
        "Si existe una cuenta con ese email, te enviamos un código para cambiar la contraseña.",
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo enviar el código."));
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setError("Ingresá el email de tu cuenta.");
      return;
    }

    if (form.code.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    if (!form.newPassword) {
      setError("Ingresá la nueva contraseña.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsResettingPassword(true);

      await resetPassword(
        email,
        form.code,
        form.newPassword,
        form.confirmNewPassword,
      );

      setMessage("La contraseña fue cambiada correctamente.");

      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "La contraseña fue cambiada correctamente. Ya podés iniciar sesión.",
          },
        });
      }, 1000);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo cambiar la contraseña."));
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleBackToEmailStep = () => {
    setStep("request-code");
    setMessage("");
    setError("");
    setForm((current) => ({
      ...current,
      code: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
  };

  return (
    <div className="page-shell forgot-password-page">
      <Card className="forgot-password-page__card">
        <div className="forgot-password-page__header">
          <div className="forgot-password-page__icon">
            <KeyRound size={26} />
          </div>

          <div>
            <h1>Cambiar contraseña</h1>
            <p>
              Te enviaremos un código de 6 dígitos al email registrado en tu
              cuenta.
            </p>
          </div>
        </div>

        {step === "request-code" ? (
          <form
            className="forgot-password-page__form"
            onSubmit={handleRequestCode}
          >
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
            />

            <ApiMessage type="success">{message}</ApiMessage>
            <ApiMessage type="error">{error}</ApiMessage>

            <Button
              type="submit"
              fullWidth
              disabled={isRequestingCode}
              icon={<Mail size={16} />}
            >
              {isRequestingCode ? "Enviando código..." : "Enviar código"}
            </Button>
          </form>
        ) : (
          <form
            className="forgot-password-page__form"
            onSubmit={handleResetPassword}
          >
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
            />

            <InputField
              label="Código de verificación"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
            />

            <InputField
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Nueva contraseña"
            />

            <InputField
              label="Confirmar nueva contraseña"
              name="confirmNewPassword"
              type="password"
              value={form.confirmNewPassword}
              onChange={handleChange}
              placeholder="Repetí la nueva contraseña"
            />

            <ApiMessage type="success">{message}</ApiMessage>
            <ApiMessage type="error">{error}</ApiMessage>

            <Button
              type="submit"
              fullWidth
              disabled={isResettingPassword}
              icon={<ShieldCheck size={16} />}
            >
              {isResettingPassword
                ? "Cambiando contraseña..."
                : "Cambiar contraseña"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleRequestCode}
              disabled={isRequestingCode}
              icon={<Mail size={16} />}
            >
              {isRequestingCode ? "Reenviando..." : "Reenviar código"}
            </Button>

            <button
              type="button"
              className="forgot-password-page__text-button"
              onClick={handleBackToEmailStep}
            >
              Cambiar email
            </button>
          </form>
        )}

        <div className="forgot-password-page__footer">
          <Link to="/login">
            <ArrowLeft size={15} />
            Volver al login
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
