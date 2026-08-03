import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "github-markdown-css";

export default function Preview({ previewData, isGenerating }) {
  const [saveStatus, setSaveStatus] = useState(null);
  const [readmeTab, setReadmeTab] = useState("rendered");

  if (isGenerating) {
    return (
      <div className="preview-section">
        <div className="preview-loading">
          <div className="spinner"></div>
          <p>Generating your profile...</p>
        </div>
      </div>
    );
  }

  if (!previewData) return null;

  const { manifest, readme } = previewData;

  const handleSaveReadme = async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/save-readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readme }),
      });
      const result = await response.json();
      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="preview-section">
      <h2>✅ Generated Successfully!</h2>
      <p className="preview-version">Asset version: {manifest.version}</p>

      <div className="preview-svgs">
        <h3>Hero Assets</h3>
        <div className="svg-grid">
          {Object.entries(manifest.assets).map(([key, filename]) => (
            <div key={key} className="svg-card">
              <h4>{formatAssetName(key)}</h4>
              <img
                src={`/api/preview/${filename}`}
                alt={filename}
                className="svg-preview-img"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <div className="svg-fallback" style={{ display: "none" }}>
                <a href={`/api/download/${filename}`} download>
                  Download {filename}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="preview-readme">
        <h3>README.md Preview</h3>
        <div className="readme-tabs">
          <button
            type="button"
            className={`readme-tab ${readmeTab === "rendered" ? "active" : ""}`}
            onClick={() => setReadmeTab("rendered")}
          >
            Rendered
          </button>
          <button
            type="button"
            className={`readme-tab ${readmeTab === "source" ? "active" : ""}`}
            onClick={() => setReadmeTab("source")}
          >
            Source
          </button>
        </div>
        {readmeTab === "rendered" ? (
          <div className="readme-rendered markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {rewriteReadmePaths(readme)}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="readme-content">
            <pre>{readme}</pre>
          </div>
        )}
      </div>

      <div className="preview-actions">
        <button
          type="button"
          className="btn-download"
          onClick={handleSaveReadme}
          disabled={saveStatus === "saving"}
        >
          {saveStatus === "saving" ? "⏳ Saving..." : saveStatus === "success" ? "✅ Saved!" : saveStatus === "error" ? "❌ Failed" : "📄 Save README.md to Root"}
        </button>
        <button type="button" className="btn-download" onClick={() => downloadConfig(previewData.config)}>
          ⚙️ Download Config
        </button>
      </div>

      {saveStatus === "success" && (
        <div className="save-success-msg">README.md has been saved to the project root!</div>
      )}
    </div>
  );
}

function formatAssetName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace("Mobile ", "Mobile ");
}

function rewriteReadmePaths(readme) {
  return readme.replaceAll("./assets/hero/", "/api/preview/");
}

function downloadConfig(config) {
  const content = JSON.stringify(config, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "profile.config.json";
  a.click();
  URL.revokeObjectURL(url);
}
