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

const { FiPlus, FiImage, FiType, FiTag, FiClock, FiChevronLeft, FiSave, FiSettings, FiChevronDown, FiChevronUp, FiInfo, FiLayers, FiGlobe, FiCheckCircle } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { posts, addPost } = useBlog();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category_id: '',
    status: 'draft', // Default to draft as requested
    slug: '',
    meta_title: '',
    meta_description: '',
    featured_image_dropbox_url: ''
  });

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const uniqueSlug = generateSlug(formData.title);
      setFormData(prev => ({
        ...prev,
        slug: uniqueSlug,
        meta_title: prev.title
      }));
    }
  }, [formData.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
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
      const now = new Date().toISOString();

      // Ensure slug is unique by appending timestamp (logic also mirrored in client helper)
      const baseSlug = formData.slug || generateSlug(formData.title);
      const finalSlug = `${baseSlug}-${Date.now()}`;

      /**
       * Construct the exact payload requested by the user:
       * title, slug, content_html, status, created_at, updated_at
       */
      const payload = {
        title: formData.title.trim(),
        slug: finalSlug,
        excerpt: formData.excerpt?.trim() || null,
        content_html: formData.content, // Stores rich editor output as HTML string
        featured_image_dropbox_url: formData.featured_image_dropbox_url || null,
        featured_image_url: formData.image || null,
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        author_name: user?.name || 'Admin',
        author_email: user?.email || null,
        status: formData.status,
        created_at: now,
        updated_at: now,
        published_at: formData.status === 'published' ? now : null
      };

      await addPost(payload);
      setSuccess(true);
      
      // Feedback & Redirect
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
    } catch (err) {
      console.error('Submit Error:', err);
      // Show clear error message including body
      setError(`Failed to save post: ${err.message}`);
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
              type="button"
              onClick={() => navigate('/admin')}
              className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              <SafeIcon icon={FiChevronLeft} className="mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Story</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center shadow-sm">
              <SafeIcon icon={FiInfo} className="mr-2 flex-shrink-0" />
              <span className="break-all">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl flex items-center shadow-sm">
              <SafeIcon icon={FiCheckCircle} className="mr-2" />
              ✅ Post saved successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Story Title *</label>
                  <div className="relative">
                    <SafeIcon icon={FiType} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none font-medium"
                      placeholder="Enter a catchy title..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Brief Summary (Excerpt)</label>
                  <textarea
                    rows="2"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    placeholder="Short description for the card..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Story Content *</label>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image URL</label>
                  <div className="relative">
                    <SafeIcon icon={FiImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <div className="relative">
                    <SafeIcon icon={FiSettings} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none outline-none font-medium"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category ID (Optional)</label>
                  <div className="relative">
                    <SafeIcon icon={FiLayers} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder="Enter category ID (number)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dropbox Image URL (Optional)</label>
                  <div className="relative">
                    <SafeIcon icon={FiImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.featured_image_dropbox_url}
                      onChange={(e) => setFormData({...formData, featured_image_dropbox_url: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder="Dropbox direct link..."
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
                <div className="flex items-center text-gray-700 font-bold">
                  <SafeIcon icon={FiGlobe} className="mr-3 text-purple-600" />
                  SEO & URL Settings
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
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug (Will be suffixed with timestamp)</label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono"
                          placeholder="my-cool-story"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 pb-12">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSave} className="mr-2" />
                    Save Story
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreatePost;