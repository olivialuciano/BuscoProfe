import "./SelectField.css";

function SelectField({
  label,
  options = [],
  placeholder = "Seleccionar",
  ...props
}) {
  return (
    <div className="select-field">
      {label ? <label className="select-field__label">{label}</label> : null}
      <select className="select-field__control" {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
