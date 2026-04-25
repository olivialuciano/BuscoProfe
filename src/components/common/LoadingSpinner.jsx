import "./LoadingSpinner.css";

function LoadingSpinner({ text = "Cargando..." }) {
  return (
    <div className="loading-spinner">
      <span className="loading-spinner__dot" />
      <p>{text}</p>
    </div>
  );
}

export default LoadingSpinner;
