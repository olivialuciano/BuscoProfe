import "./Button.css";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  icon,
}) {
  return (
    <button
      type={type}
      className={`bp-button bp-button--${variant} bp-button--${size} ${fullWidth ? "bp-button--full" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon ? <span className="bp-button__icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
