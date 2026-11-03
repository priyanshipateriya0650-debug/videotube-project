import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser,
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  registerUser as apiRegisterUser,
} from '../api/auth.api';
import { setStoredAccessToken, getStoredAccessToken } from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on application mount
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(null);
      // Even if no token in localStorage, httpOnly cookie may exist
      const response = await getCurrentUser();
      if (response?.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 or network error on session check -> user is not authenticated
      setUser(null);
      setStoredAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Listen for session expiry event dispatched by axios response interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setStoredAccessToken(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [checkSession]);

  // Login handler
  const login = async ({ username, email, password }) => {
    try {
      setAuthError(null);
      const res = await apiLoginUser({ username, email, password });
      
      const loggedInUser = res?.data?.user;
      const token = res?.data?.accessToken;

      if (token) {
        setStoredAccessToken(token);
      }

      if (loggedInUser) {
        setUser(loggedInUser);
      }

      return { success: true, user: loggedInUser };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      setAuthError(null);
      const res = await apiRegisterUser(formData);
      return { success: true, data: res?.data };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await apiLogoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setStoredAccessToken(null);
      setUser(null);
    }
  };

  // Helper to update local user state when user edits profile/avatar
  const updateUserState = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkSession,
    updateUserState,
    setAuthError,
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
