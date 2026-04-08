/**
 * pages/Signup.js
 * Registration page — creates a new SalamaNet account.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../services/AuthContext';
import './Auth.css';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-shield">🛡️</div>
          <h1>Join SalamaNet</h1>
          <p>Create your free safety account today</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" value={form.name}
              onChange={handleChange} placeholder="Amara Wanjiku" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password <span style={{color:'var(--subtle)',fontWeight:400}}>(min 8 characters)</span></label>
            <input id="password" name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="Create a strong password" required />
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" name="confirm" type="password" value={form.confirm}
              onChange={handleChange} placeholder="Repeat your password" required />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create my account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <p className="auth-privacy">
          🔐 Your data is encrypted and never shared. Evidence is stored securely for legal use only.
        </p>
      </div>

      <div className="auth-footer">
        <p>🆘 In an emergency, call <strong>999</strong> · Gender Violence Helpline: <strong>0800 720 592</strong></p>
      </div>
    </div>
  );
};

export default Signup;