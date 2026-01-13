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

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'bangtanmom',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
  role: 'admin',
  email: import.meta.env.VITE_ADMIN_EMAIL || 'bangtanmom@bangtanmom.com'
};

// --- MOCK USERS FOR TESTING ---
const MOCK_ACCOUNTS = [
  {
    email: 'author@test.com',
    name: 'Chloe Park',
    role: 'author',
    id: 'mock-author-123'
  },
  {
    email: 'subscriber@test.com',
    name: 'Min-ji Kim',
    role: 'subscriber',
    id: 'mock-subscriber-456'
  }
];

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
    
    // Check if this is one of our predefined mock accounts
    const mockMatch = MOCK_ACCOUNTS.find(m => m.email === email);
    let role = mockMatch ? mockMatch.role : 'subscriber';
    
    if (email === ADMIN_CREDENTIALS.email) {
      role = 'admin';
    }

    const name = mockMatch ? mockMatch.name : (email?.split('@')[0] || 'User');

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

  // Helper for instant mock login (bypassing SDK for dev convenience)
  const bypassLogin = (mockEmail) => {
    const mockMatch = MOCK_ACCOUNTS.find(m => m.email === mockEmail) || {
      email: ADMIN_CREDENTIALS.email,
      name: 'BangtanMom',
      role: 'admin',
      id: 'admin-bypass'
    };

    login({
      userId: mockMatch.id,
      token: 'mock-token-' + Date.now(),
      newUser: false,
      email: mockMatch.email
    });
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

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    const roleHierarchy = { 'subscriber': 1, 'author': 2, 'admin': 3 };
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  };

  const isAdmin = () => user?.role === 'admin';
  const isAuthor = () => user?.role === 'author' || user?.role === 'admin';
  const isSubscriber = () => !!user;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      isLoading,
      login,
      adminLogin,
      bypassLogin, // Exported for the login helper
      logout,
      hasPermission,
      isAdmin,
      isAuthor,
      isSubscriber,
      mockAccounts: MOCK_ACCOUNTS
    }}>
      {children}
    </AuthContext.Provider>
  );
};