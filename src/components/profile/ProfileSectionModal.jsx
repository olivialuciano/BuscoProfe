import { X } from "lucide-react";
import "./ProfileSectionModal.css";

function ProfileSectionModal({ open, onClose, title, subtitle, children }) {
  if (!open) return null;

  return (
    <div className="profile-section-modal__overlay" onClick={onClose}>
      <div
        className="profile-section-modal__dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="profile-section-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="profile-section-modal__header">
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <div className="profile-section-modal__content">{children}</div>
      </div>
    </div>
  );
}

export default ProfileSectionModal;
