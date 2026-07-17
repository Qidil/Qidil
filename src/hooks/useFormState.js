import { useState, useCallback } from "react";
import { defaultFormData } from "../utils/fieldConfig.js";

export function useFormState() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("portfolio-card-draft");
      return saved ? JSON.parse(saved) : defaultFormData;
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
