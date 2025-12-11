import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error loading auth state:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { token: newToken, user: newUser } = response;
      
      setToken(newToken);
      setUser(newUser);
      
      // Store in localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

