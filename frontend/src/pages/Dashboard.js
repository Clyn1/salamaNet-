/**
 * pages/Dashboard.js
 * Main dashboard — shows stats, quick actions, and activity feed.
 * Fetches real data from the backend on mount.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { evidenceAPI, sosAPI } from '../services/api';
import './Dashboard.css';

// Safety tip of the day — rotates daily
const SAFETY_TIPS = [
  'Screenshot and store any threatening messages as evidence before blocking the sender.',
  'Use strong, unique passwords for every account. A password manager can help.',
  'Enable two-factor authentication on all social media accounts.',
  'Never share your real-time location publicly. Check your app privacy settings.',
  'If you receive a suspicious image of yourself, do not share it further — report and store it.',
  'Trust your instincts. If someone online makes you uncomfortable, it\'s okay to block and report.',
  'Talk to a trusted adult if you receive threats online. You are not alone.',
];

const todaysTip = SAFETY_TIPS[new Date().getDay() % SAFETY_TIPS.length];

const StatCard = ({ label, value, sub, color }) => (
  <div className={`stat-card ${color || ''}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const FeatureCard = ({ icon, title, desc, to, variant }) => (
  <Link to={to} className={`feature-card ${variant || ''}`}>
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ evidence: 0, sos: 0, scans: 0 });
  const [recentEvidence, setRecentEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch evidence count and recent items
        const evRes = await evidenceAPI.getAll();
        const evidence = evRes.data.evidence || [];

        // Count deepfake scans
        const scans = evidence.filter(e => e.isDeepfakeScan).length;

        // Fetch SOS alert count
        const sosRes = await sosAPI.getHistory();
        const sosCount = sosRes.data.count || 0;

        setStats({ evidence: evidence.length, sos: sosCount, scans });
        setRecentEvidence(evidence.slice(0, 3)); // Show 3 most recent
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // Fail gracefully — show zeros
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h2>{greeting}, {firstName} 👋</h2>
        <p>Here's your SalamaNet safety overview</p>
      </div>

      {/* Safety Tip Banner */}
      <div className="tip-banner">
        <span className="tip-icon">💡</span>
        <div>
          <strong>Safety tip of the day:</strong> {todaysTip}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-2 stats-grid">
        <StatCard label="Evidence Stored" value={loading ? '—' : stats.evidence} sub="files secured" />
        <StatCard label="SOS Alerts Sent" value={loading ? '—' : stats.sos} sub="total alerts" color="danger" />
        <StatCard label="Deepfake Scans" value={loading ? '—' : stats.scans} sub="files analyzed" color="amber" />
        <div className="stat-card status-card">
          <div className="stat-label">Account Status</div>
          <div className="status-indicator">
            <span className="status-dot" />
            Protected
          </div>
          <div className="stat-sub">All systems active</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="section-title">Quick actions</h3>
      <div className="feature-grid">
        <FeatureCard icon="🔬" title="Deepfake Detector" desc="Scan images & videos for AI manipulation" to="/detector" />
        <FeatureCard icon="🚨" title="SOS Alert" desc="Instantly alert your trusted contacts" to="/sos" variant="sos" />
        <FeatureCard icon="🔒" title="Evidence Locker" desc="Store screenshots securely for legal use" to="/evidence" />
        <FeatureCard icon="👤" title="My Profile" desc="Manage your contacts & settings" to="/profile" />
      </div>

      {/* Recent Evidence */}
      <div className="card recent-section">
        <div className="section-header">
          <h3 className="section-title" style={{ margin: 0 }}>Recent evidence</h3>
          <Link to="/evidence" className="view-all">View all →</Link>
        </div>

        {loading ? (
          <div className="loading-inline"><div className="spinner" /></div>
        ) : recentEvidence.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔐</div>
            <p>No evidence stored yet</p>
            <small>Upload screenshots or files to build your case securely</small>
          </div>
        ) : (
          <div className="recent-list">
            {recentEvidence.map(ev => (
              <div key={ev._id} className="recent-item">
                <div className="recent-thumb">
                  {ev.isDeepfakeScan ? '🔬' : ev.mimeType?.startsWith('image/') ? '🖼️' : '📄'}
                </div>
                <div className="recent-details">
                  <p className="recent-name">{ev.fileName}</p>
                  <p className="recent-desc">{ev.description.slice(0, 60)}{ev.description.length > 60 ? '...' : ''}</p>
                  <p className="recent-time">{new Date(ev.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {ev.deepfakeResult && (
                  <span className={`badge ${ev.deepfakeResult === 'fake' ? 'badge-red' : 'badge-green'}`}>
                    {ev.deepfakeResult === 'fake' ? 'Deepfake' : 'Authentic'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Numbers */}
      <div className="emergency-banner">
        <strong>🆘 Kenya Emergency Numbers</strong>
        <div className="emergency-numbers">
          <span>Police: <strong>999 / 112</strong></span>
          <span>Gender Violence: <strong>0800 720 592</strong></span>
          <span>Childline: <strong>116</strong></span>
          <span>Befrienders: <strong>0800 723 253</strong></span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;