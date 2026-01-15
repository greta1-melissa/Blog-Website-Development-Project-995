import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import BlogPostManagement from '../components/BlogPostManagement';
import KdramaManagement from '../components/KdramaManagement';
import ProductManagement from '../components/ProductManagement';
import UserManagement from './UserManagement';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiShield, FiLogOut, FiTv, FiBookOpen, FiUsers, FiBarChart2, FiArrowLeft, FiShoppingBag } = FiIcons;

const Admin = () => {
  const { isAdmin, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  if (!isAdmin()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <SafeIcon icon={FiShield} className="text-red-500 text-6xl mb-6 mx-auto animate-pulse" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Restricted Access</h1>
        <p className="text-gray-600 mb-8">You do not have the necessary permissions to view the administrative control panel.</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold shadow-lg shadow-purple-200">
          <SafeIcon icon={FiArrowLeft} className="mr-2" /> Return to Safety
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'posts', label: 'Blog Posts', icon: FiBookOpen },
    { id: 'products', label: 'Products', icon: FiShoppingBag },
    { id: 'kdramas', label: 'K-Dramas', icon: FiTv },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'overview', label: 'Overview', icon: FiBarChart2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <SafeIcon icon={FiShield} className="text-purple-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Control Center</h1>
                <p className="text-sm text-gray-500 font-medium flex items-center">
                  Signed in as <span className="text-purple-600 ml-1 font-bold">{user?.name || 'Admin'}</span>
                </p>
              </div>
            </div>
            <button onClick={logout} className="inline-flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-sm font-bold">
              <SafeIcon icon={FiLogOut} className="mr-2" /> Sign Out
            </button>
          </div>
          {/* Tab Navigation */}
          <div className="mt-8 overflow-x-auto no-scrollbar">
            <nav className="flex space-x-1 p-1 bg-gray-100 rounded-xl w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                >
                  <SafeIcon icon={tab.icon} className={`mr-2 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'posts' && <BlogPostManagement />}
            {activeTab === 'products' && <ProductManagement />}
            {activeTab === 'kdramas' && <KdramaManagement />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-400">Content Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Stories</span>
                      <span className="text-2xl font-black text-purple-600">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">K-Dramas</span>
                      <span className="text-2xl font-black text-indigo-600">9</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;