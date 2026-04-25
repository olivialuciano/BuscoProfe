import "./ApiMessage.css";

function ApiMessage({ type = "info", children }) {
  if (!children) return null;

  return <div className={`api-message api-message--${type}`}>{children}</div>;
}

export default ApiMessage;
