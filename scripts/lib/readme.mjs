import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

function badgeSegment(value) {
  return encodeURIComponent(String(value).replaceAll("-", "--").replaceAll("_", "__").replaceAll(" ", "_"));
}

function renderLinks(links) {
  return links.map((link) => {
    const logo = link.logo ? `&logo=${encodeURIComponent(link.logo)}&logoColor=white` : "";
    const image = `https://img.shields.io/badge/${badgeSegment(link.label)}-${badgeSegment(link.value)}-${link.color}?style=for-the-badge${logo}`;
    return `  <a href="${link.url}"><img alt="${link.label}" src="${image}"></a>`;
  }).join("\n");
}

export function generateProfileReadmeContent({ config, manifest }) {
  const about = config.profile.about.filter(Boolean).join("\n\n");
  const techStack = config.techStack.map(t => `\`${t}\``).join(" ");

  const focusList = config.focus.map(f => `- **${f.name}**: ${f.description}`).join("\n");

  const projectCards = config.projects.map(p => {
    const homepageLink = p.homepage ? ` | [Homepage](${p.homepage})` : "";
    return `- **[${p.name}](${p.url})**${homepageLink} — ${p.summary}`;
  }).join("\n");

  return `<p align="center">
  <picture>
    <source media="(max-width: 760px) and (prefers-color-scheme: dark)" srcset="./assets/hero/${manifest.assets.mobileDark}">
    <source media="(max-width: 760px)" srcset="./assets/hero/${manifest.assets.mobileLight}">
    <source media="(prefers-color-scheme: dark)" srcset="./assets/hero/${manifest.assets.desktopDark}">
    <source media="(prefers-color-scheme: light)" srcset="./assets/hero/${manifest.assets.desktopLight}">
    <img src="./assets/hero/${manifest.assets.desktopDark}" alt="${config.profile.name} - ${config.profile.headline}" width="100%">
  </picture>
</p>

<p align="center">
${renderLinks(config.links)}
</p>

---

<div align="center">

## 👤 About Me

**${config.profile.name}** · ${config.profile.headline}  
📍 ${config.profile.location} · 🏛️ ${config.profile.affiliation}  
📌 ${config.profile.status}

</div>

---

### 💡 Bio

${about}

---

### 🔬 Research Direction

**${config.research.primary}** — ${config.research.direction}

*Themes: ${config.research.themes}*

> ${config.research.narrative}

---

### 🎯 Focus Areas

${focusList}

---

### 🚀 Featured Projects

${projectCards}

---

### 💻 Tech Stack

${techStack}

---

<div align="center">

${config.footer}

</div>
`;
}

export async function generateProfileReadme({ config, manifest, readmePath }) {
  const readme = generateProfileReadmeContent({ config, manifest });
  await writeFile(resolve(readmePath), readme);
  return readme;
}
