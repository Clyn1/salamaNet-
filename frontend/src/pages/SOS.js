/**
 * pages/SOS.js
 * Emergency SOS alert page.
 * One button triggers an alert to trusted contacts with location.
 */

import React, { useState, useEffect } from 'react';
import { sosAPI } from '../services/api';
import { useAuth } from '../services/AuthContext';
import './SOS.css';

const SOS = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);      // Holds last alert data
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);

  // Try to get real GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
        () => {
          // Permission denied or unavailable — use default (Nairobi)
          setLocation({ latitude: -1.2921, longitude: 36.8219, accuracy: 500 });
        }
      );
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await sosAPI.getHistory();
      setHistory(res.data.alerts || []);
    } catch {
      // Fail silently — history is optional
    }
  };

  const sendSOS = async () => {
    if (sending) return;
    setSending(true);
    setError('');
    setSent(null);

    try {
      const payload = {
        ...location,
        message: `🚨 I need help! Please check on me. This is ${user?.name || 'a SalamaNet user'}.`,
      };

      const res = await sosAPI.sendAlert(payload);
      setSent(res.data.alert);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError('Failed to send alert. In an emergency, call 999 directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>🚨 SOS Emergency Alert</h2>
        <p>Press the button below to instantly alert your trusted contacts</p>
      </div>

      <div className="sos-layout">

        {/* Left: main SOS content */}
        <div className="sos-main">

          {/* Contacts panel */}
          <div className="card contacts-card">
            <h3 className="section-title">Who will be alerted</h3>
            <div className="contact-list">
              {(user?.emergencyContacts?.length > 0 ? user.emergencyContacts : [
                { name: 'Mama', phone: '+254 712 345 678', relationship: 'Mother' },
                { name: 'Sister Zawadi', phone: '+254 798 654 321', relationship: 'Sister' },
              ]).map((c, i) => (
                <div key={i} className="contact-row">
                  <div className="contact-avatar">{c.name[0]}</div>
                  <div>
                    <p className="contact-name">{c.name}</p>
                    <p className="contact-phone">{c.phone} · {c.relationship || 'Contact'}</p>
                  </div>
                  <span className="contact-badge">Will be notified</span>
                </div>
              ))}
              {/* Always include hotlines */}
              <div className="contact-row hotline">
                <div className="contact-avatar red">H</div>
                <div>
                  <p className="contact-name">Gender Violence Helpline</p>
                  <p className="contact-phone">0800 720 592 · Free call</p>
                </div>
              </div>
            </div>
          </div>

          {/* Success message */}
          {sent && (
            <div className="sos-success">
              <div className="sos-success-icon">🚨</div>
              <h2>SOS Alert Sent!</h2>
              <p><strong>Your contacts have been notified.</strong></p>
              <p className="sos-success-time">
                Sent at {new Date(sent.createdAt).toLocaleTimeString('en-KE')} ·{' '}
                {sent.contactsNotified?.length || 0} contacts notified
              </p>
              <div className="call-direct">
                <p>If you need immediate police response:</p>
                <a href="tel:999" className="call-btn">📞 Call 999 (Police)</a>
                <a href="tel:0800720592" className="call-btn">📞 Call Gender Violence Helpline</a>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {/* Big SOS button */}
          <div className="sos-button-wrap">
            <button
              className={`sos-big-btn ${sending ? 'sending' : ''}`}
              onClick={sendSOS}
              disabled={sending}
            >
              {sending ? '...' : 'SOS'}
            </button>
            <p className="sos-hint">
              {sending
                ? 'Sending alert to your contacts...'
                : 'Press to send emergency alert'}
            </p>
          </div>

          {/* Location status */}
          <div className="location-status">
            {location ? (
              <span className="loc-ok">📍 Location ready — will be included in alert</span>
            ) : (
              <span className="loc-pending">📍 Getting your location...</span>
            )}
          </div>
        </div>

        {/* Right: info panel */}
        <div className="sos-sidebar">
          <div className="card">
            <h3 className="section-title" style={{ fontSize: 15 }}>🆘 Emergency numbers</h3>
            <div className="emergency-list">
              <div className="emergency-item">
                <a href="tel:999">📞 999</a>
                <span>Kenya Police</span>
              </div>
              <div className="emergency-item">
                <a href="tel:112">📞 112</a>
                <span>Emergency Services</span>
              </div>
              <div className="emergency-item">
                <a href="tel:0800720592">📞 0800 720 592</a>
                <span>Gender Violence Helpline</span>
              </div>
              <div className="emergency-item">
                <a href="tel:116">📞 116</a>
                <span>Childline Kenya</span>
              </div>
              <div className="emergency-item">
                <a href="tel:0800723253">📞 0800 723 253</a>
                <span>Befrienders Kenya</span>
              </div>
            </div>
          </div>

          {/* Alert history */}
          {history.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 className="section-title" style={{ fontSize: 15 }}>Alert history</h3>
              <div className="history-list">
                {history.map((a) => (
                  <div key={a._id} className="history-item">
                    <span className="history-icon">🚨</span>
                    <div>
                      <p className="history-time">{new Date(a.createdAt).toLocaleString('en-KE')}</p>
                      <p className="history-loc">{a.location?.address || 'Location recorded'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOS;