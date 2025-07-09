import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin credentials - In production, this would be in a secure backend
const ADMIN_CREDENTIALS = {
  email: 'bangtanmom@bangtanmom.com',
  password: 'admin123',
  role: 'admin'
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    if (userId && token && userRole) {
      setIsAuthenticated(true);
      setUser({
        id: userId,
        role: userRole,
        email: userEmail,
        name: userEmail?.split('@')[0] || 'User'
      });
    }
  }, []);

  const login = (userData) => {
    const { userId, token, newUser, email } = userData;
    
    // Determine user role - default to subscriber
    let role = 'subscriber';
    if (email === ADMIN_CREDENTIALS.email) {
      role = 'admin';
    }

    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);

    setIsAuthenticated(true);
    setUser({
      id: userId,
      role: role,
      email: email,
      name: email?.split('@')[0] || 'User'
    });

    if (newUser) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
  };

  const adminLogin = (credentials) => {
    const { email, password } = credentials;
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const userId = 'admin-' + Date.now();
      const token = 'admin-token-' + Date.now();
      
      localStorage.setItem('userId', userId);
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userEmail', email);

      setIsAuthenticated(true);
      setUser({
        id: userId,
        role: 'admin',
        email: email,
        name: 'BangtanMom'
      });

      navigate('/admin');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'subscriber': 1,
      'author': 2,
      'admin': 3
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  const isAdmin = () => user?.role === 'admin';
  const isAuthor = () => user?.role === 'author' || user?.role === 'admin';
  const isSubscriber = () => user?.role === 'subscriber' || user?.role === 'author' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      adminLogin,
      logout,
      hasPermission,
      isAdmin,
      isAuthor,
      isSubscriber
    }}>
      {children}
    </AuthContext.Provider>
  );
};