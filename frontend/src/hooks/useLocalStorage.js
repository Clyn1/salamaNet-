/**
 * hooks/useLocalStorage.js
 * Hook to sync state with localStorage — persists across page refreshes.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 */

import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage might be full or disabled — fail silently
    }
  }, [key, value]);

  return [value, setValue];
};

/**
 * hooks/useDebounce.js
 * Delay a value update — useful for search inputs to avoid firing
 * a new API request on every keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchQuery, 400);
 *   // debouncedSearch only updates 400ms after the user stops typing
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * hooks/useGeolocation.js
 * Get the user's GPS coordinates with a nice loading/error state.
 *
 * Usage:
 *   const { location, error, loading } = useGeolocation();
 *   // location = { latitude, longitude, accuracy } or null
 */
export const useGeolocation = () => {
  const [state, setState] = useState({
    location: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation not supported by this browser.', loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          error: null,
          loading: false,
        });
      },
      (err) => {
        // Fall back to Nairobi coordinates when permission is denied
        console.warn('Geolocation error:', err.message);
        setState({
          location: { latitude: -1.2921, longitude: 36.8219, accuracy: 5000 },
          error: 'Location access denied — using approximate location.',
          loading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return state;
};

/**
 * hooks/useAsync.js
 * Generic hook for async operations with loading, error, and data states.
 * Prevents state updates on unmounted components.
 *
 * Usage:
 *   const { execute, loading, data, error } = useAsync(evidenceAPI.getAll);
 *   useEffect(() => { execute(); }, []);
 */
export const useAsync = (asyncFn) => {
  const [state, setState] = useState({ loading: false, data: null, error: null });
  let mounted = true;

  const execute = async (...args) => {
    setState({ loading: true, data: null, error: null });
    try {
      const result = await asyncFn(...args);
      if (mounted) setState({ loading: false, data: result.data, error: null });
      return result.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Something went wrong';
      if (mounted) setState({ loading: false, data: null, error: message });
      throw err;
    }
  };

  // Cleanup to prevent state updates after unmount
  useEffect(() => () => { mounted = false; }, []); // eslint-disable-line

  return { ...state, execute };
};
