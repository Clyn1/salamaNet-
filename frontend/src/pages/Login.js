/**
 * pages/Login.js
 * Login page — email + password authentication.
 * On success, stores JWT and redirects to dashboard.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../services/AuthContext';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-shield">🛡️</div>
          <h1>SalamaNet</h1>
          <p>Usalama wako, nguvu yako · Your safety, your strength</p>
        </div>

        {/* Error message */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Demo hint */}
        <div className="demo-hint">
          <strong>Demo account:</strong> amara@test.com · password123
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup">Create one for free</Link>
        </p>
      </div>

      {/* Safety resources footer */}
      <div className="auth-footer">
        <p>🆘 In an emergency, call <strong>999</strong> · Gender Violence Helpline: <strong>0800 720 592</strong></p>
      </div>
    </div>
  );
};

export default Login;
