import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { useAuth } from '../contexts/AuthContext';
import { LOGO_URL as logo } from '../config/assets';

const { FiMenu, FiX, FiLogOut, FiChevronDown, FiEdit, FiGrid, FiSettings } = FiIcons;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin, isAuthor } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/products', label: 'Picks' },
    { path: '/forums', label: 'Community' },
    { path: '/contact', label: 'Contact' }
  ];

  if (isAuthor && isAuthor()) {
    navItems.push({ path: '/admin', label: 'My Stories', icon: FiGrid });
    navItems.push({ path: '/create', label: 'New Post', icon: FiEdit });
  }

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100/50' : 'bg-white/50 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <SafeImage src={logo} alt="Logo" className="w-12 h-12 rounded-xl shadow-lg transform group-hover:-rotate-6 transition-all object-cover" />
          <span className="text-3xl font-serif font-bold text-purple-900">Bangtan<span className="text-purple-500">Mom</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map(({ path, label }) => (
            <Link key={path} to={path} className={`text-base font-semibold transition-colors ${location.pathname === path ? 'text-purple-800' : 'text-gray-700 hover:text-purple-600'}`}>
              {label}
            </Link>
          ))}
          <div className="pl-6 border-l border-purple-100">
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">{getUserInitials()}</div>
                  <SafeIcon icon={FiChevronDown} className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl py-2 z-50 border border-purple-50">
                      {isAdmin && isAdmin() && (
                        <Link to="/admin" className="block px-4 py-2 text-base text-gray-700 hover:bg-purple-50">Admin Dashboard</Link>
                      )}
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-base text-red-600 hover:bg-red-50">Sign Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2.5 bg-purple-900 text-white rounded-full text-base font-bold hover:bg-purple-700 transition-all shadow-md">Join Free</Link>
            )}
          </div>
        </nav>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
          <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="text-2xl" />
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-purple-100 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-4">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-lg font-semibold px-4 py-2 rounded-xl ${location.pathname === path ? 'bg-purple-50 text-purple-800' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center text-lg font-bold bg-purple-900 text-white py-4 rounded-2xl mt-6 shadow-lg"
                >
                  Join Free
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;