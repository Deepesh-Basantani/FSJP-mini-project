import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser, removeStoredToken, removeStoredUser, api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const profile = await api.getProfile();
          if (profile) {
            setUser(profile);
            setStoredUser(profile);
          }
        } catch (err) {
          console.warn('Session expired or offline:', err);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setStoredToken(newToken);
    setStoredUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    removeStoredToken();
    removeStoredUser();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
  };

  const value = {
    token,
    user,
    role: user?.role,
    isAuthenticated: !!token && !!user,
    isVerified: user?.verificationStatus === 'VERIFIED',
    login,
    logout,
    updateUser,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
