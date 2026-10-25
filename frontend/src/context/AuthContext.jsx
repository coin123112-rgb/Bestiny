import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user') ?? localStorage.getItem('sp_user') ?? localStorage.getItem('bs_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('sp_user', JSON.stringify(user));
    localStorage.setItem('bs_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('sp_user');
    localStorage.removeItem('bs_user');
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') ?? localStorage.getItem('sp_token');
    const savedUser = readStoredUser();

    if (savedUser) setUser(savedUser);
    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.get('/auth/me')
      .then(({ data }) => {
        const nextUser = data.user ?? savedUser;
        setUser(nextUser);
        persistUser(nextUser);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('sp_token');
        localStorage.removeItem('user');
        localStorage.removeItem('sp_user');
        localStorage.removeItem('bs_user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const nextUser = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('sp_token', data.token);
    persistUser(nextUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const nextUser = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('sp_token', data.token);
    persistUser(nextUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('sp_token');
    localStorage.removeItem('user');
    localStorage.removeItem('sp_user');
    localStorage.removeItem('bs_user');
    localStorage.removeItem('bs_avatar');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
