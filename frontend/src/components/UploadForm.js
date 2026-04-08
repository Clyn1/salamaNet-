/**
 * components/UploadForm.js
 * Reusable drag-and-drop file upload component.
 * Used in both the Deepfake Detector and Evidence Locker pages.
 *
 * Props:
 *   onFile(file)      — called when a valid file is chosen
 *   accept            — MIME types string (e.g. "image/*,video/mp4")
 *   maxSizeMB         — max file size in MB (default 50)
 *   label             — main instruction text
 *   hint              — secondary hint below label
 *   className         — extra CSS classes
 */

import React, { useRef, useState } from 'react';
import './UploadForm.css';

const UploadForm = ({
  onFile,
  accept = 'image/*',
  maxSizeMB = 50,
  label = 'Drop your file here or click to browse',
  hint = 'Supported: JPG, PNG, WebP, PDF',
  className = '',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validate = (file) => {
    if (!file) return 'No file selected.';
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxSizeMB}MB.`;
    }
    return null;
  };

  const handle = (file) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError('');
    onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handle(e.dataTransfer.files[0]);
  };

  return (
    <div className={`upload-form-wrap ${className}`}>
      <div
        className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="File upload area"
      >
        <div className="upload-dropzone-icon">📂</div>
        <p className="upload-dropzone-label">{label}</p>
        <p className="upload-dropzone-hint">{hint} — max {maxSizeMB}MB</p>
      </div>

      {error && (
        <p className="upload-error" role="alert">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handle(e.target.files[0])}
        aria-hidden="true"
      />
    </div>
  );
};

export default UploadForm;