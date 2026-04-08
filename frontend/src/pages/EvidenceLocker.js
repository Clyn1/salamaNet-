/**
 * pages/EvidenceLocker.js
 * Secure evidence storage page.
 * Upload files with descriptions — all timestamped for legal use.
 */

import React, { useState, useEffect, useRef } from 'react';
import { evidenceAPI } from '../services/api';
import './EvidenceLocker.css';

const CATEGORIES = [
  { value: 'cyberstalking', label: 'Cyberstalking' },
  { value: 'deepfake', label: 'Deepfake / AI-generated image' },
  { value: 'nonconsensual', label: 'Non-consensual image sharing' },
  { value: 'harassment', label: 'Online harassment' },
  { value: 'threat', label: 'Threats & intimidation' },
  { value: 'other', label: 'Other' },
];

const EvidenceLocker = () => {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ description: '', category: 'other' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null); // Confirmation state
  const fileRef = useRef(null);

  useEffect(() => { fetchEvidence(); }, []);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await evidenceAPI.getAll();
      setEvidence(res.data.evidence || []);
    } catch {
      setError('Failed to load evidence. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Please add a description.'); return; }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('description', form.description);
      formData.append('category', form.category);

      await evidenceAPI.upload(formData);

      setSuccess('Evidence secured successfully! ✅');
      setForm({ description: '', category: 'other' });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchEvidence();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await evidenceAPI.delete(id);
      setEvidence(prev => prev.filter(e => e._id !== id));
      setDeleteId(null);
    } catch {
      setError('Failed to delete. Please try again.');
    }
  };

  const getCategoryLabel = (val) =>
    CATEGORIES.find(c => c.value === val)?.label || val;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>🔒 Evidence Locker</h2>
        <p>Securely store screenshots, files, and records for legal use — all timestamped</p>
      </div>

      {/* Legal note */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <strong>Legal note:</strong> All evidence is stored with tamper-evident timestamps.
        This can be used to support a case with the Communications Authority of Kenya or in court.
        Do not delete evidence if you plan to take legal action.
      </div>

      {/* Upload form */}
      <div className="card upload-card">
        <h3 className="section-title">Add new evidence</h3>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* File upload area */}
          <div
            className="upload-area"
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <div className="file-selected">
                <span className="file-icon">
                  {file.type.startsWith('image/') ? '🖼️' : '📄'}
                </span>
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  className="file-remove"
                  onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                >✕</button>
              </div>
            ) : (
              <>
                <div className="upload-icon">📎</div>
                <p className="upload-label">Click to attach a file</p>
                <p className="upload-hint">Images, PDFs, documents — max 50MB (optional)</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => { setFile(e.target.files[0] || null); setError(''); }}
          />

          <div className="field">
            <label htmlFor="description">
              Description <span style={{ color: 'var(--red)', fontWeight: 400 }}>*</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe what happened: who sent it, when, where, what was said or shown..."
              required
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={uploading}>
            {uploading ? 'Securing evidence...' : '🔒 Secure this evidence'}
          </button>
        </form>
      </div>

      {/* Evidence list */}
      <div className="card evidence-list-card">
        <div className="list-header">
          <h3 className="section-title" style={{ margin: 0 }}>
            Secured evidence
            <span className="badge badge-green" style={{ marginLeft: 8 }}>
              {evidence.length} {evidence.length === 1 ? 'file' : 'files'}
            </span>
          </h3>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : evidence.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔐</div>
            <p>No evidence stored yet</p>
            <small>Upload your first piece of evidence above to get started</small>
          </div>
        ) : (
          <div className="evidence-items">
            {evidence.map((ev) => (
              <div key={ev._id} className="evidence-item">
                {/* Thumbnail */}
                <div className="ev-thumb">
                  {ev.isDeepfakeScan ? '🔬' : ev.mimeType?.startsWith('image/') ? '🖼️' : '📄'}
                </div>

                {/* Details */}
                <div className="ev-details">
                  <div className="ev-top">
                    <h4 className="ev-name">{ev.fileName}</h4>
                    <div className="ev-badges">
                      <span className="badge badge-amber">{getCategoryLabel(ev.category)}</span>
                      {ev.deepfakeResult && (
                        <span className={`badge ${ev.deepfakeResult === 'fake' ? 'badge-red' : 'badge-green'}`}>
                          {ev.deepfakeResult === 'fake' ? '⚠️ Deepfake' : '✅ Authentic'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="ev-desc">{ev.description}</p>
                  <div className="ev-meta">
                    <span className="ev-timestamp">
                      🕐 {new Date(ev.createdAt).toLocaleString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {ev.fileSize > 0 && (
                      <span className="ev-size">{(ev.fileSize / 1024).toFixed(1)} KB</span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <div className="ev-actions">
                  {deleteId === ev._id ? (
                    <div className="delete-confirm">
                      <p>Delete?</p>
                      <button className="btn-sm danger" onClick={() => handleDelete(ev._id)}>Yes</button>
                      <button className="btn-sm" onClick={() => setDeleteId(null)}>No</button>
                    </div>
                  ) : (
                    <button
                      className="delete-btn"
                      onClick={() => setDeleteId(ev._id)}
                      title="Delete evidence"
                    >✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceLocker;