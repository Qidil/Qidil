import { useCallback } from "react";
import TextField from "./TextField.jsx";

export default function ArrayField({ label, items, onChange, onAdd, onRemove, fields, error, path, minItems = 1, maxItems = 6, autoGrow = false }) {
  const handleItemChange = useCallback((index, newVal) => {
    const newItems = [...items];
    newItems[index] = newVal;
    onChange(newItems);

    if (autoGrow && index === items.length - 1 && newVal && newVal.trim() !== "") {
      const lastItem = items[items.length - 1];
      const isEmpty = typeof lastItem === "string"
        ? lastItem.trim() === ""
        : Object.values(lastItem).every((v) => !v || v.trim() === "");
      if (isEmpty || index === items.length - 1) {
        const isLastEmpty = typeof lastItem === "string"
          ? lastItem.trim() === ""
          : fields.every((f) => {
              const val = lastItem[f.key];
              return !val || val.trim() === "";
            });
        if (isLastEmpty && index === items.length - 1 && newItems.length < maxItems) {
          const template = typeof items[0] === "string" ? "" : {};
          if (typeof template === "object") {
            fields.forEach((f) => { template[f.key] = ""; });
          }
          newItems.push(template);
          onChange(newItems);
        }
      }
    }
  }, [items, onChange, fields, autoGrow, maxItems]);

  return (
    <div className={`form-field array-field ${error ? "has-error" : ""}`}>
      <div className="array-header">
        <label>{label}</label>
        {!autoGrow && maxItems < 100 && (
          <span className="array-count">
            {items.length}/{maxItems}
          </span>
        )}
        {autoGrow && (
          <span className="array-count">
            {items.length} items
          </span>
        )}
      </div>
      {error && <div className="field-error">{error}</div>}
      {items.map((item, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <span className="array-item-number">#{index + 1}</span>
            {items.length > minItems && !autoGrow && (
              <button type="button" className="btn-remove" onClick={() => onRemove(index)}>
                Remove
              </button>
            )}
            {items.length > minItems && autoGrow && (
              <button type="button" className="btn-remove" onClick={() => onRemove(index)}>
                &times;
              </button>
            )}
          </div>
          {fields.map((field) => {
            const fieldPath = `${path}[${index}].${field.key}`;
            return (
              <TextField
                key={field.key}
                label={field.label}
                value={typeof item === "string" ? item : item[field.key]}
                onChange={(val) => {
                  if (typeof item === "string") {
                    handleItemChange(index, val);
                  } else {
                    handleItemChange(index, { ...item, [field.key]: val });
                  }
                }}
                min={field.min}
                max={field.max}
                pattern={field.pattern}
                patternHint={field.patternHint}
                optional={field.optional}
                placeholder={field.placeholder}
                help={field.help}
                id={`${path}-${index}-${field.key}`}
              />
            );
          })}
        </div>
      ))}
      {!autoGrow && items.length < maxItems && (
        <button type="button" className="btn-add" onClick={onAdd}>
          + Add {label}
        </button>
      )}
    </div>
  );
}
