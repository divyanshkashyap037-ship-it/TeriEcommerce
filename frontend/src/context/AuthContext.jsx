import { useEffect, useState } from 'react';
import api, { setAccessToken, getAccessToken } from '../services/api';
import axios from 'axios';
import { AuthContext } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Holds global auth state: user object + loading flag.
// On app start, tries silent refresh (cookie -> new access token -> /me).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        // Browser automatically sends HTTP-only refresh cookie.
        const res = await axios.post(`${API_BASE}/api/auth/refresh-token`, {}, { withCredentials: true });
        setAccessToken(res.data.accessToken);
        const me = await api.get('/api/auth/me');
        setUser(me.data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    const me = await api.get('/api/auth/me');
    setUser(me.data.user);
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore — still clear client state
    }
    setAccessToken(null);
    setUser(null);
  }

  const value = { user, loading, isAuthenticated: !!user, login, logout, accessToken: getAccessToken() };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
