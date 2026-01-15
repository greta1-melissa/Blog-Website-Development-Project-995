import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const title = (post.title || '').toLowerCase();
      const category = (post.category || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      return title.includes(search) || category.includes(search);
    });
  }, [posts, searchTerm]);

  const handleSave = async (id, data) => {
    try {
      if (id) {
        await updatePost(id, data);
        toast.success('Post updated successfully!');
      } else {
        await addPost(data);
        toast.success('Post published successfully!');
      }
    } catch (error) {
      toast.error(`Operation failed: ${error.upstreamBody || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deletePost(id);
        toast.success('Post deleted successfully!');
      } catch (error) {
        toast.error(`Delete failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Stories</h2>
          <p className="text-sm text-gray-500">Manage your articles (Source: Posts Table)</p>
        </div>
        <button onClick={() => { setEditingPost(null); setIsModalOpen(true); }} className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg font-bold">
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
                    <button onClick={() => { setEditingPost(post); setIsModalOpen(true); }} className="text-gray-400 hover:text-purple-600 transition-colors"><SafeIcon icon={FiEdit3} /></button>
                    <button onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-500 transition-colors"><SafeIcon icon={FiTrash2} /></button>
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