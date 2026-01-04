import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import { useKdrama } from '../contexts/KdramaContext';
import UserManagement from './UserManagement';
import EditPostModal from '../components/EditPostModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { formatDate } from '../utils/dateUtils';
import { BLOG_PLACEHOLDER } from '../config/assets';

const { FiShield, FiLogOut, FiPlus, FiSearch, FiStar, FiEye, FiEdit, FiTrash2 } = FiIcons;

const Admin = () => {
  const { posts = [], categories = [], deletePost, updatePost, isLoading } = useBlog();
  const { kdramas = [] } = useKdrama();
  const { isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const adminPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchTerm === '' || (post.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === '' || post.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, filterCategory]);

  const handleToggleFeatured = async (post) => {
    try {
      await updatePost(post.id, { isHandPicked: !post.isHandPicked });
    } catch (error) {
      console.error('Failed to update featured status:', error);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <SafeIcon icon={FiShield} className="text-red-500 text-6xl mb-4 mx-auto" />
        <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
        <Link to="/" className="text-purple-600 hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiShield} className="text-purple-600 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Managing {posts.length} total stories</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link to="/create" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium">
            <SafeIcon icon={FiPlus} className="mr-2" /> New Post
          </Link>
          <button onClick={logout} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
            <SafeIcon icon={FiLogOut} className="mr-2" /> Sign Out
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {['posts', 'kdramas', 'users', 'overview'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'posts' ? 'All Stories' : tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'posts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search all stories..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white font-medium"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Post</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && posts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mb-4" />
                        Loading stories...
                      </div>
                    </td>
                  </tr>
                ) : adminPosts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No stories found.</td>
                  </tr>
                ) : (
                  adminPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded overflow-hidden mr-3 bg-gray-100 flex-shrink-0">
                            <SafeImage 
                              src={post.image || post.image_url} 
                              alt="" 
                              fallback={BLOG_PLACEHOLDER}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">{post.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{post.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => handleToggleFeatured(post)}
                          className={`text-xl transition-colors ${post.isHandPicked ? 'text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}
                          title={post.isHandPicked ? "Featured" : "Not Featured"}
                        >
                          <SafeIcon icon={FiStar} className={post.isHandPicked ? 'fill-current' : ''} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(post.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link to={`/post/${post.id}`} className="text-indigo-600 hover:text-indigo-900"><SafeIcon icon={FiEye} /></Link>
                          <button onClick={() => { setEditingPost(post); setIsEditModalOpen(true); }} className="text-purple-600 hover:text-purple-900"><SafeIcon icon={FiEdit} /></button>
                          <button onClick={() => { if (window.confirm('Delete post?')) deletePost(post.id); }} className="text-red-500 hover:text-red-700">
                            <SafeIcon icon={FiTrash2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && <UserManagement />}
      
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Total Stories</h3>
            <p className="text-4xl font-bold text-purple-600">{posts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Featured Stories</h3>
            <p className="text-4xl font-bold text-yellow-500">{posts.filter(p => p.isHandPicked).length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Total K-Dramas</h3>
            <p className="text-4xl font-bold text-indigo-600">{kdramas.length}</p>
          </div>
        </div>
      )}

      <EditPostModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        post={editingPost} 
        onSave={(id, data) => updatePost(id, data)}
        categories={['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Product Recommendations', 'Career']}
      />
    </div>
  );
};

export default Admin;