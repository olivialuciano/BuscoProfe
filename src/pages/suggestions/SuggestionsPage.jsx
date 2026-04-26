import { useMemo, useState } from "react";
import {
  Mail,
  MessageSquareText,
  Send,
  User,
  AtSign,
  CheckCircle2,
} from "lucide-react";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import ApiMessage from "../../components/common/ApiMessage";
import "./SuggestionsPage.css";
import { useToast } from "../../contexts/ToastContext";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xkokeaod";

function SuggestionsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    suggestion: "",
  });
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const isFormComplete = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.suggestion.trim();
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Ingresá tu nombre.";
    }

    if (!form.email.trim()) {
      return "Ingresá tu correo.";
    }

    if (!form.email.includes("@")) {
      return "Ingresá un correo válido.";
    }

    if (!form.suggestion.trim()) {
      return "Escribí tu comentario o sugerencia.";
    }

    if (form.suggestion.trim().length < 10) {
      return "La sugerencia debe tener al menos 10 caracteres.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (sending) return;

    setError("");
    setSuccess("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSending(true);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: form.name.trim(),
          correo: form.email.trim(),
          sugerencia: form.suggestion.trim(),
          _subject: "Nueva sugerencia sobre Busco Profe",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar la sugerencia.");
      }

      showToast("¡Gracias! Tu sugerencia fue enviada correctamente.");
      setForm({
        name: "",
        email: "",
        suggestion: "",
      });
    } catch (err) {
      setError(
        "No se pudo enviar la sugerencia. Intentá nuevamente en unos minutos.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-shell suggestions-page">
      <section className="suggestions-page__hero">
        <div className="suggestions-page__icon">
          <MessageSquareText size={34} />
        </div>

        <div>
          <span className="suggestions-page__eyebrow">
            Tu opinión nos ayuda
          </span>
          <h1>Comentarios y sugerencias</h1>
          <p>
            Contanos qué mejorarías de Busco Profe. Tu comentario será enviado
            directamente a nuestro correo para poder revisarlo.
          </p>
        </div>
      </section>

      <Card className="suggestions-page__card">
        <ApiMessage type="error">{error}</ApiMessage>

        {success ? (
          <div className="suggestions-page__success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        ) : null}

        <form className="suggestions-page__form" onSubmit={handleSubmit}>
          <div className="suggestions-page__grid">
            <InputField
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
              icon={<User size={16} />}
              required
            />

            <InputField
              label="Correo"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              icon={<AtSign size={16} />}
              required
            />
          </div>

          <InputField
            label="Comentario o sugerencia"
            name="suggestion"
            value={form.suggestion}
            onChange={handleChange}
            textarea
            required
          />

          <div className="suggestions-page__actions">
            <Button
              type="submit"
              icon={<Send size={16} />}
              disabled={!isFormComplete || sending}
            >
              {sending ? "Enviando..." : "Enviar sugerencia"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SuggestionsPage;
