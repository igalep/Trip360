import React, { createContext, useState, useEffect } from 'react';
import { hashPassword } from '../utils/crypto';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, rawPassword: string) => Promise<void>;
  register: (email: string, rawPassword: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('budgetcontrol_session_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.status === 'success' && json.data?.user) {
        setUser(json.data.user);
      } else {
        localStorage.removeItem('budgetcontrol_session_token');
        setUser(null);
      }
    } catch (error) {
      logger.error('Failed to fetch user session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleUnauthorized = () => {
      logger.info('Unauthorized event received, clearing session');
      localStorage.removeItem('budgetcontrol_session_token');
      setUser(null);
    };

    window.addEventListener('budgetcontrol-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('budgetcontrol-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, rawPassword: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(rawPassword, trimmedEmail);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmedEmail, password: hashedPassword }),
    });

    const json = await response.json();
    if (json.status === 'success' && json.data?.token) {
      localStorage.setItem('budgetcontrol_session_token', json.data.token);
      setUser(json.data.user);
    } else {
      throw new Error(json.message || 'Invalid email or password.');
    }
  };

  const register = async (email: string, rawPassword: string, name: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(rawPassword, trimmedEmail);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmedEmail, password: hashedPassword, name: name.trim() }),
    });

    const json = await response.json();
    if (json.status === 'success' && json.data?.token) {
      localStorage.setItem('budgetcontrol_session_token', json.data.token);
      setUser(json.data.user);
    } else {
      throw new Error(json.message || 'Registration failed.');
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('budgetcontrol_session_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (error) {
        logger.error('Logout error:', error);
      }
    }
    localStorage.removeItem('budgetcontrol_session_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from '../hooks/useAuth';
