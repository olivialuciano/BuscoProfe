import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MailCheck, RefreshCw } from "lucide-react";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import ApiMessage from "../../components/common/ApiMessage";
import {
  resendEmailVerificationCode,
  verifyEmailCode,
} from "../../api/authService";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./VerifyEmailCodePage.css";

function VerifyEmailCodePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(
    emailFromUrl
      ? `Te enviamos un código de 6 dígitos a ${emailFromUrl}.`
      : "Ingresá tu email y el código que recibiste.",
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleCodeChange = (event) => {
    const onlyNumbers = event.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(onlyNumbers);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Ingresá tu email.");
      return;
    }

    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    try {
      setIsSubmitting(true);

      await verifyEmailCode(email.trim().toLowerCase(), code);

      setMessage("Email verificado correctamente. Tu cuenta fue creada.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo verificar el email."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Ingresá tu email para reenviar el código.");
      return;
    }

    try {
      setIsResending(true);

      await resendEmailVerificationCode(email.trim().toLowerCase());

      setCode("");
      setMessage("Te enviamos un nuevo código. Revisá tu correo.");
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo reenviar el código."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="page-shell verify-email-code-page">
      <Card className="verify-email-code-page__card">
        <div className="verify-email-code-page__icon">
          <MailCheck size={28} />
        </div>

        <h1>Verificá tu email</h1>

        <p className="verify-email-code-page__description">
          Ingresá el código de 6 dígitos que te enviamos por correo para crear
          tu cuenta.
        </p>

        <form className="verify-email-code-page__form" onSubmit={handleSubmit}>
          <InputField
            label="Código de verificación"
            name="code"
            value={code}
            onChange={handleCodeChange}
            placeholder="123456"
            inputMode="numeric"
          />

          <ApiMessage type="success">{message}</ApiMessage>
          <ApiMessage type="error">{error}</ApiMessage>

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
            icon={<MailCheck size={16} />}
          >
            {isSubmitting ? "Verificando..." : "Verificar y crear cuenta"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={isResending}
            icon={<RefreshCw size={16} />}
            onClick={handleResendCode}
          >
            {isResending ? "Reenviando..." : "Reenviar código"}
          </Button>
        </form>

        <div className="verify-email-code-page__footer">
          <Link to="/login">Volver al login</Link>
        </div>
      </Card>
    </div>
  );
}

export default VerifyEmailCodePage;
