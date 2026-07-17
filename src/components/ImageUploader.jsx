import { useRef } from "react";

export default function ImageUploader({ imagePreview, onImageSelect, error }) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onImageSelect(file);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label>Portrait Image (transparent PNG)</label>
      <div
        className={`image-upload-area ${imagePreview ? "has-image" : ""} ${error ? "has-error" : ""}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
          style={{ display: "none" }}
        />
        {imagePreview ? (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Portrait preview" className="image-preview" />
            <button type="button" className="btn-clear-image" onClick={handleClear}>
              Change Image
            </button>
          </div>
        ) : (
          <div className="image-upload-placeholder">
            <div className="upload-icon">📸</div>
            <p>Click or drag & drop your portrait image here</p>
            <p className="upload-hint">PNG with transparent background recommended</p>
          </div>
        )}
      </div>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
