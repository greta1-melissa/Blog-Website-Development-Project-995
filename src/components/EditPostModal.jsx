import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { LOGO_URL } from '../config/assets';
import { useAuth } from '../contexts/AuthContext';
import { generateSlug, calculateReadTime } from '../utils/slugUtils';
import { normalizeNcbDate } from '../services/nocodebackendClient';

const { FiX, FiSave, FiImage, FiSettings, FiChevronDown, FiChevronUp, FiInfo, FiHash, FiAlignLeft } = FiIcons;

const EditPostModal = ({ isOpen, onClose, post, onSave, categories = [] }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [error, setError] = useState(null);

  // Use a safe fallback for categories
  const safeCategories = Array.isArray(categories) && categories.length > 0 
    ? categories 
    : ['Motherhood', 'BTS', 'K-Drama', 'Lifestyle', 'Personal', 'Tips'];

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setFormData({
          ...post,
          excerpt: post.excerpt || '',
          meta_title: post.meta_title || post.title || '',
          meta_description: post.meta_description || '',
          meta_keywords: post.meta_keywords || '',
          slug: post.slug || generateSlug(post.title || ''),
          og_image: post.og_image || post.image || '',
          status: post.status || 'Published',
          date: post.date || new Date().toLocaleDateString('en-GB'),
          featured_image_url: post.featured_image_url || post.image || ''
        });
      } else {
        // Initialize for NEW post
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          category: safeCategories[0],
          status: 'Draft',
          date: new Date().toLocaleDateString('en-GB'),
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          slug: '',
          og_image: '',
          image: '',
          featured_image_url: ''
        });
      }
      setError(null);
    } else {
      setFormData(null);
    }
  }, [post, isOpen]);

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    // Validate and Normalize Date for NCB (YYYY-MM-DD)
    const normalizedDate = normalizeNcbDate(formData.date);
    if (!normalizedDate) {
      setError("Invalid date format. Please use DD/MM/YYYY.");
      return;
    }

    // Auto-generate excerpt if blank
    let finalExcerpt = formData.excerpt?.trim();
    if (!finalExcerpt && formData.content) {
      const plainText = stripHtml(formData.content);
      finalExcerpt = plainText.substring(0, 155).trim();
      if (plainText.length > 155) finalExcerpt += '...';
    }

    setIsSubmitting(true);
    try {
      const updatedPost = {
        ...formData,
        excerpt: finalExcerpt || null,
        date: normalizedDate,
        featured_image_url: formData.featured_image_url?.trim() || null,
        readtime: calculateReadTime(formData.content),
        updated_at: new Date().toISOString()
      };
      await onSave(post?.id, updatedPost);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !formData) return null;

  // Simple URL validation for the inline note
  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{post ? 'Edit Story' : 'New Story'}</h2>
              <p className="text-gray-500 text-xs">{post ? 'Making updates to your magical content' : 'Start sharing your magical journey'}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SafeIcon icon={FiX} />
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <SafeIcon icon={FiSave} className="mr-2" />
                )}
                {post ? 'Save Changes' : 'Publish Story'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center">
                <SafeIcon icon={FiInfo} className="mr-2" />
                {error}
              </div>
            )}

            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Story Title</label>
                <input
                  type="text"
                  value={formData.title}
                  placeholder="Enter story title..."
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none bg-white"
                >
                  {safeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {/* Featured Image URL */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <SafeIcon icon={FiImage} className="mr-2 text-purple-600" />
                  Featured Image URL
                </label>
                <input
                  type="text"
                  value={formData.featured_image_url || ''}
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => setFormData({...formData, featured_image_url: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                />
                {!isValidUrl(formData.featured_image_url) && formData.featured_image_url && (
                  <p className="mt-1 text-xs text-amber-600 font-medium flex items-center">
                    <SafeIcon icon={FiInfo} className="mr-1" /> Check image URL format
                  </p>
                )}
              </div>
              
              {formData.featured_image_url && isValidUrl(formData.featured_image_url) && (
                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 w-fit max-w-full">
                  <img 
                    src={formData.featured_image_url} 
                    alt="Featured preview" 
                    className="max-h-[120px] object-contain"
                    onError={(e) => e.target.parentElement.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            {/* Status & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none bg-white"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Publish Date (DD/MM/YYYY)</label>
                <input
                  type="text"
                  value={formData.date}
                  placeholder="25/12/2023"
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSeoSettings(!showSeoSettings)}
                className="w-full px-6 py-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
              >
                <div className="flex items-center text-gray-700 font-bold">
                  <SafeIcon icon={FiSettings} className="mr-2 text-purple-600" />
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
                    className="overflow-hidden bg-white"
                  >
                    <div className="p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                          <SafeIcon icon={FiHash} className="mr-2 text-purple-600" />
                          URL Slug
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          placeholder="story-url-slug"
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                          <input
                            type="text"
                            value={formData.meta_title}
                            placeholder="SEO Title"
                            onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Meta Keywords</label>
                          <input
                            type="text"
                            value={formData.meta_keywords}
                            placeholder="BTS, Parenting, Blog"
                            onChange={(e) => setFormData({...formData, meta_keywords: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                        <textarea
                          value={formData.meta_description}
                          onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                          placeholder="Short description for search engines..."
                          rows="2"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <SafeIcon icon={FiAlignLeft} className="mr-2 text-purple-600" />
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                placeholder="Short summary of the post..."
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
              />
              <p className="mt-1 text-[10px] text-gray-400 font-medium">
                Recommended 120–160 characters. If left blank, we'll generate one from your content.
              </p>
            </div>

            {/* Editor */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Story Content</label>
              <div className="rounded-2xl border border-gray-200 overflow-hidden min-h-[300px]">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData({...formData, content})}
                  className="h-64"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPostModal;