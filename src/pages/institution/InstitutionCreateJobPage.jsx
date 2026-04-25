import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createJobPosting } from "../../api/jobPostingsService";
import Card from "../../components/common/Card";
import InputField from "../../components/common/InputField";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import "./InstitutionCreateJobPage.css";

function InstitutionCreateJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirementsText: "",
    benefitsText: "",
    workMode: "",
    contractType: "",
    availability: "",
    country: "Argentina",
    province: "Santa Fe",
    city: "Rosario",
    address: "",
    salaryText: "",
  });

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createJobPosting({
        institutionUserId: user.id,
        title: form.title,
        description: form.description,
        requirementsText: form.requirementsText || null,
        benefitsText: form.benefitsText || null,
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
    }
  };

  return (
    <div className="page-shell institution-create-job">
      <header>
        <h1 className="section-title">Nueva vacante</h1>
        <p className="section-subtitle">
          Formulario inicial conectado a tu endpoint de creación.
        </p>
      </header>

      <Card className="institution-create-job__card">
        <form className="institution-create-job__form" onSubmit={handleSubmit}>
          <InputField
            label="Título"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          <InputField
            label="Descripción"
            name="description"
            textarea
            value={form.description}
            onChange={handleChange}
          />
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
          />

          <Button type="submit" icon={<Save size={16} />}>
            Publicar vacante
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default InstitutionCreateJobPage;
