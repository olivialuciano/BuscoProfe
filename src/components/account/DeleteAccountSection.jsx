import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import InputField from "../common/InputField";
import ApiMessage from "../common/ApiMessage";
import { deleteMyAccount } from "../../api/usersService";
import { clearSession } from "../../utils/storage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import { useToast } from "../../contexts/ToastContext";
import "./DeleteAccountSection.css";

function DeleteAccountSection({ accountType = "user" }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isProfessor = accountType === "professor";
  const isInstitution = accountType === "institution";

  const expectedText = "confirmar";

  const normalizedConfirmation = confirmationText.trim().toLowerCase();
  const canDelete = normalizedConfirmation === expectedText && !isDeleting;

  const title = isInstitution
    ? "Eliminar cuenta de institución"
    : "Eliminar cuenta de profesor";

  const description = isInstitution
    ? "Esta acción elimina físicamente tu cuenta de institución, sus vacantes, postulaciones recibidas, favoritos y notificaciones relacionadas. No vas a poder recuperarla."
    : "Esta acción elimina físicamente tu cuenta de profesor, tus postulaciones, favoritos, experiencias, estudios, certificaciones, habilidades y notificaciones. No vas a poder recuperarla.";

  const modalDescription = isInstitution
    ? "Se eliminarán físicamente tu usuario, tus vacantes, las postulaciones recibidas, favoritos y notificaciones relacionadas."
    : "Se eliminarán físicamente tu usuario, tus postulaciones, favoritos, experiencias, educación, certificaciones, habilidades y notificaciones.";

  const openModal = () => {
    setConfirmationText("");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isDeleting) return;

    setIsModalOpen(false);
    setConfirmationText("");
    setError("");
  };

  const handleDeleteAccount = async () => {
    setError("");

    if (normalizedConfirmation !== expectedText) {
      setError('Para eliminar tu cuenta tenés que escribir "confirmar".');
      return;
    }

    try {
      setIsDeleting(true);

      await deleteMyAccount();

      clearSession();

      showToast("Tu cuenta fue eliminada correctamente.", "success");

      navigate("/login", { replace: true });

      window.location.reload();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo eliminar la cuenta."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="delete-account-section">
        <div className="delete-account-section__header">
          <div className="delete-account-section__title">
            <AlertTriangle size={20} />
            <h3>Zona de cuenta</h3>
          </div>
        </div>

        <div className="delete-account-section__content">
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="delete-account-section__button"
            onClick={openModal}
          >
            Eliminar cuenta
          </button>
        </div>
      </Card>

      {isModalOpen && (
        <div className="delete-account-modal__overlay" role="presentation">
          <div
            className="delete-account-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-modal-title"
          >
            <button
              type="button"
              className="delete-account-modal__close"
              onClick={closeModal}
              disabled={isDeleting}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <div className="delete-account-modal__icon">
              <AlertTriangle size={30} />
            </div>

            <h2 id="delete-account-modal-title">Eliminar cuenta</h2>

            <p className="delete-account-modal__subtitle">
              Esta acción es permanente y no se puede deshacer.
            </p>

            <div className="delete-account-modal__warning">
              <AlertTriangle size={22} />

              <div>
                <strong>Vas a eliminar tu cuenta definitivamente</strong>
                <p>{modalDescription}</p>
              </div>
            </div>

            <div className="delete-account-modal__form">
              <InputField
                label='Para confirmar, escribí "confirmar"'
                name="confirmationText"
                value={confirmationText}
                onChange={(event) => setConfirmationText(event.target.value)}
                placeholder="confirmar"
                disabled={isDeleting}
              />

              <ApiMessage type="error">{error}</ApiMessage>

              <div className="delete-account-modal__actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>

                <button
                  type="button"
                  className="delete-account-modal__danger-button"
                  onClick={handleDeleteAccount}
                  disabled={!canDelete}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteAccountSection;
