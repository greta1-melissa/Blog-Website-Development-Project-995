import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ncbCreate } from '../services/nocodebackendClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin credentials - Updated to bangtanmon as requested
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'bangtanmon',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
  role: 'admin',
  email: import.meta.env.VITE_ADMIN_EMAIL || 'bangtanmom@bangtanmom.com'
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');

      if (userId && token && userRole && userEmail) {
        setIsAuthenticated(true);
        setUser({
          id: userId,
          role: userRole,
          email: userEmail,
          name: userName || userEmail?.split('@')[0] || 'User'
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (userData) => {
    const { userId, token, newUser, email } = userData;
    
    let role = 'subscriber';
    if (email === ADMIN_CREDENTIALS.email) {
      role = 'admin';
    }

    const name = email?.split('@')[0] || 'User';

    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);

    setIsAuthenticated(true);
    setUser({ id: userId, role: role, email: email, name: name });

    if (newUser) {
      try {
        const userPayload = {
          name,
          email,
          username: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          role,
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().split('T')[0],
          userId
        };
        await ncbCreate('users', userPayload);
        navigate('/onboarding');
      } catch (err) {
        console.error("Auth: Error during user sync", err);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const bypassLogin = (email) => {
    if (email === ADMIN_CREDENTIALS.email) {
      login({
        userId: 'admin-bypass',
        token: 'admin-token-' + Date.now(),
        newUser: false,
        email: ADMIN_CREDENTIALS.email
      });
    }
  };

  const adminLogin = (credentials) => {
    const { username, password } = credentials;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      bypassLogin(ADMIN_CREDENTIALS.email);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const isAdmin = () => user?.role === 'admin';
  const isAuthor = () => user?.role === 'author' || user?.role === 'admin';
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      isLoading,
      login,
      adminLogin,
      bypassLogin,
      logout,
      isAdmin,
      isAuthor
    }}>
      {children}
    </AuthContext.Provider>
  );
};