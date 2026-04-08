/**
 * services/api.js
 * Centralized API client for all backend requests.
 * Uses axios with automatic JWT token injection.
 */

import axios from 'axios';

// Base URL — React's proxy setting in package.json handles routing to backend
const BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout
});

/**
 * Request interceptor: Automatically add JWT token to every request.
 * This runs before every API call is sent.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('salama_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: Handle 401 errors globally.
 * If token is expired, automatically log the user out.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session
      localStorage.removeItem('salama_token');
      localStorage.removeItem('salama_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── EVIDENCE API ─────────────────────────────────────────────────────────────

export const evidenceAPI = {
  upload: (formData) =>
    api.post('/evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        // Optional: track upload progress
        const percent = Math.round((e.loaded * 100) / e.total);
        console.log(`Upload progress: ${percent}%`);
      },
    }),
  getAll: () => api.get('/evidence'),
  getOne: (id) => api.get(`/evidence/${id}`),
  delete: (id) => api.delete(`/evidence/${id}`),
};

// ─── SOS API ──────────────────────────────────────────────────────────────────

export const sosAPI = {
  sendAlert: (data) => api.post('/sos', data),
  getHistory: () => api.get('/sos'),
};

// ─── DETECTOR API ─────────────────────────────────────────────────────────────

export const detectorAPI = {
  scan: (formData) =>
    api.post('/detector/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── CONTACTS API ─────────────────────────────────────────────────────────────

export const contactsAPI = {
  getAll:  ()           => api.get('/contacts'),
  add:     (data)       => api.post('/contacts', data),
  update:  (index, data)=> api.put(`/contacts/${index}`, data),
  remove:  (index)      => api.delete(`/contacts/${index}`),
};

// ─── REPORT API ───────────────────────────────────────────────────────────────

export const reportAPI = {
  getSummary: () => api.get('/report/summary'),

  /**
   * Download the PDF evidence report.
   * Uses fetch directly so we can handle binary blob response.
   */
  downloadPDF: async () => {
    const token = localStorage.getItem('salama_token');
    const response = await fetch('/api/report/pdf', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('PDF generation failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salamanet-evidence-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export default api;
