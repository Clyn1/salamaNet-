/**
 * components/ContactsManager.js
 * Full CRUD interface for managing emergency contacts.
 * Used inside the Profile page.
 *
 * Features:
 *   - List existing contacts
 *   - Add new contact with inline form
 *   - Edit existing contact
 *   - Delete with confirmation
 *   - Shows Kenya default hotlines always
 */

import React, { useState, useEffect } from 'react';
import { contactsAPI } from '../services/api';
import { useToast } from './Toast';
import './ContactsManager.css';

// Built-in hotlines — always shown, cannot be deleted
const HOTLINES = [
  { name: 'Gender Violence Helpline', phone: '0800 720 592', relationship: 'Helpline — free, 24/7' },
  { name: 'Kenya Police',             phone: '999 / 112',    relationship: 'Emergency services' },
  { name: 'Childline Kenya',          phone: '116',          relationship: 'Support for under 18s' },
];

const EMPTY_FORM = { name: '', phone: '', relationship: '' };

const ContactsManager = () => {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // null = adding new
  const [form, setForm]         = useState(EMPTY_FORM);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactsAPI.getAll();
      setContacts(res.data.contacts || []);
    } catch {
      showToast('Could not load contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditIndex(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (idx) => {
    setEditIndex(idx);
    setForm({ ...contacts[idx] });
    setError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    setSaving(true);
    try {
      if (editIndex !== null) {
        const res = await contactsAPI.update(editIndex, form);
        setContacts(res.data.contacts);
        showToast('Contact updated ✅', 'success');
      } else {
        const res = await contactsAPI.add(form);
        setContacts(res.data.contacts);
        showToast('Contact added ✅', 'success');
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditIndex(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (idx) => {
    try {
      const res = await contactsAPI.remove(idx);
      setContacts(res.data.contacts);
      setDeleteIdx(null);
      showToast('Contact removed', 'info');
    } catch {
      showToast('Failed to delete contact', 'error');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditIndex(null);
    setError('');
  };

  const getInitials = (name) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="contacts-manager">

      {/* Header */}
      <div className="cm-header">
        <div>
          <h3 className="cm-title">Emergency contacts</h3>
          <p className="cm-subtitle">Notified when you press SOS</p>
        </div>
        {!showForm && contacts.length < 10 && (
          <button className="btn btn-outline cm-add-btn" onClick={openAdd}>
            + Add contact
          </button>
        )}
      </div>

      {/* Inline add/edit form */}
      {showForm && (
        <form className="cm-form" onSubmit={handleSave}>
          <p className="cm-form-title">
            {editIndex !== null ? 'Edit contact' : 'Add emergency contact'}
          </p>
          {error && <p className="cm-error" role="alert">{error}</p>}
          <div className="cm-form-grid">
            <div className="field">
              <label>Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Mama"
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>Phone number *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                placeholder="+254 712 345 678"
                required
              />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Relationship</label>
              <input
                name="relationship"
                value={form.relationship}
                onChange={handleFormChange}
                placeholder="e.g. Mother, Sister, Friend"
              />
            </div>
          </div>
          <div className="cm-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editIndex !== null ? 'Save changes' : 'Add contact'}
            </button>
            <button type="button" className="btn btn-outline" onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Contact list */}
      {loading ? (
        <div className="cm-loading">
          <div className="spinner" />
        </div>
      ) : (
        <div className="cm-list">
          {contacts.length === 0 && !showForm && (
            <div className="cm-empty">
              <p className="cm-empty-text">No personal contacts yet.</p>
              <p className="cm-empty-hint">Add people who should receive your SOS alerts.</p>
            </div>
          )}

          {/* Personal contacts */}
          {contacts.map((c, idx) => (
            <div key={idx} className="cm-item personal">
              <div className="cm-avatar">{getInitials(c.name)}</div>
              <div className="cm-details">
                <p className="cm-name">{c.name}</p>
                <p className="cm-phone">{c.phone}</p>
                {c.relationship && <p className="cm-rel">{c.relationship}</p>}
              </div>
              <div className="cm-actions">
                {deleteIdx === idx ? (
                  <div className="cm-delete-confirm">
                    <span>Remove?</span>
                    <button className="cm-btn-yes" onClick={() => handleDelete(idx)}>Yes</button>
                    <button className="cm-btn-no"  onClick={() => setDeleteIdx(null)}>No</button>
                  </div>
                ) : (
                  <>
                    <button className="cm-action-btn" onClick={() => openEdit(idx)} title="Edit">✏️</button>
                    <button className="cm-action-btn danger" onClick={() => setDeleteIdx(idx)} title="Remove">🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Built-in hotlines — always visible */}
          <div className="cm-divider">
            <span>Always included</span>
          </div>
          {HOTLINES.map((h, i) => (
            <div key={i} className="cm-item hotline">
              <div className="cm-avatar hotline-av">
                {h.name === 'Kenya Police' ? '🚔' : h.name === 'Childline Kenya' ? '🧒' : '📞'}
              </div>
              <div className="cm-details">
                <p className="cm-name">{h.name}</p>
                <p className="cm-phone">{h.phone}</p>
                <p className="cm-rel">{h.relationship}</p>
              </div>
              <span className="cm-fixed-badge">Built-in</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsManager;
