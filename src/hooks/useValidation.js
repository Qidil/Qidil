import { useCallback } from "react";
import { fieldConfig, defaultFormData } from "../utils/fieldConfig.js";

function validateField(path, value, allData) {
  const errors = [];
  const parts = path.split(".");

  let config;
  if (parts.length === 2 && fieldConfig[parts[0]] && fieldConfig[parts[0]][parts[1]]) {
    config = fieldConfig[parts[0]][parts[1]];
  } else if (parts.length === 1 && fieldConfig[parts[0]]) {
    config = fieldConfig[parts[0]];
  }

  if (!config) {
    if (path === "footer") {
      config = fieldConfig.footer;
    }
  }

  if (!config) return errors;

  if (config.type === "boolean" || config.type === "select" || config.type === "number") {
    return errors;
  }

  const strValue = String(value || "");
  const len = strValue.length;

  if (!config.optional && config.min !== undefined && config.min > 0 && len < config.min) {
    errors.push(`Min. ${config.min} characters (current: ${len || "empty"})`);
  }
  if (config.max && len > config.max) {
    errors.push(`Max. ${config.max} characters (current: ${len})`);
  }
  if (config.pattern && len > 0 && !new RegExp(config.pattern).test(strValue)) {
    errors.push(config.patternHint || `Invalid format`);
  }
  if (config.isUrl && len > 0) {
    try {
      const url = new URL(strValue);
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.push("Must use http or https");
      }
    } catch {
      errors.push("Must be a valid URL");
    }
  }

  return errors;
}

function validateArrayItem(itemConfig, item, index, sectionName) {
  const errors = {};
  for (const [key, cfg] of Object.entries(itemConfig)) {
    if (key.startsWith("_")) continue;
    const fieldErrors = validateField(key, item[key], item);
    if (fieldErrors.length > 0) {
      errors[key] = fieldErrors;
    }
  }
  return Object.keys(errors).length > 0 ? { index, section: sectionName, errors } : null;
}

export function validateAll(data) {
  const errors = [];

  for (const [field, cfg] of Object.entries(fieldConfig.profile)) {
    if (cfg.isArray) {
      const arr = data.profile[field] || [];
      if (arr.length < (cfg.minItems || 1)) {
        errors.push({ path: `profile.${field}`, messages: [`Min. ${cfg.minItems} items`] });
      }
      if (arr.length > (cfg.maxItems || 3)) {
        errors.push({ path: `profile.${field}`, messages: [`Max. ${cfg.maxItems} items`] });
      }
      arr.forEach((val, i) => {
        const len = (val || "").length;
        const itemErrors = [];
        if (cfg.min && len < cfg.min) itemErrors.push(`Min. ${cfg.min} characters (current: ${len || "empty"})`);
        if (cfg.max && len > cfg.max) itemErrors.push(`Max. ${cfg.max} characters (current: ${len})`);
        if (itemErrors.length) errors.push({ path: `profile.${field}[${i}]`, messages: itemErrors });
      });
    } else {
      const msgs = validateField(field, data.profile[field], data);
      if (msgs.length) errors.push({ path: `profile.${field}`, messages: msgs });
    }
  }

  for (const [field, cfg] of Object.entries(fieldConfig.research)) {
    const msgs = validateField(field, data.research[field], data);
    if (msgs.length) errors.push({ path: `research.${field}`, messages: msgs });
  }

  const focusArr = data.focus || [];
  if (focusArr.length < 1) {
    errors.push({ path: "focus", messages: ["Min. 1 focus area"] });
  }
  if (focusArr.length > 6) {
    errors.push({ path: "focus", messages: ["Max. 6 focus areas"] });
  }
  focusArr.forEach((item, i) => {
    const result = validateArrayItem(fieldConfig.focus, item, i, "Focus");
    if (result) {
      for (const [key, msgs] of Object.entries(result.errors)) {
        errors.push({ path: `focus[${i}].${key}`, messages: msgs });
      }
    }
  });

  const projArr = data.projects || [];
  if (projArr.length < 1) {
    errors.push({ path: "projects", messages: ["Min. 1 project"] });
  }
  if (projArr.length > 6) {
    errors.push({ path: "projects", messages: ["Max. 6 projects"] });
  }
  projArr.forEach((item, i) => {
    const result = validateArrayItem(fieldConfig.projects, item, i, "Projects");
    if (result) {
      for (const [key, msgs] of Object.entries(result.errors)) {
        errors.push({ path: `projects[${i}].${key}`, messages: msgs });
      }
    }
  });

  const techArr = data.techStack || [];
  if (techArr.length < 1) {
    errors.push({ path: "techStack", messages: ["Min. 1 technology"] });
  }
  techArr.forEach((val, i) => {
    const len = (val || "").length;
    const msgs = [];
    if (len < 1) msgs.push("Min. 1 character");
    if (len > 999) msgs.push("Max. 999 characters");
    if (msgs.length) errors.push({ path: `techStack[${i}]`, messages: msgs });
  });

  const linksArr = data.links || [];
  if (linksArr.length < 1) {
    errors.push({ path: "links", messages: ["Min. 1 link"] });
  }
  if (linksArr.length > 4) {
    errors.push({ path: "links", messages: ["Max. 4 links"] });
  }
  linksArr.forEach((item, i) => {
    const result = validateArrayItem(fieldConfig.links, item, i, "Links");
    if (result) {
      for (const [key, msgs] of Object.entries(result.errors)) {
        errors.push({ path: `links[${i}].${key}`, messages: msgs });
      }
    }
  });

  const footerMsgs = validateField("footer", data.footer, data);
  if (footerMsgs.length) errors.push({ path: "footer", messages: footerMsgs });

  return errors;
}

export function useFormValidation() {
  const validate = useCallback((data) => {
    return validateAll(data);
  }, []);

  return { validate };
}
