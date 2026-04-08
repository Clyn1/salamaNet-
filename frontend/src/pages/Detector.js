/**
 * pages/Detector.js
 * Deepfake detection page.
 * User uploads an image/video → backend analyzes it → results displayed.
 * Scan is automatically saved to the Evidence Locker.
 */

import React, { useState, useRef } from 'react';
import { detectorAPI } from '../services/api';
import './Detector.css';

// Analysis step messages shown during scanning
const SCAN_STEPS = [
  'Loading analysis engine...',
  'Scanning pixel frequency patterns...',
  'Checking facial landmark consistency...',
  'Analyzing compression artifacts...',
  'Running GAN fingerprint detection...',
  'Cross-referencing metadata...',
  'Generating report...',
];

const Detector = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!allowed.includes(selectedFile.type)) {
      setError('File type not supported. Please upload an image (JPG, PNG, WebP) or video (MP4, MOV).');
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError('');
    setIsVideo(selectedFile.type.startsWith('video/'));

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const runScan = async () => {
    if (!file) return;
    setScanning(true);
    setResult(null);
    setError('');

    // Animate through scan steps
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      setScanStep(SCAN_STEPS[stepIdx % SCAN_STEPS.length]);
      stepIdx++;
    }, 600);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await detectorAPI.scan(formData);
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setScanning(false);
      setScanStep('');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setIsVideo(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isFake = result?.verdict === 'potential_deepfake';

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>🔬 Deepfake Detector</h2>
        <p>Upload an image or video to check for AI manipulation</p>
      </div>

      {/* Info banner */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <strong>How it works:</strong> Our engine analyzes pixel patterns, facial landmarks, compression artifacts,
        and GAN fingerprints to detect AI-generated or manipulated media. Each scan is saved to your Evidence Locker.
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Drop zone — shown when no file selected */}
      {!file && (
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="drop-icon">📂</div>
          <h3>Drop your file here or click to browse</h3>
          <p>Supports JPG, PNG, WebP, MP4, MOV — max 50MB</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/quicktime"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* File preview */}
      {file && !scanning && !result && (
        <div className="preview-card card">
          {preview ? (
            <img src={preview} alt="Preview" className="preview-img" />
          ) : (
            <div className="video-placeholder">🎬 {file.name}</div>
          )}
          <p className="preview-name">{file.name} · {(file.size / 1024).toFixed(1)} KB</p>
          <div className="preview-actions">
            <button className="btn btn-primary" onClick={runScan}>Analyze for deepfakes</button>
            <button className="btn btn-outline" onClick={reset}>Choose different file</button>
          </div>
        </div>
      )}

      {/* Scanning state */}
      {scanning && (
        <div className="scanning-card card">
          <div className="scan-spinner" />
          <h3>Analyzing your file...</h3>
          <p className="scan-step">{scanStep}</p>
          <div className="scan-progress">
            <div className="scan-progress-bar" />
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`result-card card ${isFake ? 'fake' : 'real'}`}>
          <div className="result-icon">{isFake ? '⚠️' : '✅'}</div>
          <h2>{result.label}</h2>
          <p className="result-desc">
            {isFake
              ? 'This media shows signs of AI manipulation. It may have been generated or altered using deepfake technology. The scan has been saved to your Evidence Locker.'
              : 'No significant signs of AI manipulation were detected. This media appears to be authentic. The scan has been saved to your Evidence Locker.'}
          </p>

          {/* Confidence bar */}
          <div className="confidence-section">
            <div className="confidence-label">
              <span>Detection confidence</span>
              <strong>{result.confidence}%</strong>
            </div>
            <div className="confidence-bar">
              <div
                className={`confidence-fill ${isFake ? 'fill-red' : 'fill-green'}`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          {/* Detailed checks */}
          {result.checks && (
            <div className="checks-grid">
              {Object.entries(result.checks).map(([key, val]) => (
                <div key={key} className="check-item">
                  <span className="check-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  </span>
                  <span className={`check-val ${
                    val.includes('anomal') || val.includes('inconsist') || val.includes('unusual') || val.includes('suspicious') || val.includes('detected') || val.includes('missing')
                      ? 'val-bad' : val.includes('mixed') || val.includes('possible') ? 'val-mixed' : 'val-good'
                  }`}>
                    {val.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="result-actions">
            <button className="btn btn-outline" onClick={reset}>Scan another file</button>
            <a href="/evidence" className="btn btn-primary">View Evidence Locker</a>
          </div>

          <p className="locker-note">✅ This scan result has been automatically saved to your Evidence Locker.</p>
        </div>
      )}

      {/* Tips */}
      <div className="detector-tips card">
        <h3 className="section-title" style={{ fontSize: 15 }}>What to do if you find a deepfake</h3>
        <ol className="tips-list">
          <li>Do <strong>not</strong> share the image further — this can make the situation worse.</li>
          <li>Save the evidence using SalamaNet's Evidence Locker.</li>
          <li>Report the content to the platform where you found it.</li>
          <li>Contact the <strong>Communications Authority of Kenya</strong> (+254 20 4242000) to report.</li>
          <li>Speak to a trusted adult or contact <strong>Gender Violence Helpline: 0800 720 592</strong>.</li>
        </ol>
      </div>
    </div>
  );
};

export default Detector;