/**
 * App.js — Root component with routing
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Detector from './pages/Detector';
import SOS from './pages/SOS';
import EvidenceLocker from './pages/EvidenceLocker';
import Profile from './pages/Profile';
import './App.css';

/**
 * ProtectedRoute: Redirects to /login if user is not authenticated.
 * Wrap any route that requires login with this component.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * PublicRoute: Redirects to /dashboard if user IS already authenticated.
 * Prevents logged-in users from seeing login/signup pages.
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/detector" element={<ProtectedRoute><Detector /></ProtectedRoute>} />
          <Route path="/sos" element={<ProtectedRoute><SOS /></ProtectedRoute>} />
          <Route path="/evidence" element={<ProtectedRoute><EvidenceLocker /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;