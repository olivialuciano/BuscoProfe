import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate, Link } from "react-router-dom";
import { Building2, GraduationCap, ArrowLeft, UserPlus } from "lucide-react";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import ApiMessage from "../../components/common/ApiMessage";
import { startRegistration } from "../../api/authService";
import {
  INSTITUTION_TYPE_OPTIONS,
  USER_ROLE_VALUES,
} from "../../utils/constants";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./RegisterPage.css";

const baseForm = {
  role: USER_ROLE_VALUES.PROFESSOR,
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  legalName: "",
  tradeName: "",
  institutionType: "",
  city: "Rosario",
  province: "Santa Fe",
  country: "Argentina",
};

function RegisterPage() {
  const { type } = useParams();
  const navigate = useNavigate();

  const isInstitution = type === "institution";
  const isProfessor = type === "professor";

  const [form, setForm] = useState(baseForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isInstitution) {
      setForm((current) => ({
        ...current,
        role: USER_ROLE_VALUES.INSTITUTION,
      }));
    }

    if (isProfessor) {
      setForm((current) => ({
        ...current,
        role: USER_ROLE_VALUES.PROFESSOR,
      }));
    }
  }, [isInstitution, isProfessor]);

  if (!isInstitution && !isProfessor) {
    return <Navigate to="/register" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: Number(form.role),
      firstName: isInstitution ? null : form.firstName || null,
      lastName: isInstitution ? null : form.lastName || null,
      legalName: isInstitution ? form.legalName || null : null,
      tradeName: isInstitution ? form.tradeName || null : null,
      institutionType:
        isInstitution && form.institutionType !== ""
          ? Number(form.institutionType)
          : null,
      city: form.city || null,
      province: form.province || null,
      country: form.country || null,
    };

    try {
      setIsSubmitting(true);

      await startRegistration(payload);

      const successMessage = isInstitution
        ? "Te enviamos un código de verificación por email. Cuando lo confirmes, tu institución quedará pendiente de aprobación por un administrador."
        : "Te enviamos un código de verificación por email. Ingresalo para crear tu cuenta.";

      setMessage(successMessage);

      navigate(`/verify-email-code?email=${encodeURIComponent(payload.email)}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo iniciar el registro."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell register-page">
      <Card className="register-page__card">
        <div className="register-page__back-row">
          <Link to="/register" className="register-page__back-link">
            <ArrowLeft size={16} />
            Cambiar tipo de cuenta
          </Link>
        </div>

        <div className="register-page__header">
          <div
            className={`register-page__icon ${
              isInstitution
                ? "register-page__icon--institution"
                : "register-page__icon--professor"
            }`}
          >
            {isInstitution ? (
              <Building2 size={24} />
            ) : (
              <GraduationCap size={24} />
            )}
          </div>

          <div>
            <h1>
              {isInstitution
                ? "Registro de institución"
                : "Registro de profesor"}
            </h1>
            <p>
              {isInstitution
                ? "Completá los datos de tu organización para comenzar a publicar vacantes."
                : "Completá tus datos para crear tu perfil profesional en Busco Profe."}
            </p>
          </div>
        </div>

        <form className="register-page__form" onSubmit={handleSubmit}>
          {isInstitution ? (
            <>
              <div className="register-page__section-title">
                Datos de la institución
              </div>

              <InputField
                label="Razón social"
                name="legalName"
                value={form.legalName}
                onChange={handleChange}
              />

              <InputField
                label="Nombre comercial"
                name="tradeName"
                value={form.tradeName}
                onChange={handleChange}
              />

              <SelectField
                label="Tipo de institución"
                name="institutionType"
                value={form.institutionType}
                onChange={handleChange}
                options={INSTITUTION_TYPE_OPTIONS}
              />
            </>
          ) : (
            <>
              <div className="register-page__section-title">
                Datos personales
              </div>

              <div className="register-page__grid">
                <InputField
                  label="Nombre"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />
                <InputField
                  label="Apellido"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="register-page__section-title">Ubicación</div>

          <div className="register-page__grid">
            <InputField
              label="Ciudad"
              name="city"
              value={form.city}
              onChange={handleChange}
            />
            <InputField
              label="Provincia"
              name="province"
              value={form.province}
              onChange={handleChange}
            />
          </div>

          <InputField
            label="País"
            name="country"
            value={form.country}
            onChange={handleChange}
          />

          <div className="register-page__section-title">Acceso</div>

          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <InputField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <ApiMessage type="success">{message}</ApiMessage>
          <ApiMessage type="error">{error}</ApiMessage>

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
            icon={<UserPlus size={16} />}
          >
            {isSubmitting ? "Enviando código..." : "Registrarme"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default RegisterPage;
