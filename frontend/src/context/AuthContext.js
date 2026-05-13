import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ln_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ln_user');
    if (stored) setUser(JSON.parse(stored));
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    _setAuth(res.data);
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await axios.post('/api/auth/register', { name, email, password, role });
    _setAuth(res.data);
    return res.data;
  };

  const _setAuth = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('ln_token', data.token);
    localStorage.setItem('ln_user', JSON.stringify(data.user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ln_token');
    localStorage.removeItem('ln_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isInstructor: user?.role === 'instructor' }}>
      {children}
    </AuthContext.Provider>
  );
};
