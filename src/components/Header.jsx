import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiMenu, FiX, FiHeart, FiHome, FiEdit, FiUser, FiMail, FiLogOut, FiSettings, FiMessageCircle, FiShield } = FiIcons;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin, isAuthor } = useAuth();
  const navigate = useNavigate();

  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Home', icon: FiHome },
      { path: '/about', label: 'About Me', icon: FiUser },
      { path: '/forums', label: 'Forums', icon: FiMessageCircle },
      { path: '/contact', label: 'Contact', icon: FiMail }
    ];

    if (isAuthor()) {
      baseItems.splice(3, 0, { path: '/create', label: 'Write', icon: FiEdit });
    }

    if (isAdmin()) {
      baseItems.push({ path: '/admin', label: 'Admin', icon: FiSettings });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path) => location.pathname === path;

  // REMOVED the useEffect that was redirecting to login page

  const getRoleDisplay = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin':
        return 'Admin';
      case 'author':
        return 'Author';
      case 'subscriber':
        return 'Subscriber';
      default:
        return '';
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiHeart} className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-gray-900">Bangtan Mom</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {isAuthenticated ? (
              <>
                {navItems.map(({ path, label, icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(path)
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <SafeIcon icon={icon} className="text-sm" />
                    <span>{label}</span>
                  </Link>
                ))}
                
                {/* User Info & Logout */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md">
                    <SafeIcon icon={user?.role === 'admin' ? FiShield : FiUser} className="text-sm text-gray-600" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {getRoleDisplay()}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <SafeIcon icon={FiLogOut} className="text-sm" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <SafeIcon icon={FiUser} className="text-sm" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/admin-login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  <SafeIcon icon={FiShield} className="text-sm" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50"
          >
            <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="text-xl" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <nav className="px-4 py-2 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md mb-2">
                  <SafeIcon icon={user?.role === 'admin' ? FiShield : FiUser} className="text-sm text-gray-600" />
                  <span className="text-sm text-gray-700">{user?.name}</span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {getRoleDisplay()}
                  </span>
                </div>
                
                {navItems.map(({ path, label, icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(path)
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <SafeIcon icon={icon} className="text-sm" />
                    <span>{label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="text-sm" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <SafeIcon icon={FiUser} className="text-sm" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/admin-login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  <SafeIcon icon={FiShield} className="text-sm" />
                  <span>Admin Login</span>
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;