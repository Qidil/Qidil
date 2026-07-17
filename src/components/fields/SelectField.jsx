export default function SelectField({ label, value, onChange, options, error, id }) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label htmlFor={fieldId}>{label}</label>
      <select
        id={fieldId}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "input-error" : ""}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
