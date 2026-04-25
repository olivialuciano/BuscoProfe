import { Link } from "react-router-dom";
import { Building2, GraduationCap, ArrowRight } from "lucide-react";
import Card from "../../components/common/Card";
import "./RegisterChoicePage.css";

function RegisterChoicePage() {
  return (
    <div className="page-shell register-choice-page">
      <Card className="register-choice-page__card">
        <div className="register-choice-page__header">
          <h1>Crear cuenta</h1>
          <p>Elegí qué tipo de perfil querés registrar en Busco Profe.</p>
        </div>

        <div className="register-choice-page__grid">
          <Link
            to="/register/institution"
            className="register-choice-card register-choice-card--institution"
          >
            <div className="register-choice-card__icon">
              <Building2 size={30} />
            </div>

            <div className="register-choice-card__content">
              <span className="register-choice-card__eyebrow">Cuenta</span>
              <h2>INSTITUCIÓN</h2>
              <p>
                Para clubes, gimnasios, escuelas y organizaciones que desean
                publicar vacantes laborales.
              </p>
            </div>

            <ArrowRight size={22} className="register-choice-card__arrow" />
          </Link>

          <Link
            to="/register/professor"
            className="register-choice-card register-choice-card--professor"
          >
            <div className="register-choice-card__icon">
              <GraduationCap size={30} />
            </div>

            <div className="register-choice-card__content">
              <span className="register-choice-card__eyebrow">Cuenta</span>
              <h2>PROFESOR</h2>
              <p>
                Para profesionales de educación física que buscan oportunidades
                laborales dentro del ámbito deportivo.
              </p>
            </div>

            <ArrowRight size={22} className="register-choice-card__arrow" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default RegisterChoicePage;
