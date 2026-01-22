import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import EditPostModal from './EditPostModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { BLOG_PLACEHOLDER } from '../config/assets';
import { formatDate } from '../utils/dateUtils';

const { FiPlus, FiSearch, FiStar, FiEdit3, FiTrash2, FiExternalLink, FiCheckCircle } = FiIcons;

const BlogPostManagement = () => {
  const { posts, addPost, updatePost, deletePost, isLoading, categories } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const filteredPosts = useMemo(() => {
    return (posts || []).filter(post => 
      (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (post.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = async (id, data) => {
    if (id) {
      await updatePost(id, data);
      showToast('Post updated successfully!');
    } else {
      await addPost(data);
      showToast('Post published successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-24 right-8 z-[60] bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center">
          <SafeIcon icon={FiCheckCircle} className="mr-2" /> {successMsg}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Stories</h2>
          <p className="text-sm text-gray-500">Manage your articles (Source: Posts Table)</p>
        </div>
        <button 
          type="button"
          onClick={() => { 
            console.log("Write New Story clicked ✅");
            setEditingPost(null); 
            setIsModalOpen(true); 
          }} 
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg font-bold"
        >
          <SafeIcon icon={FiPlus} className="mr-2" /> Write New Story
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search stories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Story</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading stories...</td></tr>
            ) : filteredPosts.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No stories found.</td></tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 bg-gray-100 border">
                        <SafeImage src={post.image} fallback={BLOG_PLACEHOLDER} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{post.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg uppercase">{post.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${post.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{post.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => { setEditingPost(post); setIsModalOpen(true); }} className="text-gray-400 hover:text-purple-600"><SafeIcon icon={FiEdit3} /></button>
                    <button onClick={() => deletePost(post.id)} className="text-gray-400 hover:text-red-500"><SafeIcon icon={FiTrash2} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <EditPostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} post={editingPost} onSave={handleSave} categories={categories} />
    </div>
  );
};

export default BlogPostManagement;