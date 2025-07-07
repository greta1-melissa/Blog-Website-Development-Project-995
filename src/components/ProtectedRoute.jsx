import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiLock, FiUser, FiShield } = FiIcons;

const ProtectedRoute = ({ children, requiredRole = 'subscriber', adminOnly = false }) => {
  const { isAuthenticated, user, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-red-50 rounded-xl p-8">
          <SafeIcon icon={FiShield} className="text-red-500 text-6xl mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
          <p className="text-red-700 mb-6">
            This area is restricted to administrators only.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!hasPermission(requiredRole)) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-yellow-50 rounded-xl p-8">
          <SafeIcon icon={FiLock} className="text-yellow-500 text-6xl mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-yellow-900 mb-4">Insufficient Permissions</h1>
          <p className="text-yellow-700 mb-6">
            You don't have the required permissions to access this page.
            <br />
            Required role: <strong>{requiredRole}</strong>
            <br />
            Your role: <strong>{user?.role}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;