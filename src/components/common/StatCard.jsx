import Card from "./Card";
import "./StatCard.css";

function StatCard({ label, value, icon }) {
  return (
    <Card className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div>
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
      </div>
    </Card>
  );
}

export default StatCard;
