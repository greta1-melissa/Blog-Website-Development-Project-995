import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from './UserManagement';
import EditPostModal from '../components/EditPostModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

// Use FiBarChart2 as it is the standard Feather icon name
const { FiBarChart2, FiUsers, FiFileText, FiTrendingUp, FiEdit, FiTrash2, FiEye, FiCalendar, FiClock, FiTag, FiPlus, FiSearch, FiFilter, FiShield, FiLogOut, FiActivity, FiServer, FiStar } = FiIcons;

// Component to display when access is denied
const AccessDenied = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
    <div className="bg-red-50 rounded-xl p-8">
      <SafeIcon icon={FiShield} className="text-red-500 text-6xl mb-4 mx-auto" />
      <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
      <p className="text-red-700 mb-6">
        This area is restricted to administrators only.
      </p>
      <div className="space-x-4">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          to="/admin-login"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Admin Login
        </Link>
      </div>
    </div>
  </div>
);

const Admin = () => {
  const { posts = [], categories = [], deletePost, updatePost } = useBlog();
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // State for Edit Modal
  const [editingPost, setEditingPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Calculate stats - moved outside of conditional rendering
  const stats = useMemo(() => {
    // Ensure posts is an array to prevent crashes
    const safePosts = Array.isArray(posts) ? posts : [];
    const totalPosts = safePosts.length;
    const totalCategories = Array.isArray(categories) ? categories.length : 0;
    const avgWordsPerPost = totalPosts > 0
      ? Math.round(
          safePosts.reduce((sum, post) => sum + (post.content ? post.content.split(' ').length : 0), 0) / totalPosts
        )
      : 0;

    const categoryStats = (Array.isArray(categories) ? categories : []).map(cat => ({
      name: cat,
      count: safePosts.filter(post => post.category === cat).length,
      percentage: totalPosts > 0
        ? Math.round((safePosts.filter(post => post.category === cat).length / totalPosts) * 100)
        : 0
    }));

    const recentPosts = safePosts.slice(0, 5);

    return { totalPosts, totalCategories, avgWordsPerPost, categoryStats, recentPosts };
  }, [posts, categories]);

  // Filter posts for management - moved outside of conditional rendering
  const filteredPosts = useMemo(() => {
    const safePosts = Array.isArray(posts) ? posts : [];
    return safePosts.filter(post => {
      const postTitle = post.title || '';
      const postContent = post.content || '';
      const matchesSearch = searchTerm === '' || 
        postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        postContent.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === '' || post.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, filterCategory]);

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
    const newValue = !post.isHandPicked;
    // We don't block if more than 3, we just rely on Home.jsx to pick the top 3
    await updatePost(post.id, { isHandPicked: newValue });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'posts', label: 'Manage Posts', icon: FiFileText },
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiTrendingUp },
  ];

  // Check admin access and return early if not admin
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
            Welcome back, <strong>{user?.name}</strong>! Complete control over your Bangtan Mom blog
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link
            to="/debug/ncb"
            className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 font-medium"
          >
            <SafeIcon icon={FiActivity} className="mr-2" />
            System Status
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm font-medium"
          >
            <SafeIcon icon={FiLogOut} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiTag} className="text-2xl text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                  <p className="text-gray-600 text-sm">Categories</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                {/* Changed from Green to Fuchsia */}
                <div className="w-12 h-12 bg-fuchsia-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiUsers} className="text-2xl text-fuchsia-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-gray-600 text-sm">Readers</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiBarChart2} className="text-2xl text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.avgWordsPerPost}</p>
                  <p className="text-gray-600 text-sm">Avg Words</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
              <div className="space-y-4">
                {stats.categoryStats.length > 0 ? (
                  stats.categoryStats.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{cat.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-8 text-right">{cat.count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No category data available.</p>
                )}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                <Link
                  to="/create"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  <SafeIcon icon={FiPlus} className="mr-1" />
                  New Post
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentPosts.length > 0 ? (
                  stats.recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <img
                        src={post.image || 'https://via.placeholder.com/150'}
                        alt={post.title}
                        className="w-12 h-12 rounded-lg object-cover shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full whitespace-nowrap">
                        {post.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No posts yet.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Posts Management Tab */}
      {activeTab === 'posts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Search and Filter */}
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
              <Link
                to="/create"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
              >
                <SafeIcon icon={FiPlus} className="mr-2" />
                New Post
              </Link>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Post Detail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={post.image || 'https://via.placeholder.com/150'}
                            alt={post.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3 shadow-sm"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                              {post.title}
                            </div>
                            <div className="text-xs text-gray-500">by {post.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleFeatured(post)}
                          className={`focus:outline-none transition-transform active:scale-95 ${post.isHandPicked ? 'text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}
                          title={post.isHandPicked ? "Remove from Featured" : "Add to Featured"}
                        >
                          <SafeIcon 
                            icon={FiStar} 
                            className={`text-lg ${post.isHandPicked ? 'fill-current' : ''}`} 
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {post.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link to={`/post/${post.id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="View">
                            <SafeIcon icon={FiEye} className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleEditClick(post)} 
                            className="text-fuchsia-600 hover:text-fuchsia-900 transition-colors" 
                            title="Edit"
                          >
                            <SafeIcon icon={FiEdit} className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)} 
                            className="text-red-500 hover:text-red-700 transition-colors" 
                            title="Delete"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
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

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UserManagement />
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Popular Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Popular Categories</h3>
              <div className="space-y-5">
                {stats.categoryStats.length > 0 ? (
                  stats.categoryStats.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium min-w-[120px]">{cat.name}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-10 text-right">{cat.percentage}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
            </div>

            {/* Content Insights */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Content Insights</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Words Written</span>
                  <span className="text-lg font-bold text-gray-900">
                    {posts.reduce((sum, post) => sum + (post.content ? post.content.split(' ').length : 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Average Post Length</span>
                  <span className="text-lg font-bold text-gray-900">
                    {stats.avgWordsPerPost} words
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Longest Post</span>
                  <span className="text-lg font-bold text-gray-900">
                    {posts.length > 0 ? Math.max(...posts.map(post => post.content ? post.content.split(' ').length : 0)) : 0} words
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Publishing Frequency</span>
                  <span className="text-lg font-bold text-gray-900">
                    {posts.length > 0 ? Math.round(posts.length / 12) : 0} posts/month
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {posts.slice(0, 10).map((post) => (
                <div key={post.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <SafeIcon icon={FiFileText} className="text-purple-600 text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 leading-snug">
                      Published <strong>{post.title}</strong> in <span className="text-purple-600">{post.category}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit Modal */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={editingPost}
        onSave={handleSavePost}
        categories={['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Product Recommendations']}
      />
    </div>
  );
};

export default Admin;