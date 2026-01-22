import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { useBlog } from '../contexts/BlogContext';
import { generateSlug } from '../utils/slugUtils';

const { FiX, FiSave, FiImage, FiSettings, FiChevronDown, FiChevronUp, FiInfo, FiHash, FiAlignLeft, FiLayers } = FiIcons;

const EditPostModal = ({ isOpen, onClose, post, onSave }) => {
  const { user } = useAuth();
  const { categories } = useBlog();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setFormData({
          ...post,
          excerpt: post.excerpt || '',
          content: post.content_html || post.content || '',
          category_id: post.category_id || (categories[0]?.id || ''),
          status: post.status || 'published',
          slug: post.slug || generateSlug(post.title || ''),
          featured_image_url: post.featured_image_url || post.image || '',
          featured_image_dropbox_url: post.featured_image_dropbox_url || ''
        });
      } else {
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          category_id: categories[0]?.id || '',
          status: 'draft',
          slug: '',
          image: '',
          featured_image_url: '',
          featured_image_dropbox_url: ''
        });
      }
      setError(null);
    } else {
      setFormData(null);
    }
  }, [post, isOpen, categories]);

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    let finalExcerpt = formData.excerpt?.trim();
    if (!finalExcerpt && formData.content) {
      const plainText = stripHtml(formData.content);
      finalExcerpt = plainText.substring(0, 155).trim();
      if (plainText.length > 155) finalExcerpt += '...';
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const updatedPost = {
        ...formData,
        excerpt: finalExcerpt || null,
        content_html: formData.content,
        category_id: formData.category_id ? Number(formData.category_id) : (categories[0]?.id || null),
        featured_image_url: formData.featured_image_url?.trim() || null,
        featured_image_dropbox_url: formData.featured_image_dropbox_url?.trim() || null,
        status: formData.status.toLowerCase(),
        updated_at: now,
        published_at: formData.status.toLowerCase() === 'published' ? (formData.published_at || now) : null
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
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{post ? 'Edit Story' : 'New Story'}</h2>
              <p className="text-gray-500 text-xs">Manage your content details</p>
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
                Save Changes
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
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none bg-white font-medium"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <SafeIcon icon={FiImage} className="mr-2 text-purple-600" />
                  Featured Image URL
                </label>
                <input
                  type="text"
                  value={formData.featured_image_url || ''}
                  placeholder="Display Image URL"
                  onChange={(e) => setFormData({...formData, featured_image_url: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <SafeIcon icon={FiImage} className="mr-2 text-purple-600" />
                  Dropbox Share Link
                </label>
                <input
                  type="text"
                  value={formData.featured_image_dropbox_url || ''}
                  placeholder="Dropbox Original Link"
                  onChange={(e) => setFormData({...formData, featured_image_dropbox_url: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none bg-white"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSeoSettings(!showSeoSettings)}
                className="w-full px-6 py-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
              >
                <div className="flex items-center text-gray-700 font-bold">
                  <SafeIcon icon={FiSettings} className="mr-2 text-purple-600" />
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
            </div>

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