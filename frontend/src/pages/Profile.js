/**
 * pages/Profile.js  (v2) — with ContactsManager + PDF export
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import { useToast } from '../components/Toast';
import ContactsManager from '../components/ContactsManager';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    reportAPI.getSummary().then(res => setSummary(res.data.summary)).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleDownloadPDF = async () => {
    setExportingPDF(true);
    showToast('Preparing your evidence report…', 'info');
    try {
      await reportAPI.downloadPDF();
      showToast('PDF downloaded ✅', 'success');
    } catch {
      showToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setExportingPDF(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'April 2025';

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>👤 My Profile</h2>
        <p>Account details, emergency contacts, and legal evidence export</p>
      </div>
      <div className="profile-layout">
        <div className="profile-left">
          <div className="card profile-card" style={{ marginBottom: 16 }}>
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
              <div>
                <h3 className="profile-name">{user?.name}</h3>
                <p className="profile-email">{user?.email}</p>
                <p className="profile-joined">Member since {joinedDate}</p>
              </div>
            </div>
            <div className="profile-stats">
              <div className="p-stat"><span className="p-stat-val">{summary?.totalEvidence ?? '—'}</span><span className="p-stat-label">Evidence</span></div>
              <div className="p-stat"><span className="p-stat-val" style={{color:'var(--red)'}}>{summary?.deepfakesFound ?? '—'}</span><span className="p-stat-label">Deepfakes</span></div>
              <div className="p-stat"><span className="p-stat-val" style={{color:'var(--amber)'}}>{summary?.deepfakeScans ?? '—'}</span><span className="p-stat-label">Scans</span></div>
            </div>
            <div className="profile-info">
              <div className="info-row"><span className="info-label">Name</span><span className="info-val">{user?.name}</span></div>
              <div className="info-row"><span className="info-label">Email</span><span className="info-val">{user?.email}</span></div>
              <div className="info-row"><span className="info-label">Status</span><span className="info-val" style={{color:'var(--green)'}}>🟢 Active & Protected</span></div>
            </div>
            <button className="btn btn-outline" style={{marginTop:20,width:'100%'}} onClick={handleLogout}>Sign out</button>
          </div>

          <div className="card pdf-export-card">
            <div className="pdf-icon">📋</div>
            <h3 className="pdf-title">Legal Evidence Report</h3>
            <p className="pdf-desc">Download a formatted PDF of all your evidence — for police, lawyers, or the Communications Authority of Kenya.</p>
            {summary?.totalEvidence === 0
              ? <p className="pdf-empty">No evidence stored yet.</p>
              : <>
                  <p className="pdf-count">{summary?.totalEvidence ?? '…'} items will be included</p>
                  <button className="btn btn-primary" style={{width:'100%',marginTop:12}} onClick={handleDownloadPDF} disabled={exportingPDF}>
                    {exportingPDF ? '⏳ Generating…' : '⬇️ Download Evidence PDF'}
                  </button>
                </>
            }
            <p className="pdf-note">Includes tamper-evident timestamps and chain of custody information.</p>
          </div>
        </div>

        <div className="profile-right">
          <div className="card" style={{marginBottom:16}}>
            <ContactsManager />
          </div>
          <div className="card safety-resources">
            <h3 className="section-title" style={{fontSize:15}}>Safety resources</h3>
            <div className="resource-list">
              {[
                {icon:'📡', name:'Communications Authority of Kenya', desc:'Report online abuse and cybercrimes', href:'https://www.ca.go.ke'},
                {icon:'📞', name:'Gender Violence Helpline', desc:'0800 720 592 — Free, 24/7', href:'tel:0800720592'},
                {icon:'⚖️', name:'Kenya National Human Rights Commission', desc:'Report rights violations', href:'https://www.knchr.org'},
                {icon:'🧒', name:'Childline Kenya', desc:'116 — Free support for under 18s', href:'tel:116'},
                {icon:'💙', name:'Befrienders Kenya', desc:'0800 723 253 — Emotional support', href:'tel:0800723253'},
              ].map((r,i) => (
                <a key={i} href={r.href} target={r.href.startsWith('http')?'_blank':undefined} rel="noopener noreferrer" className="resource-item">
                  <span>{r.icon}</span>
                  <div><p className="resource-name">{r.name}</p><p className="resource-desc">{r.desc}</p></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
