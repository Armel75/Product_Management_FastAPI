import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isMocked: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setMockMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMocked, setIsMocked] = useState<boolean>(() => {
    const stored = localStorage.getItem('isMocked');
    return stored === null ? true : stored === 'true'; // Default to true for zero-setup demo
  });

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        if (isMocked) {
          const mockUser = localStorage.getItem('nowUser');
          if (mockUser) {
            setUser(JSON.parse(mockUser));
          } else {
            logout();
          }
        } else {
          try {
            const decoded = parseJwt(token);
            if (decoded && decoded.sub) {
              const response = await axiosClient.get(`/users/${decoded.sub}`);
              setUser(response.data);
            } else {
              logout();
            }
          } catch (err: any) {
            console.warn('Database connection unavailable, falling back to client-memory mode:', err.message);
            const mockUser = localStorage.getItem('nowUser');
            if (mockUser) {
              setUser(JSON.parse(mockUser));
              setIsMocked(true);
              localStorage.setItem('isMocked', 'true');
            } else {
              logout();
            }
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token, isMocked]);

  const login = async (email: string, password: string) => {
    setError(null);
    if (isMocked) {
      const dbUsers = JSON.parse(localStorage.getItem('nowUsers') || '[]');
      const match = dbUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!match) {
        throw new Error('This account was not found. Please click register below first.');
      }
      
      const payloadObj = { sub: match.id.toString(), email: match.email, exp: Date.now() + 3600 * 1000 };
      const dummyToken = `header.${btoa(JSON.stringify(payloadObj))}.signature`;

      localStorage.setItem('token', dummyToken);
      localStorage.setItem('nowUser', JSON.stringify(match));
      setToken(dummyToken);
      setUser(match);
      return true;
    }

    try {
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
      setIsMocked(false);
      localStorage.setItem('isMocked', 'false');

      const decoded = parseJwt(access_token);
      if (decoded && decoded.sub) {
        const userResponse = await axiosClient.get(`/users/${decoded.sub}`);
        setUser(userResponse.data);
      }
      return true;
    } catch (err: any) {
      if (err.message.includes('Network connection') || err.message.includes('Cannot establish connection')) {
        console.warn('FastAPI server offline. Preserving session in Browser sandbox.');
        setIsMocked(true);
        localStorage.setItem('isMocked', 'true');

        const dbUsers = JSON.parse(localStorage.getItem('nowUsers') || '[]');
        let match = dbUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (!match) {
          match = { id: 1, email, is_active: true, created_at: new Date().toISOString() };
          dbUsers.push(match);
          localStorage.setItem('nowUsers', JSON.stringify(dbUsers));
        }

        const payloadObj = { sub: match.id.toString(), email: match.email, exp: Date.now() + 3600 * 1000 };
        const dummyToken = `header.${btoa(JSON.stringify(payloadObj))}.signature`;

        localStorage.setItem('token', dummyToken);
        localStorage.setItem('nowUser', JSON.stringify(match));
        setToken(dummyToken);
        setUser(match);
        return true;
      }
      setError(err.message || 'Login failed.');
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    setError(null);
    if (isMocked) {
      const dbUsers = JSON.parse(localStorage.getItem('nowUsers') || '[]');
      const match = dbUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        throw new Error('This email address is already registered.');
      }

      const newU: User = {
        id: dbUsers.length + 1,
        email,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      dbUsers.push(newU);
      localStorage.setItem('nowUsers', JSON.stringify(dbUsers));

      return await login(email, password);
    }

    try {
      await axiosClient.post('/auth/register', { email, password });
      return await login(email, password);
    } catch (err: any) {
      if (err.message.includes('Network connection') || err.message.includes('Cannot establish connection')) {
        setIsMocked(true);
        localStorage.setItem('isMocked', 'true');
        
        const dbUsers = JSON.parse(localStorage.getItem('nowUsers') || '[]');
        const match = dbUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (match) {
          throw new Error('This email address is already registered in browser database.');
        }

        const newU: User = {
          id: dbUsers.length + 1,
          email,
          is_active: true,
          created_at: new Date().toISOString(),
        };

        dbUsers.push(newU);
        localStorage.setItem('nowUsers', JSON.stringify(dbUsers));
        return await login(email, password);
      }
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nowUser');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const setMockModeHandler = (val: boolean) => {
    setIsMocked(val);
    localStorage.setItem('isMocked', val.toString());
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      isMocked,
      login,
      register,
      logout,
      clearError: () => setError(null),
      setMockMode: setMockModeHandler
    }}>
      {children}
    </AuthContext.Provider>
  );
};
