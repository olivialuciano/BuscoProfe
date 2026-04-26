import { Link, useNavigate } from "react-router-dom";
import { SearchX, Home, ArrowLeft } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import "./NotFoundPage.css";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page-shell not-found-page">
      <Card className="not-found-page__card">
        <div className="not-found-page__icon">
          <SearchX size={42} />
        </div>

        <span className="not-found-page__code">404</span>

        <h1>Página no encontrada</h1>

        <p>
          La página que estás buscando no existe, fue movida o la dirección está
          mal escrita.
        </p>

        <div className="not-found-page__actions">
          <Button
            type="button"
            variant="secondary"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Volver atrás
          </Button>

          <Link to="/" className="not-found-page__home-link">
            <Home size={16} />
            Ir al inicio
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default NotFoundPage;
