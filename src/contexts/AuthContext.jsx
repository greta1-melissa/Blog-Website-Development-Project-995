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

// Admin credentials from environment variables
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
  role: 'admin',
  email: 'admin@bangtanmom.com' // Fallback email for consistency
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

      if (userId && token && userRole) {
        setIsAuthenticated(true);
        setUser({
          id: userId,
          role: userRole,
          email: userEmail || '',
          name: userName || 'User'
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Standard login for subscribers (Quest SDK)
  const login = async (userData) => {
    const { userId, token, email } = userData;
    const name = email?.split('@')[0] || 'User';
    const role = 'subscriber';

    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);

    setIsAuthenticated(true);
    setUser({ id: userId, role: role, email: email, name: name });
    navigate('/');
  };

  // Pure Username + Password Login for Admin
  const adminLogin = (credentials) => {
    const { username, password } = credentials;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const adminSession = {
        userId: 'admin-id',
        token: 'admin-token-' + Date.now(),
        role: 'admin',
        email: ADMIN_CREDENTIALS.email,
        name: 'Administrator'
      };

      localStorage.setItem('userId', adminSession.userId);
      localStorage.setItem('token', adminSession.token);
      localStorage.setItem('userRole', adminSession.role);
      localStorage.setItem('userEmail', adminSession.email);
      localStorage.setItem('userName', adminSession.name);

      setIsAuthenticated(true);
      setUser({ 
        id: adminSession.userId, 
        role: adminSession.role, 
        email: adminSession.email, 
        name: adminSession.name 
      });
      
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    const roleHierarchy = { 'subscriber': 1, 'author': 2, 'admin': 3 };
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
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
      logout,
      hasPermission,
      isAdmin,
      isAuthor
    }}>
      {children}
    </AuthContext.Provider>
  );
};