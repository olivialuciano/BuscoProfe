import "./Card.css";

function Card({ children, className = "" }) {
  return (
    <article className={`bp-card ${className}`.trim()}>{children}</article>
  );
}

export default Card;
