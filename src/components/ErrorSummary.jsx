export default function ErrorSummary({ errors, onScrollToField }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="error-summary" role="alert">
      <div className="error-summary-header">
        <span className="error-icon">⚠️</span>
        <span>
          {errors.length} {errors.length === 1 ? "field needs" : "fields need"} correction:
        </span>
      </div>
      <ul className="error-list">
        {errors.map((err, index) => (
          <li key={err.path}>
            <button
              type="button"
              className="error-link"
              onClick={() => onScrollToField(err.path)}
            >
              <span className="error-number">{index + 1}.</span>
              <span className="error-path">{formatPath(err.path)}</span>
              <span className="error-messages">{err.messages.join("; ")}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatPath(path) {
  return path
    .replace(/\./g, " → ")
    .replace(/\[(\d+)\]/g, " #$1");
}
