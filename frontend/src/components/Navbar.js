/**
 * components/Navbar.js
 * Top navigation bar — shown only when user is logged in.
 * Includes SOS quick-access button that pulses for visibility.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/dashboard" className="nav-logo">
        <span className="logo-shield">🛡</span>
        SalamaNet
      </Link>

      {/* Desktop links */}
      <div className="nav-links">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/detector" className={`nav-link ${isActive('/detector') ? 'active' : ''}`}>
          Detect
        </Link>
        <Link to="/evidence" className={`nav-link ${isActive('/evidence') ? 'active' : ''}`}>
          Evidence
        </Link>
        {/* SOS is always prominent */}
        <Link to="/sos" className="nav-link sos-link">
          🚨 SOS
        </Link>
      </div>

      {/* User section */}
      <div className="nav-user">
        <button className="avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="avatar">{initials}</div>
          <span className="user-name">{user?.name?.split(' ')[0]}</span>
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="dropdown">
            <div className="dropdown-header">
              <p className="dropdown-name">{user?.name}</p>
              <p className="dropdown-email">{user?.email}</p>
            </div>
            <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
              👤 My Profile
            </Link>
            <button className="dropdown-item logout" onClick={handleLogout}>
              🚪 Sign out
            </button>
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>🏠 Home</Link>
          <Link to="/detector" className="mobile-link" onClick={() => setMenuOpen(false)}>🔬 Deepfake Detector</Link>
          <Link to="/evidence" className="mobile-link" onClick={() => setMenuOpen(false)}>🔒 Evidence Locker</Link>
          <Link to="/sos" className="mobile-link sos" onClick={() => setMenuOpen(false)}>🚨 SOS Emergency</Link>
          <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>👤 My Profile</Link>
          <button className="mobile-link logout" onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
