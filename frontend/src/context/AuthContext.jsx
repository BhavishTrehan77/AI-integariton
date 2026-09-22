import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('ai_auth_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ai_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('ai_auth_token', token);
    } else {
      localStorage.removeItem('ai_auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ai_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ai_auth_user');
    }
  }, [user]);

  /**
   * Login handler
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      // res can be { data: { AccToken, user }, message } or { data: { message, AccToken } }
      const authData = res.data || res;
      const receivedToken = authData.AccToken;
      const receivedUser = authData.user || {
        email,
        name: email.split('@')[0],
      };

      if (!receivedToken) {
        throw new Error('Authentication token not received from server');
      }

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signup handler
   */
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await signupUser({ name, email, password });
      return { success: true, data: res };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout handler
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ai_auth_token');
    localStorage.removeItem('ai_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
