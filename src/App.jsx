import { useState, useRef, useCallback } from "react";
import { useFormState } from "./hooks/useFormState.js";
import { useFormValidation } from "./hooks/useValidation.js";
import ImageUploader from "./components/ImageUploader.jsx";
import TextField from "./components/fields/TextField.jsx";
import TextAreaField from "./components/fields/TextAreaField.jsx";
import ArrayField from "./components/fields/ArrayField.jsx";
import SelectField from "./components/fields/SelectField.jsx";
import ErrorSummary from "./components/ErrorSummary.jsx";
import Preview from "./components/Preview.jsx";

export default function App() {
  const {
    formData,
    errors,
    setErrors,
    clearErrors,
    imageFile,
    imagePreview,
    handleImageSelect,
    updateField,
    addArrayItem,
    removeArrayItem,
  } = useFormState();

  const { validate } = useFormValidation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const formRef = useRef(null);

  const getFieldError = useCallback(
    (path) => {
      const err = errors.find((e) => e.path === path);
      return err ? err.messages.join("; ") : null;
    },
    [errors]
  );

  const scrollToField = useCallback((path) => {
    const cleanPath = path.replace(/\[(\d+)\]/g, ".$1");
    const parts = cleanPath.split(".");
    let selector;
    if (parts.length === 3) {
      selector = `[id="${parts[0]}-${parts[1]}-${parts[2]}"]`;
    } else if (parts.length === 2) {
      selector = `[id="${parts.join("-")}"]`;
    } else {
      selector = `[id="${parts[0]}"]`;
    }
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
      el.classList.add("field-flash");
      setTimeout(() => el.classList.remove("field-flash"), 2000);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    clearErrors();
    setPreviewData(null);

    const validationErrors = validate(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!imageFile) {
      setErrors([{ path: "image", messages: ["Portrait image is required"] }]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsGenerating(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", imageFile);
      formDataToSend.append("config", JSON.stringify(formData));

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          setErrors(result.errors);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          setErrors([{ path: "server", messages: [result.message || "Generation failed"] }]);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      setPreviewData(result);
      clearErrors();
      setTimeout(() => {
        document.querySelector(".preview-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setErrors([{ path: "network", messages: [err.message || "Network error"] }]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsGenerating(false);
    }
  }, [formData, imageFile, validate, setErrors, clearErrors]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎴 Portfolio Card Generator</h1>
        <p>Generate your animated GitHub Profile README</p>
      </header>

      <ErrorSummary errors={errors} onScrollToField={scrollToField} />

      <form ref={formRef} className="portfolio-form" onSubmit={(e) => e.preventDefault()}>
        <section className="form-section" id="section-image">
          <h2>📸 Portrait Image</h2>
          <ImageUploader
            imagePreview={imagePreview}
            onImageSelect={handleImageSelect}
            error={getFieldError("image")}
          />
        </section>

        <section className="form-section" id="section-profile">
          <h2>👤 Profile</h2>
          <TextField
            label="Name"
            value={formData.profile.name}
            onChange={(v) => updateField("profile.name", v)}
            min={2} max={40}
            placeholder="e.g. Wildan Syukri Niam"
            help="Your full name or display name."
            error={getFieldError("profile.name")}
            id="profile-name"
          />
          <TextField
            label="Username"
            value={formData.profile.username}
            onChange={(v) => updateField("profile.username", v)}
            min={1} max={39}
            pattern="^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$"
            patternHint="GitHub username (letters, numbers, hyphens)"
            placeholder="e.g. wildanniam"
            help="Your GitHub username (no @ needed)."
            error={getFieldError("profile.username")}
            id="profile-username"
          />
          <TextField
            label="Headline"
            value={formData.profile.headline}
            onChange={(v) => updateField("profile.headline", v)}
            min={3} max={46}
            placeholder="e.g. AI Researcher & Web3 Builder"
            help="Short role/title shown in the terminal panel."
            error={getFieldError("profile.headline")}
            id="profile-headline"
          />
          <TextField
            label="Affiliation"
            value={formData.profile.affiliation}
            onChange={(v) => updateField("profile.affiliation", v)}
            min={2} max={40}
            placeholder="e.g. Telkom University"
            help="Your organization, company, or university."
            error={getFieldError("profile.affiliation")}
            id="profile-affiliation"
          />
          <TextField
            label="Location"
            value={formData.profile.location}
            onChange={(v) => updateField("profile.location", v)}
            min={2} max={32}
            placeholder="e.g. Bandung, ID"
            help="Your city and country code."
            error={getFieldError("profile.location")}
            id="profile-location"
          />
          <TextField
            label="Status"
            value={formData.profile.status}
            onChange={(v) => updateField("profile.status", v)}
            min={2} max={42}
            placeholder="e.g. Open to collaboration"
            help="Current availability or status message."
            error={getFieldError("profile.status")}
            id="profile-status"
          />
          <ArrayField
            label="About Paragraphs"
            items={formData.profile.about}
            onChange={(v) => updateField("profile.about", v)}
            onAdd={() => addArrayItem("profile.about", "")}
            onRemove={(i) => removeArrayItem("profile.about", i)}
            fields={[{
              key: "about",
              label: "About Paragraph",
              min: 20, max: 320,
              placeholder: "e.g. I'm a CS student passionate about AI, open source, and building tools that make a difference. Currently exploring LLMs and decentralized systems.",
              help: "1-3 paragraphs about yourself (20-320 chars each). This appears in the README 'About Me' section."
            }]}
            error={getFieldError("profile.about")}
            path="profile.about"
            minItems={1} maxItems={3}
          />
        </section>

        <section className="form-section" id="section-research">
          <h2>🔬 Research</h2>
          <TextField
            label="Primary Field"
            value={formData.research.primary}
            onChange={(v) => updateField("research.primary", v)}
            min={2} max={28}
            placeholder="e.g. Artificial Intelligence"
            help="Your main research or work domain."
            error={getFieldError("research.primary")}
            id="research-primary"
          />
          <TextField
            label="Direction"
            value={formData.research.direction}
            onChange={(v) => updateField("research.direction", v)}
            min={2} max={38}
            placeholder="e.g. LLM Agents & Decentralized AI"
            help="Specific direction within your field."
            error={getFieldError("research.direction")}
            id="research-direction"
          />
          <TextField
            label="Themes"
            value={formData.research.themes}
            onChange={(v) => updateField("research.themes", v)}
            min={2} max={46}
            placeholder="e.g. NLP, Computer Vision, Web3"
            help="Key themes or sub-topics you explore."
            error={getFieldError("research.themes")}
            id="research-themes"
          />
          <TextAreaField
            label="Narrative"
            value={formData.research.narrative}
            onChange={(v) => updateField("research.narrative", v)}
            min={20} max={420}
            placeholder="e.g. My research focuses on building autonomous AI agents that can reason, plan, and execute complex tasks. I believe in open-source AI and decentralized intelligence as the future of collaboration."
            help="A longer narrative about your research direction (20-420 chars). Appears in the README 'Research Direction' section."
            error={getFieldError("research.narrative")}
            id="research-narrative"
          />
        </section>

        <section className="form-section" id="section-focus">
          <h2>🎯 Focus Areas</h2>
          <ArrayField
            label="Focus Areas"
            items={formData.focus}
            onChange={(v) => updateField("focus", v)}
            onAdd={() => addArrayItem("focus", { name: "", description: "" })}
            onRemove={(i) => removeArrayItem("focus", i)}
            fields={[
              { key: "name", label: "Focus Name", min: 2, max: 28, placeholder: "e.g. AI Research", help: "Short name for this focus area." },
              { key: "description", label: "Description", min: 10, max: 180, placeholder: "e.g. Exploring LLM agents, RAG systems, and autonomous reasoning.", help: "What you are exploring in this area (10-180 chars)." },
            ]}
            error={getFieldError("focus")}
            path="focus"
            minItems={1} maxItems={6}
          />
        </section>

        <section className="form-section" id="section-projects">
          <h2>🚀 Featured Projects</h2>
          <ArrayField
            label="Projects"
            items={formData.projects}
            onChange={(v) => updateField("projects", v)}
            onAdd={() => addArrayItem("projects", { name: "", url: "", homepage: "", focus: "", summary: "", heroLabel: "" })}
            onRemove={(i) => removeArrayItem("projects", i)}
            fields={[
              { key: "name", label: "Project Name", min: 2, max: 36, placeholder: "e.g. PayGate", help: "Project name (max 36 chars, shown in terminal panel)." },
              { key: "url", label: "Repository URL", min: 1, max: 500, isUrl: true, placeholder: "https://github.com/username/repo", help: "Full GitHub repository URL." },
              { key: "homepage", label: "Homepage URL (optional)", min: 0, max: 500, isUrl: true, optional: true, placeholder: "https://paygate.example.com", help: "Live demo URL (leave empty if none)." },
              { key: "focus", label: "Focus Area", min: 2, max: 88, placeholder: "e.g. Web3, Fintech", help: "What category or focus this project belongs to (max 88 chars)." },
              { key: "summary", label: "Summary", min: 10, max: 220, placeholder: "e.g. A stablecoin payment gateway for seamless cross-border transactions.", help: "Brief description of what the project does (10-220 chars)." },
              { key: "heroLabel", label: "Hero Label", min: 2, max: 30, placeholder: "e.g. v2.1 stable", help: "Short label shown next to project name in the terminal panel." },
            ]}
            error={getFieldError("projects")}
            path="projects"
            minItems={1} maxItems={6}
          />
        </section>

        <section className="form-section" id="section-tech">
          <h2>💻 Tech Stack</h2>
          <ArrayField
            label="Technologies"
            items={formData.techStack}
            onChange={(v) => updateField("techStack", v)}
            onAdd={() => addArrayItem("techStack", "")}
            onRemove={(i) => removeArrayItem("techStack", i)}
            autoGrow={true}
            fields={[{ key: "tech", label: "Technology", min: 1, max: 999, placeholder: "e.g. React", help: "One technology per item." }]}
            error={getFieldError("techStack")}
            path="techStack"
            minItems={1} maxItems={999}
          />
        </section>

        <section className="form-section" id="section-links">
          <h2>🔗 Public Links</h2>
          <ArrayField
            label="Links"
            items={formData.links}
            onChange={(v) => updateField("links", v)}
            onAdd={() => addArrayItem("links", { label: "", value: "", url: "", logo: "", color: "" })}
            onRemove={(i) => removeArrayItem("links", i)}
            fields={[
              { key: "label", label: "Label", min: 2, max: 28, placeholder: "e.g. GitHub", help: "Badge label text (max 28 chars)." },
              { key: "value", label: "Value", min: 1, max: 28, placeholder: "e.g. @wildanniam", help: "Value shown on the badge (max 28 chars)." },
              { key: "url", label: "URL", min: 1, max: 500, isUrl: true, placeholder: "https://github.com/wildanniam", help: "Full URL for the link." },
              { key: "logo", label: "Simple Icons Logo (optional)", min: 0, max: 30, optional: true, placeholder: "e.g. github", help: "Simple Icons logo name (see simpleicons.org). Leave empty for no logo." },
              { key: "color", label: "Hex Color (without #)", min: 6, max: 6, pattern: "^[A-Fa-f0-9]{6}$", patternHint: "6-char hex, e.g. 22D3EE", placeholder: "e.g. 22D3EE", help: "Badge background color as 6-char hex (no #). Use brand colors." },
            ]}
            error={getFieldError("links")}
            path="links"
            minItems={1} maxItems={4}
          />
        </section>

        <section className="form-section" id="section-activity">
          <h2>📊 Activity</h2>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={formData.activity.enabled}
                onChange={(e) => updateField("activity.enabled", e.target.checked)}
              />
              Enable auto-updating recent activity
            </label>
            <div className="field-help">If enabled, a GitHub Action will fetch your recent public activity and update the README automatically.</div>
          </div>
          {formData.activity.enabled && (
            <TextField
              label="Activity Item Limit"
              value={String(formData.activity.limit)}
              onChange={(v) => updateField("activity.limit", parseInt(v) || 5)}
              min={1} max={10}
              placeholder="e.g. 5"
              help="Number of recent activity items to show (1-10)."
              error={getFieldError("activity.limit")}
              id="activity-limit"
            />
          )}
        </section>

        <section className="form-section" id="section-appearance">
          <h2>🎨 Appearance</h2>
          <SelectField
            label="Color Palette"
            value={formData.appearance.palette}
            onChange={(v) => updateField("appearance.palette", v)}
            options={["signal", "ocean", "solar"]}
            error={getFieldError("appearance.palette")}
            id="appearance-palette"
          />
          <div className="palette-preview">
            {["signal", "ocean", "solar"].map((p) => (
              <div
                key={p}
                className={`palette-swatch ${formData.appearance.palette === p ? "active" : ""}`}
                onClick={() => updateField("appearance.palette", p)}
              >
                <div className={`swatch-color palette-${p}`}></div>
                <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="form-section" id="section-footer">
          <h2>📝 Footer</h2>
          <TextField
            label="Footer Text"
            value={formData.footer}
            onChange={(v) => updateField("footer", v)}
            min={4} max={120}
            placeholder="e.g. Built with Portfolio Card Generator"
            help="Footer sentence shown at the bottom of the README (4-120 chars)."
            error={getFieldError("footer")}
            id="footer-text"
          />
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn-generate"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "🚀 Generate Profile"}
          </button>
        </div>
      </form>

      <Preview previewData={previewData} isGenerating={isGenerating} />
    </div>
  );
}
