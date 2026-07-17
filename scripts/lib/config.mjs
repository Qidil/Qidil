function assert(condition, message) {
  if (!condition) throw new Error(`Invalid configuration: ${message}`);
}

function assertText(value, label, maximum) {
  assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string.`);
  assert(value.length <= maximum, `${label} must be ${maximum} characters or fewer.`);
}

function assertUrl(value, label, { allowEmpty = false } = {}) {
  if (allowEmpty && value === "") return;
  try {
    const url = new URL(value);
    assert(["http:", "https:"].includes(url.protocol), `${label} must use http or https.`);
  } catch {
    throw new Error(`Invalid configuration: ${label} must be a valid URL.`);
  }
}

export function validateConfig(config) {
  assert(config && typeof config === "object" && !Array.isArray(config), "the root must be an object.");
  assert(config.profile && typeof config.profile === "object", "profile is required.");
  assertText(config.profile.name, "profile.name", 40);
  assertText(config.profile.username, "profile.username", 39);
  assert(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(config.profile.username), "profile.username is not a valid GitHub username.");
  assertText(config.profile.headline, "profile.headline", 46);
  assertText(config.profile.affiliation, "profile.affiliation", 40);
  assertText(config.profile.location, "profile.location", 32);
  assertText(config.profile.status, "profile.status", 42);
  assert(Array.isArray(config.profile.about) && config.profile.about.length >= 1 && config.profile.about.length <= 3, "profile.about must contain 1 to 3 paragraphs.");
  config.profile.about.forEach((paragraph, index) => assertText(paragraph, `profile.about[${index}]`, 320));

  assert(config.research && typeof config.research === "object", "research is required.");
  assertText(config.research.primary, "research.primary", 28);
  assertText(config.research.direction, "research.direction", 38);
  assertText(config.research.themes, "research.themes", 46);
  assertText(config.research.narrative, "research.narrative", 420);

  assert(Array.isArray(config.focus) && config.focus.length >= 1 && config.focus.length <= 6, "focus must contain 1 to 6 items.");
  config.focus.forEach((item, index) => {
    assertText(item?.name, `focus[${index}].name`, 28);
    assertText(item?.description, `focus[${index}].description`, 180);
  });

  assert(Array.isArray(config.projects) && config.projects.length >= 1 && config.projects.length <= 6, "projects must contain 1 to 6 items.");
  config.projects.forEach((project, index) => {
    assertText(project?.name, `projects[${index}].name`, 36);
    assertUrl(project?.url, `projects[${index}].url`);
    assertUrl(project?.homepage ?? "", `projects[${index}].homepage`, { allowEmpty: true });
    assertText(project?.focus, `projects[${index}].focus`, 88);
    assertText(project?.summary, `projects[${index}].summary`, 220);
    assertText(project?.heroLabel, `projects[${index}].heroLabel`, 30);
  });

  assert(Array.isArray(config.techStack) && config.techStack.length >= 1, "techStack must contain at least 1 item.");
  config.techStack.forEach((item, index) => assertText(item, `techStack[${index}]`, 999));

  assert(Array.isArray(config.links) && config.links.length >= 1 && config.links.length <= 4, "links must contain 1 to 4 items.");
  config.links.forEach((link, index) => {
    assertText(link?.label, `links[${index}].label`, 28);
    assertText(link?.value, `links[${index}].value`, 28);
    assertUrl(link?.url, `links[${index}].url`);
    assert(typeof link?.logo === "string" && link.logo.length <= 30, `links[${index}].logo must be 30 characters or fewer.`);
    assert(/^[A-Fa-f0-9]{6}$/.test(link?.color), `links[${index}].color must be a six-character hex value without #.`);
  });

  assert(config.activity && typeof config.activity.enabled === "boolean", "activity.enabled must be true or false.");
  assert(Number.isInteger(config.activity.limit) && config.activity.limit >= 1 && config.activity.limit <= 10, "activity.limit must be between 1 and 10.");
  assert(["signal", "ocean", "solar"].includes(config.appearance?.palette), "appearance.palette must be signal, ocean, or solar.");
  assertText(config.footer, "footer", 120);

  return config;
}

export function buildConfigFromFormData(formData) {
  const cleanAbout = (formData.profile.about || []).filter((a) => a && a.trim());
  const cleanFocus = (formData.focus || []).filter((f) => f.name && f.name.trim());
  const cleanProjects = (formData.projects || []).filter((p) => p.name && p.name.trim());
  const cleanTech = (formData.techStack || []).filter((t) => t && t.trim());
  const cleanLinks = (formData.links || []).filter((l) => l.label && l.label.trim());

  return {
    profile: {
      name: formData.profile.name.trim(),
      username: formData.profile.username.trim(),
      headline: formData.profile.headline.trim(),
      affiliation: formData.profile.affiliation.trim(),
      location: formData.profile.location.trim(),
      status: formData.profile.status.trim(),
      about: cleanAbout.map((a) => a.trim()),
    },
    research: {
      primary: formData.research.primary.trim(),
      direction: formData.research.direction.trim(),
      themes: formData.research.themes.trim(),
      narrative: formData.research.narrative.trim(),
    },
    focus: cleanFocus.map((f) => ({
      name: f.name.trim(),
      description: f.description.trim(),
    })),
    projects: cleanProjects.map((p) => ({
      name: p.name.trim(),
      url: p.url.trim(),
      homepage: (p.homepage || "").trim(),
      focus: p.focus.trim(),
      summary: p.summary.trim(),
      heroLabel: p.heroLabel.trim(),
    })),
    techStack: cleanTech.map((t) => t.trim()),
    links: cleanLinks.map((l) => ({
      label: l.label.trim(),
      value: l.value.trim(),
      url: l.url.trim(),
      logo: (l.logo || "").trim(),
      color: l.color.trim(),
    })),
    activity: {
      enabled: Boolean(formData.activity.enabled),
      limit: Math.min(10, Math.max(1, parseInt(formData.activity.limit) || 5)),
    },
    appearance: {
      palette: formData.appearance.palette || "signal",
    },
    footer: formData.footer.trim(),
  };
}
