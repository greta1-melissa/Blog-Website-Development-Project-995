import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiMenu, FiX, FiHeart, FiLogOut, FiUser, FiSettings, FiChevronDown } = FiIcons;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin, isAuthor } = useAuth();
  const navigate = useNavigate();

  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About Me' },
      { path: '/forums', label: 'Forums' },
      { path: '/contact', label: 'Contact' }
    ];

    if (isAuthor()) {
      baseItems.splice(3, 0, { path: '/create', label: 'Write' });
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'author': return 'bg-gradient-to-r from-blue-500 to-purple-500';
      case 'subscriber': return 'bg-gradient-to-r from-green-500 to-teal-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <header className="bg-purple-500 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <SafeIcon icon={FiHeart} className="text-purple-500 text-lg" />
            </div>
            <span className="text-xl font-bold text-white">Bangtan Mom</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <nav className="flex space-x-6">
              {isAuthenticated ? (
                <>
                  {navItems.map(({ path, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(path)
                          ? 'text-white bg-purple-600'
                          : 'text-purple-100 hover:text-white hover:bg-purple-600'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-purple-100 hover:text-white hover:bg-purple-600 transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>

            {/* User Menu or Auth Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getRoleColor()}`}>
                      {getUserInitials()}
                    </div>
                    <span className="text-white text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                    <SafeIcon icon={FiChevronDown} className="text-purple-200 text-sm" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                      
                      {isAdmin() && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <SafeIcon icon={FiSettings} className="mr-2" />
                          Dashboard
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <SafeIcon icon={FiLogOut} className="mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-purple-100 hover:text-white hover:bg-purple-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/admin-login"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    Admin
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-purple-100 hover:text-white hover:bg-purple-600"
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
          className="md:hidden bg-purple-500 border-t border-purple-400"
        >
          <nav className="px-4 py-2 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User Info at Top */}
                <div className="flex items-center space-x-3 px-3 py-3 bg-purple-600 rounded-lg mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getRoleColor()}`}>
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user?.name}</p>
                    <p className="text-purple-200 text-xs capitalize">{user?.role}</p>
                  </div>
                </div>

                {navItems.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(path)
                        ? 'text-white bg-purple-600'
                        : 'text-purple-100 hover:text-white hover:bg-purple-600'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                {isAdmin() && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-purple-100 hover:text-white hover:bg-purple-600 transition-colors"
                  >
                    <SafeIcon icon={FiSettings} className="mr-2" />
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-purple-100 hover:text-white hover:bg-purple-600 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-purple-100 hover:text-white hover:bg-purple-600 transition-colors"
                >
                  <SafeIcon icon={FiUser} className="mr-2" />
                  Sign In
                </Link>
                <Link
                  to="/admin-login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  <SafeIcon icon={FiSettings} className="mr-2" />
                  Admin Access
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;