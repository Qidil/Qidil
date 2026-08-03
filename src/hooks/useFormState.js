import { useState, useCallback } from "react";
import { defaultFormData } from "../utils/fieldConfig.js";

function migrateTechStack(techStack) {
  if (!Array.isArray(techStack)) return [{ name: "", version: "" }];
  const items = [];
  for (const item of techStack) {
    if (typeof item === "string") {
      item.split(",").forEach((chunk) => {
        const name = chunk.trim();
        if (name) items.push({ name, version: "" });
      });
    } else if (item && typeof item === "object") {
      items.push({ name: (item.name || "").trim(), version: (item.version || "").trim() });
    }
  }
  if (items.length === 0) items.push({ name: "", version: "" });
  return items;
}

function migrateFormData(parsed) {
  const next = { ...defaultFormData, ...parsed };
  next.techStack = migrateTechStack(parsed.techStack);
  return next;
}

export function useFormState() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("portfolio-card-draft");
      if (!saved) return defaultFormData;
      const parsed = JSON.parse(saved);
      return migrateFormData(parsed);
    } catch {
      return defaultFormData;
    }
  });

  const [errors, setErrors] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const updateField = useCallback((path, value) => {
    setFormData((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        if (obj[parts[i]] === undefined || obj[parts[i]] === null) {
          obj[parts[i]] = isNaN(parts[i + 1]) ? {} : [];
        }
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      try {
        localStorage.setItem("portfolio-card-draft", JSON.stringify(next));
      } catch {}
      return next;
    });
    setErrors((prev) => prev.filter((e) => !e.path.startsWith(path)));
  }, []);

  const addArrayItem = useCallback((path, template) => {
    setFormData((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let obj = next;
      for (const part of parts) obj = obj[part];
      obj.push(template);
      try {
        localStorage.setItem("portfolio-card-draft", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const removeArrayItem = useCallback((path, index) => {
    setFormData((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let obj = next;
      for (const part of parts) obj = obj[part];
      obj.splice(index, 1);
      try {
        localStorage.setItem("portfolio-card-draft", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const setErrorsFromServer = useCallback((serverErrors) => {
    setErrors(serverErrors);
  }, []);

  const handleImageSelect = useCallback((file) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, []);

  const clearErrors = useCallback(() => setErrors([]), []);

  return {
    formData,
    setFormData,
    errors,
    setErrors: setErrorsFromServer,
    clearErrors,
    imageFile,
    imagePreview,
    handleImageSelect,
    updateField,
    addArrayItem,
    removeArrayItem,
  };
}
