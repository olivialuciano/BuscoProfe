import "./InputField.css";

function InputField({ label, error, textarea = false, ...props }) {
  const Element = textarea ? "textarea" : "input";

  return (
    <div className="input-field">
      {label ? <label className="input-field__label">{label}</label> : null}
      <Element
        className={`input-field__control ${error ? "input-field__control--error" : ""}`}
        {...props}
      />
      {error ? <span className="input-field__error">{error}</span> : null}
    </div>
  );
}

export default InputField;
