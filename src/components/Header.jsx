import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { LOGO_URL as logo } from '../config/assets';

const { FiMenu, FiX, FiLogOut, FiUser, FiSettings, FiChevronDown, FiEdit, FiGrid, FiBook } = FiIcons;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin, isAuthor } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About' },
      { path: '/products', label: 'Picks' },
      { path: '/blogs', label: 'Blogs', icon: FiBook },
      { path: '/forums', label: 'Community' },
      { path: '/contact', label: 'Contact' }
    ];
    
    // Admin/Author management links
    if (isAuthor()) {
      baseItems.push({ path: '/admin', label: 'My Stories', icon: FiGrid });
      baseItems.push({ path: '/create', label: 'New Post', icon: FiEdit });
    }
    
    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-gradient-to-tr from-purple-500 to-purple-700';
      case 'author':
        return 'bg-gradient-to-tr from-purple-400 to-purple-600';
      case 'subscriber':
        return 'bg-gradient-to-tr from-purple-300 to-purple-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    logout();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100/50'
          : 'bg-white/50 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src={logo} 
              alt="BangtanMom Logo" 
              className="w-10 h-10 rounded-xl shadow-lg shadow-purple-200 group-hover:shadow-purple-300 transition-all duration-300 transform group-hover:-rotate-6 object-cover" 
            />
            <span className="text-2xl font-serif font-bold text-purple-900 tracking-tight group-hover:text-purple-600 transition-colors">
              Bangtan<span className="text-purple-500">Mom</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
                    isActive(path)
                      ? 'text-purple-800 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
                  }`}
                >
                  {Icon && <SafeIcon icon={Icon} className="mr-2 text-sm" />}
                  {label}
                  {isActive(path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-full rounded-full bg-purple-100 -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center pl-6 border-l border-purple-100">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 px-2 py-1 rounded-full hover:bg-purple-50 transition-colors outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${getRoleColor()}`}>
                      {getUserInitials()}
                    </div>
                    <div className="hidden lg:block text-left">
                      <span className="block text-sm font-semibold text-gray-800 leading-none">{user?.name?.split(' ')[0]}</span>
                      <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">{user?.role}</span>
                    </div>
                    <SafeIcon icon={FiChevronDown} className={`text-gray-400 text-sm transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-purple-100 ring-opacity-50 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-purple-50 bg-purple-50/30">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          {isAdmin() && (
                            <Link 
                              to="/admin" 
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors"
                            >
                              <SafeIcon icon={FiSettings} className="mr-3 text-lg opacity-70" />
                              Dashboard
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
                          >
                            <SafeIcon icon={FiLogOut} className="mr-3 text-lg opacity-70" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-full text-sm font-semibold bg-purple-900 text-white hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all duration-300"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="text-2xl" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-purple-100 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-purple-50 text-purple-800'
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  {Icon && <SafeIcon icon={Icon} className="mr-3" />}
                  {label}
                </Link>
              ))}
              <div className="h-px bg-purple-100 my-4"></div>
              {isAuthenticated ? (
                <>
                  <div className="flex items-center px-4 py-3 mb-2 bg-purple-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${getRoleColor()}`}>
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-purple-50"
                    >
                      <SafeIcon icon={FiSettings} className="mr-3" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <SafeIcon icon={FiLogOut} className="mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 px-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl border border-purple-200 text-base font-semibold text-gray-700 hover:bg-purple-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-purple-600 text-white text-base font-semibold shadow-lg shadow-purple-200"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </header>
  );
};

export default Header;