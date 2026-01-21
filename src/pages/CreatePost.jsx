import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { generateSlug, ensureUniqueSlug, calculateReadTime } from '../utils/slugUtils';

const { FiPlus, FiImage, FiType, FiTag, FiClock, FiChevronLeft, FiSave, FiSettings, FiChevronDown, FiChevronUp, FiInfo, FiLayers, FiGlobe } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { posts, addPost, refreshData } = useBlog();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'Lifestyle',
    tags: '',
    status: 'published',
    slug: '',
    meta_title: '',
    meta_description: ''
  });

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const uniqueSlug = ensureUniqueSlug(formData.title, posts);
      setFormData(prev => ({
        ...prev,
        slug: uniqueSlug,
        meta_title: prev.title
      }));
    }
  }, [formData.title, posts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content?.trim() || formData.content === '<p><br></p>') {
      setError('Content is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const readTime = calculateReadTime(formData.content);
      const today = new Date().toISOString().slice(0, 10);

      // Final slug uniqueness check right before submission
      const finalSlug = ensureUniqueSlug(formData.slug || formData.title, posts);

      // Construct the exact payload requested by the user
      const payload = {
        title: formData.title.trim(),
        slug: finalSlug,
        excerpt: formData.excerpt.trim(),
        content_html: formData.content, // Rich editor output
        status: formData.status,
        featured_image_url: formData.image,
        category: formData.category,
        tags: formData.tags,
        author: user?.name || 'Admin',
        read_time: readTime,
        created_at: today,
        updated_at: today,
        published_at: formData.status === 'published' ? today : null
      };

      await addPost(payload);
      await refreshData();
      navigate('/admin');
    } catch (err) {
      console.error('Submit Error:', err);
      setError(err.message || 'Failed to create post. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              <SafeIcon icon={FiChevronLeft} className="mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Story</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center">
              <SafeIcon icon={FiInfo} className="mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Story Title</label>
                  <div className="relative">
                    <SafeIcon icon={FiType} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter a catchy title..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brief Summary (Excerpt)</label>
                  <textarea
                    rows="2"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Short description for the card..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Story Content</label>
                  <div className="prose-editor">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(val) => setFormData({...formData, content: val})}
                      className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
                  <div className="relative">
                    <SafeIcon icon={FiImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="relative">
                    <SafeIcon icon={FiLayers} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option>Lifestyle</option>
                      <option>Health</option>
                      <option>Mental Wellness</option>
                      <option>Relationships</option>
                      <option>Personal Growth</option>
                      <option>BTS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="relative">
                    <SafeIcon icon={FiSettings} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <div className="relative">
                    <SafeIcon icon={FiTag} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="wellness, selfcare, habits"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Settings Collapsible */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSeoSettings(!showSeoSettings)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center text-gray-700 font-semibold">
                  <SafeIcon icon={FiGlobe} className="mr-3 text-purple-600" />
                  SEO & Meta Detail Settings
                </div>
                <SafeIcon icon={showSeoSettings ? FiChevronUp : FiChevronDown} />
              </button>
              
              <AnimatePresence>
                {showSeoSettings && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="p-6 space-y-4 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug</label>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Title</label>
                          <input
                            type="text"
                            value={formData.meta_title}
                            onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Description</label>
                        <textarea
                          rows="2"
                          value={formData.meta_description}
                          onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <SafeIcon icon={isSubmitting ? FiClock : FiSave} className="mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Story'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreatePost;