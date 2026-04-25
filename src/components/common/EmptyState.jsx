import { SearchX } from "lucide-react";
import "./EmptyState.css";

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <SearchX size={32} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default EmptyState;
