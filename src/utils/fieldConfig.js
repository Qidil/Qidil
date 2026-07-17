export const fieldConfig = {
  profile: {
    name: { label: "Name", min: 2, max: 40, section: "Profile" },
    username: { label: "Username", min: 1, max: 39, pattern: "^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$", patternHint: "GitHub username (letters, numbers, hyphens)", section: "Profile" },
    headline: { label: "Headline", min: 3, max: 46, section: "Profile" },
    affiliation: { label: "Affiliation", min: 2, max: 40, section: "Profile" },
    location: { label: "Location", min: 2, max: 32, section: "Profile" },
    status: { label: "Status", min: 2, max: 42, section: "Profile" },
    about: { label: "About", min: 20, max: 320, isArray: true, minItems: 1, maxItems: 3, section: "Profile" },
  },
  research: {
    primary: { label: "Primary Field", min: 2, max: 28, section: "Research" },
    direction: { label: "Direction", min: 2, max: 38, section: "Research" },
    themes: { label: "Themes", min: 2, max: 46, section: "Research" },
    narrative: { label: "Narrative", min: 20, max: 420, section: "Research" },
  },
  focus: {
    _array: { minItems: 1, maxItems: 6, section: "Focus" },
    name: { label: "Focus Name", min: 2, max: 28 },
    description: { label: "Description", min: 10, max: 180 },
  },
  projects: {
    _array: { minItems: 1, maxItems: 6, section: "Projects" },
    name: { label: "Project Name", min: 2, max: 36 },
    url: { label: "Repository URL", min: 1, max: 500, isUrl: true },
    homepage: { label: "Homepage URL", min: 0, max: 500, isUrl: true, optional: true },
    focus: { label: "Focus Area", min: 2, max: 88 },
    summary: { label: "Summary", min: 10, max: 220 },
    heroLabel: { label: "Hero Label", min: 2, max: 30 },
  },
  techStack: {
    _array: { minItems: 1, maxItems: 18, section: "Tech Stack" },
    _item: { label: "Technology", min: 1, max: 30 },
  },
  links: {
    _array: { minItems: 1, maxItems: 4, section: "Links" },
    label: { label: "Label", min: 2, max: 28 },
    value: { label: "Value", min: 1, max: 28 },
    url: { label: "URL", min: 1, max: 500, isUrl: true },
    logo: { label: "Simple Icons Logo", min: 0, max: 30, optional: true },
    color: { label: "Hex Color (without #)", min: 6, max: 6, pattern: "^[A-Fa-f0-9]{6}$", patternHint: "6-char hex, e.g. 22D3EE" },
  },
  activity: {
    enabled: { label: "Enable Activity Updates", type: "boolean", section: "Activity" },
    limit: { label: "Activity Item Limit", type: "number", min: 1, max: 10 },
  },
  appearance: {
    palette: { label: "Color Palette", type: "select", options: ["signal", "ocean", "solar"], section: "Appearance" },
  },
  footer: { label: "Footer Text", min: 4, max: 120, section: "Footer" },
};

export function getLimitText(field) {
  if (!field) return "";
  if (field.isArray) {
    return `(${field.min}-${field.maxItems} items, each max ${field.max} chars)`;
  }
  if (field.min && field.max) {
    if (field.min === field.max) return `(exactly ${field.max} chars)`;
    return `(${field.min}-${field.max} chars)`;
  }
  if (field.max) return `(max ${field.max} chars)`;
  if (field.min) return `(min ${field.min} chars)`;
  return "";
}

export function getCharCountColor(current, max) {
  const ratio = current / max;
  if (ratio > 1) return "error";
  if (ratio > 0.85) return "warning";
  return "ok";
}

export const defaultFormData = {
  profile: {
    name: "",
    username: "",
    headline: "",
    affiliation: "",
    location: "",
    status: "",
    about: [""],
  },
  research: {
    primary: "",
    direction: "",
    themes: "",
    narrative: "",
  },
  focus: [{ name: "", description: "" }],
  projects: [{ name: "", url: "", homepage: "", focus: "", summary: "", heroLabel: "" }],
  techStack: [""],
  links: [{ label: "", value: "", url: "", logo: "", color: "" }],
  activity: { enabled: true, limit: 5 },
  appearance: { palette: "signal" },
  footer: "",
};
