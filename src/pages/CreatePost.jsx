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
import { generateSlug } from '../utils/slugUtils';

const { FiPlus, FiImage, FiType, FiTag, FiClock, FiChevronLeft, FiSave, FiSettings, FiChevronDown, FiChevronUp, FiInfo, FiLayers, FiGlobe, FiCheckCircle, FiSearch } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost, categories } = useBlog();
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
    status: 'draft',
    slug: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    featured_image_dropbox_url: ''
  });

  // Default to first category if available
  useEffect(() => {
    if (categories && categories.length > 0 && !formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories]);

  // Auto-generate slug and meta title when title changes
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const cleanSlug = generateSlug(formData.title);
      setFormData(prev => ({
        ...prev,
        slug: cleanSlug,
        meta_title: prev.title
      }));
    }
  }, [formData.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
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
      const baseSlug = formData.slug || generateSlug(formData.title);

      const payload = {
        title: formData.title.trim(),
        slug: baseSlug, 
        excerpt: formData.excerpt?.trim() || null,
        content_html: formData.content,
        featured_image_dropbox_url: formData.featured_image_dropbox_url || null,
        featured_image_url: formData.image || null,
        category_id: formData.category_id ? Number(formData.category_id) : (categories[0]?.id || null),
        author_name: user?.name || 'Admin',
        author_email: user?.email || null,
        status: formData.status,
        meta_title: formData.meta_title?.trim() || null,
        meta_description: formData.meta_description?.trim() || null,
        keywords: formData.keywords?.trim() || null,
        created_at: now,
        updated_at: now,
        published_at: formData.status === 'published' ? now : null
      };

      await addPost(payload);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
    } catch (err) {
      console.error('Submit Error:', err);
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <div className="relative">
                    <SafeIcon icon={FiLayers} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none font-medium"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dropbox Image Link (Share Link)</label>
                  <div className="relative">
                    <SafeIcon icon={FiImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.featured_image_dropbox_url}
                      onChange={(e) => setFormData({...formData, featured_image_dropbox_url: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder="Dropbox share link..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSeoSettings(!showSeoSettings)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center text-gray-700 font-bold">
                  <SafeIcon icon={FiGlobe} className="mr-3 text-purple-600" />
                  SEO & Meta Details
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
                    <div className="p-6 space-y-6 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug</label>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono"
                            placeholder="my-cool-story"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Title</label>
                          <input
                            type="text"
                            value={formData.meta_title}
                            onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            placeholder="SEO Title..."
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
                          placeholder="Search engine description..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Focus Keywords (comma separated)</label>
                        <div className="relative">
                          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                          <input
                            type="text"
                            value={formData.keywords}
                            onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            placeholder="k-drama, lifestyle, tips..."
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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