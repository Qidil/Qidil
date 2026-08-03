const CATALOG_URL = "https://unpkg.com/simple-icons@latest/data/simple-icons.json";
const FALLBACK_COLOR = "6B7280";
const CATALOG_TIMEOUT_MS = 8000;

function normalizeName(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function candidateForms(norm) {
  const forms = new Set([norm]);
  const stripped = norm.replace(/(js|jsx|ts|tsx)$/, "");
  if (stripped && stripped !== norm) forms.add(stripped);
  return [...forms];
}

function parseTechItems(techStack) {
  const parsed = [];
  for (const item of techStack || []) {
    if (typeof item === "string") {
      String(item).split(",").forEach((chunk) => {
        const name = chunk.trim();
        if (name) parsed.push({ name, version: "" });
      });
    } else if (item && typeof item === "object") {
      const name = (item.name || "").trim();
      if (name) parsed.push({ name, version: (item.version || "").trim() });
    }
  }
  const seen = new Set();
  return parsed.filter((tech) => {
    const key = `${normalizeName(tech.name)}|${tech.version}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchCatalog() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CATALOG_TIMEOUT_MS);
  try {
    const response = await fetch(CATALOG_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Catalog fetch failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function buildIndex(catalog) {
  const bySlug = new Map();
  const byTitle = new Map();
  for (const icon of catalog) {
    if (!icon || typeof icon.slug !== "string") continue;
    const slugNorm = normalizeName(icon.slug);
    const titleNorm = normalizeName(icon.title);
    if (!bySlug.has(slugNorm)) bySlug.set(slugNorm, icon);
    if (!byTitle.has(titleNorm)) byTitle.set(titleNorm, icon);
  }
  return { bySlug, byTitle };
}

function resolveIcon(name, index) {
  const norm = normalizeName(name);
  if (!norm) return null;
  for (const form of candidateForms(norm)) {
    if (index.bySlug.has(form)) return index.bySlug.get(form);
    if (index.byTitle.has(form)) return index.byTitle.get(form);
  }
  let best = null;
  let bestLen = 0;
  if (norm.length >= 4) {
    for (const key of index.bySlug.keys()) {
      if (key.startsWith(norm) && key.length > bestLen) {
        best = index.bySlug.get(key);
        bestLen = key.length;
      }
    }
    if (best) return best;
    for (const key of index.byTitle.keys()) {
      if (key.startsWith(norm) && key.length > bestLen) {
        best = index.byTitle.get(key);
        bestLen = key.length;
      }
    }
  }
  return best;
}

function pickLogoColor(hex) {
  const value = (hex || FALLBACK_COLOR).replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) || 0;
  const g = parseInt(value.slice(2, 4), 16) || 0;
  const b = parseInt(value.slice(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "black" : "white";
}

function badgeSegment(value) {
  return encodeURIComponent(String(value).replaceAll("-", "--").replaceAll("_", "__").replaceAll(" ", "_"));
}

function titleCase(name) {
  return name.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export async function resolveTechBadges(techStack) {
  const items = parseTechItems(techStack);
  let catalog = null;
  try {
    catalog = await fetchCatalog();
  } catch {
    catalog = null;
  }
  const index = catalog ? buildIndex(catalog) : null;

  return items.map((tech) => {
    const icon = index ? resolveIcon(tech.name, index) : null;
    const label = titleCase(tech.name);
    const value = badgeSegment(tech.version);
    const color = icon ? icon.hex : FALLBACK_COLOR;
    const logo = icon ? `?logo=${badgeSegment(icon.slug)}&logoColor=${pickLogoColor(color)}` : "";
    const url = `https://img.shields.io/badge/${badgeSegment(label)}-${value}-${color}${logo}`;
    return `![${label}](${url})`;
  }).join("\n");
}
