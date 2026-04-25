import { X } from "lucide-react";
import "./Modal.css";

function Modal({
  open,
  onClose,
  icon,
  title,
  description,
  actions,
  tone = "default",
}) {
  if (!open) return null;

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="app-modal__close" onClick={onClose}>
          <X size={18} />
        </button>

        {icon ? (
          <div className={`app-modal__icon app-modal__icon--${tone}`}>
            {icon}
          </div>
        ) : null}

        <h3>{title}</h3>
        <p>{description}</p>

        <div className="app-modal__actions">{actions}</div>
      </div>
    </div>
  );
}

export default Modal;
