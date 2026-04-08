/**
 * services/AuthContext.js
 * React Context for global authentication state.
 * Wrap your app with <AuthProvider> and use useAuth() hook anywhere.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

// Create the context
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and provides auth state
 * to all child components.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True while checking saved session

  // On mount, check if user has a saved session (token in localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('salama_token');
    const savedUser = localStorage.getItem('salama_user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Optionally verify token is still valid with the backend
        authAPI.getMe()
          .then(res => setUser(res.data.user))
          .catch(() => {
            // Token is invalid or expired — clear session
            localStorage.removeItem('salama_token');
            localStorage.removeItem('salama_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Call this after successful login/register
  const login = (userData, token) => {
    localStorage.setItem('salama_token', token);
    localStorage.setItem('salama_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Clear session and redirect to login
  const logout = () => {
    localStorage.removeItem('salama_token');
    localStorage.removeItem('salama_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook — call inside any component to get auth state.
 * Example:
 *   const { user, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};
