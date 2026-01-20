import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiLoader } = FiIcons;

const ProtectedRoute = ({ children, requiredRole = 'subscriber', adminOnly = false }) => {
  const { isAuthenticated, user, hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiLoader} className="text-purple-500 text-5xl mb-4 mx-auto animate-spin" />
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated:
  // Redirect to /admin-login if it's an admin route, else to /login
  if (!isAuthenticated) {
    const loginPath = adminOnly ? '/admin-login' : '/login';
    return <Navigate to={loginPath} replace />;
  }

  // If authenticated but lacks role
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (!hasPermission(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;