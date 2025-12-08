import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import { useKdrama } from '../contexts/KdramaContext';
import UserManagement from './UserManagement';
import EditPostModal from '../components/EditPostModal';
import EditKdramaModal from '../components/EditKdramaModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { formatDate } from '../utils/dateUtils';

const { FiBarChart2, FiUsers, FiFileText, FiTv, FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiShield, FiLogOut, FiActivity, FiStar } = FiIcons;

const AccessDenied = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
    <div className="bg-red-50 rounded-xl p-8">
      <SafeIcon icon={FiShield} className="text-red-500 text-6xl mb-4 mx-auto" />
      <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
      <p className="text-red-700 mb-6">
        This area is restricted to administrators only.
      </p>
      <div className="space-x-4">
        <Link to="/" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Go Home
        </Link>
        <Link to="/admin-login" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Admin Login
        </Link>
      </div>
    </div>
  </div>
);

const Admin = () => {
  const { posts = [], categories = [], deletePost, updatePost } = useBlog();
  const { kdramas = [], addKdrama, updateKdrama, deleteKdrama } = useKdrama();
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Blog Post State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // K-Drama State
  const [kdramaSearch, setKdramaSearch] = useState('');
  const [editingKdrama, setEditingKdrama] = useState(null);
  const [isKdramaModalOpen, setIsKdramaModalOpen] = useState(false);

  const stats = useMemo(() => {
    const safePosts = Array.isArray(posts) ? posts : [];
    const totalPosts = safePosts.length;
    return {
      totalPosts,
      totalKdramas: kdramas.length,
      totalUsers: 0 
    };
  }, [posts, kdramas]);

  const filteredPosts = useMemo(() => {
    const safePosts = Array.isArray(posts) ? posts : [];
    return safePosts.filter(post => {
      const postTitle = post.title || '';
      const matchesSearch = searchTerm === '' || postTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === '' || post.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, filterCategory]);

  const filteredKdramas = useMemo(() => {
    return kdramas.filter(drama => 
      drama.title.toLowerCase().includes(kdramaSearch.toLowerCase()) || 
      (drama.tags && drama.tags.some(t => t.toLowerCase().includes(kdramaSearch.toLowerCase())))
    );
  }, [kdramas, kdramaSearch]);

  // Handlers for Blog Posts
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(postId);
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleSavePost = async (id, updatedData) => {
    await updatePost(id, updatedData);
  };

  const handleToggleFeatured = async (post) => {
    await updatePost(post.id, { isHandPicked: !post.isHandPicked });
  };

  // Handlers for K-Dramas
  const handleDeleteKdrama = async (id) => {
    if (window.confirm('Delete this K-Drama recommendation?')) {
      await deleteKdrama(id);
    }
  };

  const handleEditKdrama = (drama) => {
    setEditingKdrama(drama);
    setIsKdramaModalOpen(true);
  };

  const handleAddKdrama = () => {
    setEditingKdrama(null);
    setIsKdramaModalOpen(true);
  };

  const handleSaveKdrama = async (id, data) => {
    if (id) {
      await updateKdrama(id, data);
    } else {
      await addKdrama(data);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'posts', label: 'Manage Posts', icon: FiFileText },
    { id: 'kdramas', label: 'K-Dramas', icon: FiTv },
    { id: 'users', label: 'User Management', icon: FiUsers },
  ];

  if (!isAdmin()) {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiShield} className="text-purple-600 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Welcome back, <strong>{user?.name}</strong>!
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link to="/debug/ncb" className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 font-medium">
            <SafeIcon icon={FiActivity} className="mr-2" /> System Status
          </Link>
          <button onClick={logout} className="inline-flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm font-medium">
            <SafeIcon icon={FiLogOut} className="mr-2" /> Sign Out
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="text-lg" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiFileText} className="text-2xl text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                  <p className="text-gray-600 text-sm">Total Posts</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiTv} className="text-2xl text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalKdramas}</p>
                  <p className="text-gray-600 text-sm">K-Dramas</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'posts' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <Link to="/create" className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium">
                <SafeIcon icon={FiPlus} className="mr-2" /> New Post
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Post Detail</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={post.image || 'https://via.placeholder.com/150'} alt={post.title} className="w-10 h-10 rounded-lg object-cover mr-3 shadow-sm" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">{post.title}</div>
                            <div className="text-xs text-gray-500">by {post.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200">{post.category}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button onClick={() => handleToggleFeatured(post)} className={`focus:outline-none transition-transform active:scale-95 ${post.isHandPicked ? 'text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}>
                          <SafeIcon icon={FiStar} className={`text-lg ${post.isHandPicked ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(post.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link to={`/post/${post.id}`} className="text-indigo-600 hover:text-indigo-900"><SafeIcon icon={FiEye} className="w-4 h-4" /></Link>
                          <button onClick={() => handleEditClick(post)} className="text-fuchsia-600 hover:text-fuchsia-900"><SafeIcon icon={FiEdit} className="w-4 h-4" /></button>
                          <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-red-700"><SafeIcon icon={FiTrash2} className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* NEW K-Drama Tab */}
      {activeTab === 'kdramas' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search dramas..."
                    value={kdramaSearch}
                    onChange={(e) => setKdramaSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleAddKdrama}
                className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium whitespace-nowrap"
              >
                <SafeIcon icon={FiPlus} className="mr-2" /> Add K-Drama
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Drama</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredKdramas.map((drama) => (
                    <tr key={drama.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={drama.image_url || 'https://via.placeholder.com/150'} alt={drama.title} className="w-10 h-10 rounded-lg object-cover mr-3 shadow-sm bg-gray-100" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">{drama.title}</div>
                            <div className="text-xs text-gray-500 font-mono">{drama.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {drama.tags && drama.tags.length > 0 ? drama.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md">{tag}</span>
                          )) : <span className="text-gray-400 text-xs">-</span>}
                          {drama.tags && drama.tags.length > 2 && <span className="text-xs text-gray-400">+{drama.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {drama.display_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link to={`/kdrama-recommendations/${drama.slug || drama.id}`} className="text-indigo-600 hover:text-indigo-900"><SafeIcon icon={FiEye} className="w-4 h-4" /></Link>
                          <button onClick={() => handleEditKdrama(drama)} className="text-fuchsia-600 hover:text-fuchsia-900"><SafeIcon icon={FiEdit} className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteKdrama(drama.id)} className="text-red-500 hover:text-red-700"><SafeIcon icon={FiTrash2} className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && <UserManagement />}

      {/* Modals */}
      <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} post={editingPost} onSave={handleSavePost} categories={['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Product Recommendations']} />
      <EditKdramaModal isOpen={isKdramaModalOpen} onClose={() => setIsKdramaModalOpen(false)} drama={editingKdrama} onSave={handleSaveKdrama} />
    </div>
  );
};

export default Admin;