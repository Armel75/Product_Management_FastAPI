import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync user info if token is present on startup
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        const decoded = parseJwt(token);
        if (decoded && decoded.sub) {
          try {
            // Fetch user info from /users/{id}
            const response = await axiosClient.get(`/users/${decoded.sub}`);
            setUser(response.data);
          } catch (err) {
            console.error('Failed to restore user session:', err.message);
            // If token is invalid/expired, log out
            logout();
          }
        } else {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      // Form urlencoded request for OAuth2 token route standard in FastAPI
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axiosClient.post('/auth/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);

      const decoded = parseJwt(access_token);
      if (decoded && decoded.sub) {
        const userResponse = await axiosClient.get(`/users/${decoded.sub}`);
        setUser(userResponse.data);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Login failed.');
      throw err;
    }
  };

  const register = async (email, password) => {
    setError(null);
    try {
      await axiosClient.post('/auth/register', { email, password });
      // Automatical login after successful registration
      return await login(email, password);
    } catch (err) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
