import { MapPin, Clock3, Building2 } from "lucide-react";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import { CONTRACT_TYPE_LABELS, WORK_MODE_LABELS } from "../../utils/constants";
import "./JobCard.css";

function JobCard({ job, onView, actionLabel = "Ver detalle" }) {
  return (
    <Card className="job-card">
      <div className="job-card__header">
        <div className="job-card__avatar">
          <Building2 size={20} />
        </div>
        <div>
          <h3>{job.title}</h3>
          <p>{job.tradeName || job.legalName || "Institución deportiva"}</p>
        </div>
      </div>

      <div className="job-card__meta">
        <span>
          <MapPin size={16} />
          {[job.city, job.province, job.country].filter(Boolean).join(", ") ||
            "Ubicación a definir"}
        </span>
        <span>
          <Clock3 size={16} />
          {WORK_MODE_LABELS[job.workMode] ?? "No informado"}
        </span>
      </div>

      <p className="job-card__description">{job.description}</p>

      <div className="job-card__footer">
        <div className="job-card__badges">
          <Badge>{CONTRACT_TYPE_LABELS[job.contractType] ?? "Contrato"}</Badge>
          {job.salaryText ? (
            <Badge tone="success">{job.salaryText}</Badge>
          ) : null}
        </div>
        <Button variant="secondary" size="sm" onClick={onView}>
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}

export default JobCard;
