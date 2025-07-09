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
  username: 'bangtanmom',
  password: 'admin123',
  role: 'admin',
  email: 'bangtanmom@bangtanmom.com'
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
    localStorage.setItem('userName', email?.split('@')[0] || 'User');

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
    const { username, password } = credentials;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const userId = 'admin-' + Date.now();
      const token = 'admin-token-' + Date.now();
      
      localStorage.setItem('userId', userId);
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userEmail', ADMIN_CREDENTIALS.email);
      localStorage.setItem('userName', 'BangtanMom');

      setIsAuthenticated(true);
      setUser({
        id: userId,
        role: 'admin',
        email: ADMIN_CREDENTIALS.email,
        name: 'BangtanMom'
      });

      navigate('/admin');
      return true;
    }
    return false;
  };

  const logout = () => {
    console.log('Logout function called');
    
    // Clear all authentication data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');

    // Reset authentication state
    setIsAuthenticated(false);
    setUser(null);

    // Navigate to login page
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
      isLoading,
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