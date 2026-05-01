import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createJobPosting } from "../../api/jobPostingsService";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import "./InstitutionCreateJobPage.css";

const PROFESSIONAL_TYPE_OPTIONS = [
  { value: 0, label: "Profesor" },
  { value: 1, label: "Instructor" },
  { value: 2, label: "Preparador físico" },
  { value: 3, label: "Director técnico" },
  { value: 4, label: "Guardavidas" },
  { value: 5, label: "Video analista" },
  { value: 6, label: "Otro" },
];

const DISCIPLINE_OPTIONS = [
  { value: 0, label: "Aikido" },
  { value: 1, label: "Ajedrez" },
  { value: 2, label: "Aquagym" },
  { value: 3, label: "Artes marciales mixtas" },
  { value: 4, label: "Atletismo" },
  { value: 5, label: "Bádminton" },
  { value: 6, label: "Básquetbol" },
  { value: 7, label: "Beach volley" },
  { value: 8, label: "Béisbol" },
  { value: 9, label: "Bochas" },
  { value: 10, label: "Boxeo" },
  { value: 11, label: "BMX" },
  { value: 12, label: "Calistenia" },
  { value: 13, label: "Cheerleading" },
  { value: 14, label: "Ciclismo" },
  { value: 15, label: "Crossfit" },
  { value: 16, label: "Danza" },
  { value: 17, label: "Equitación" },
  { value: 18, label: "Esgrima" },
  { value: 19, label: "Fisicoculturismo" },
  { value: 20, label: "Frontón" },
  { value: 21, label: "Fútbol" },
  { value: 22, label: "Fútbol playa" },
  { value: 23, label: "Fútbol sala" },
  { value: 24, label: "Gimnasia acrobática" },
  { value: 25, label: "Gimnasia artística" },
  { value: 26, label: "Gimnasia rítmica" },
  { value: 27, label: "Golf" },
  { value: 28, label: "Handball" },
  { value: 29, label: "Hockey sobre césped" },
  { value: 30, label: "Hockey sobre patines" },
  { value: 31, label: "Jiu jitsu" },
  { value: 32, label: "Judo" },
  { value: 33, label: "Karate" },
  { value: 34, label: "Kayak" },
  { value: 35, label: "Kickboxing" },
  { value: 36, label: "Kitesurf" },
  { value: 37, label: "Kung fu" },
  { value: 38, label: "Muay thai" },
  { value: 39, label: "Musculación" },
  { value: 40, label: "Natación" },
  { value: 41, label: "Natación artística" },
  { value: 42, label: "Pádel" },
  { value: 43, label: "Patín artístico" },
  { value: 44, label: "Patín carrera" },
  { value: 45, label: "Patinaje sobre hielo" },
  { value: 46, label: "Pelota paleta" },
  { value: 47, label: "Pilates" },
  { value: 48, label: "Polo" },
  { value: 49, label: "Powerlifting" },
  { value: 50, label: "Remo" },
  { value: 51, label: "Rugby" },
  { value: 52, label: "Running" },
  { value: 53, label: "Skateboarding" },
  { value: 54, label: "Softbol" },
  { value: 55, label: "Spinning" },
  { value: 56, label: "Squash" },
  { value: 57, label: "Stretching" },
  { value: 58, label: "Surf" },
  { value: 59, label: "Taekwondo" },
  { value: 60, label: "Tenis" },
  { value: 61, label: "Tenis de mesa" },
  { value: 62, label: "Tiro con arco" },
  { value: 63, label: "Tiro deportivo" },
  { value: 64, label: "Triatlón" },
  { value: 65, label: "Ultimate frisbee" },
  { value: 66, label: "Vela" },
  { value: 67, label: "Voleibol" },
  { value: 68, label: "Waterpolo" },
  { value: 69, label: "Windsurf" },
  { value: 70, label: "Yoga" },
  { value: 71, label: "Zumba" },
  { value: 72, label: "Otro" },
];

function InstitutionCreateJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirementsText: "",
    benefitsText: "",
    daysAndHours: "",
    professionalType: "",
    discipline: "",
    isUrgent: false,
    workMode: "",
    contractType: "",
    availability: "",
    country: "Argentina",
    province: "Santa Fe",
    city: "Rosario",
    address: "",
    salaryText: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");

      await createJobPosting({
        institutionUserId: user.id,
        title: form.title,
        description: form.description,
        requirementsText: form.requirementsText || null,
        benefitsText: form.benefitsText || null,
        daysAndHours: form.daysAndHours || null,
        professionalType:
          form.professionalType === "" ? null : Number(form.professionalType),
        discipline: form.discipline === "" ? null : Number(form.discipline),
        isUrgent: Boolean(form.isUrgent),
        workMode: Number(form.workMode),
        contractType: Number(form.contractType),
        availability: Number(form.availability),
        country: form.country || null,
        province: form.province || null,
        city: form.city || null,
        address: form.address || null,
        salaryText: form.salaryText || null,
      });

      navigate("/institution/jobs");
    } catch (error) {
      console.error(error);
      setError(
        "No se pudo crear la vacante. Revisá los datos e intentá nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell institution-create-job">
      <header>
        <h1 className="section-title">Nueva vacante</h1>
        <p className="section-subtitle">
          Completá los datos principales de la búsqueda laboral.
        </p>
      </header>

      <Card className="institution-create-job__card">
        <form className="institution-create-job__form" onSubmit={handleSubmit}>
          {error ? (
            <div className="institution-create-job__error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <InputField
            label="Título"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <InputField
            label="Descripción"
            name="description"
            textarea
            value={form.description}
            onChange={handleChange}
            required
          />

          <div className="institution-create-job__grid">
            <SelectField
              label="Tipo de profesional"
              name="professionalType"
              value={form.professionalType}
              onChange={handleChange}
              options={[...PROFESSIONAL_TYPE_OPTIONS]}
            />

            <SelectField
              label="Disciplina"
              name="discipline"
              value={form.discipline}
              onChange={handleChange}
              options={[...DISCIPLINE_OPTIONS]}
            />
          </div>

          <InputField
            label="Días y horarios"
            name="daysAndHours"
            value={form.daysAndHours}
            onChange={handleChange}
            placeholder="Ej: Lunes, miércoles y viernes de 18 a 21 hs"
          />

          <label className="institution-create-job__urgent-option">
            <input
              type="checkbox"
              name="isUrgent"
              checked={form.isUrgent}
              onChange={handleChange}
            />
            <span>
              <strong>Vacante urgente</strong>
              <small>
                Marcá esta opción si necesitás cubrir la búsqueda con prioridad.
              </small>
            </span>
          </label>

          <InputField
            label="Requisitos"
            name="requirementsText"
            textarea
            value={form.requirementsText}
            onChange={handleChange}
          />

          <InputField
            label="Beneficios"
            name="benefitsText"
            textarea
            value={form.benefitsText}
            onChange={handleChange}
          />

          <div className="institution-create-job__grid">
            <SelectField
              label="Modalidad"
              name="workMode"
              value={form.workMode}
              onChange={handleChange}
              options={[
                { value: 0, label: "Presencial" },
                { value: 1, label: "Remoto" },
                { value: 2, label: "Híbrido" },
              ]}
              required
            />
          </div>

          <div className="institution-create-job__grid">
            <SelectField
              label="Contrato"
              name="contractType"
              value={form.contractType}
              onChange={handleChange}
              options={[
                { value: 0, label: "Full Time" },
                { value: 1, label: "Part Time" },
                { value: 2, label: "Por hora" },
                { value: 3, label: "Temporal" },
                { value: 4, label: "Freelance" },
              ]}
              required
            />

            <SelectField
              label="Disponibilidad"
              name="availability"
              value={form.availability}
              onChange={handleChange}
              options={[
                { value: 0, label: "Mañana" },
                { value: 1, label: "Tarde" },
                { value: 2, label: "Noche" },
                { value: 3, label: "Día completo" },
                { value: 4, label: "Flexible" },
              ]}
              required
            />
          </div>

          <div className="institution-create-job__grid">
            <InputField
              label="País"
              name="country"
              value={form.country}
              onChange={handleChange}
            />

            <InputField
              label="Provincia"
              name="province"
              value={form.province}
              onChange={handleChange}
            />
          </div>

          <div className="institution-create-job__grid">
            <InputField
              label="Ciudad"
              name="city"
              value={form.city}
              onChange={handleChange}
            />

            <InputField
              label="Dirección"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <InputField
            label="Salario"
            name="salaryText"
            value={form.salaryText}
            onChange={handleChange}
            placeholder="Ej: A convenir / $300.000 mensual / $8.000 por hora"
          />

          <Button type="submit" icon={<Save size={16} />} disabled={submitting}>
            {submitting ? "Publicando..." : "Publicar vacante"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default InstitutionCreateJobPage;
