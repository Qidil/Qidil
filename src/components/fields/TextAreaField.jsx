import { getLimitText, getCharCountColor } from "../../utils/fieldConfig.js";

export default function TextAreaField({ label, value, onChange, min, max, error, id, placeholder, help }) {
  const len = (value || "").length;
  const limitText = getLimitText({ min, max });
  const colorClass = max ? getCharCountColor(len, max) : "";
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label htmlFor={fieldId}>
        {label} {limitText && <span className="field-limit">{limitText}</span>}
      </label>
      <div className="input-wrapper">
        <textarea
          id={fieldId}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={error ? "input-error" : ""}
          maxLength={max ? max + 50 : undefined}
          placeholder={placeholder}
        />
        {max && (
          <span className={`char-count textarea-count ${colorClass}`}>
            {len}/{max}
          </span>
        )}
      </div>
      {help && <div className="field-help">{help}</div>}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
