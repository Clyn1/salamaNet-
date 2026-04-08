/**
 * components/Toast.js
 * Global toast notification system.
 *
 * Usage — wrap your app with <ToastProvider>, then anywhere:
 *   const { showToast } = useToast();
 *   showToast('Evidence saved!', 'success');
 *   showToast('Something failed', 'error');
 *   showToast('Alert sent!', 'warning');
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Show a toast notification.
   * @param {string} message - Text to display
   * @param {'success'|'error'|'warning'|'info'} type - Visual style
   * @param {number} duration - Auto-dismiss delay in ms (default 3500)
   */
  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="alert"
          >
            <span className="toast-icon">{icons[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
            >✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  return ctx;
};