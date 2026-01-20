import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { BLOG_PLACEHOLDER } from '../config/assets';
import { useAuth } from '../contexts/AuthContext';
import { generateSlug } from '../utils/slugUtils';
import { normalizeNcbDate } from '../services/nocodebackendClient';

const { FiX, FiSave, FiAlertTriangle, FiSearch, FiChevronDown, FiChevronUp, FiImage } = FiIcons;

const EditPostModal = ({ isOpen, onClose, post, onSave, categories = [] }) => {
  const { user } = useAuth();
  const [showSeo, setShowSeo] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', category: 'General', author: '', image: '', status: 'Draft',
    slug: '', meta_title: '', meta_description: '', meta_keywords: '', og_image: '', date: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const safeCategories = Array.isArray(categories) && categories.length > 0 ? categories : ['Life', 'BTS', 'Parenting', 'Self-Care', 'K-Drama', 'General'];

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        category: post.category || 'General',
        author: post.author || 'Admin (BangtanMom)',
        image: post.image || '',
        status: post.status === 'Published' || post.status === 'published' ? 'Published' : 'Draft',
        slug: post.slug || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
        og_image: post.og_image || '',
        date: post.date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        title: '', content: '', category: 'General', author: user?.name || 'Admin (BangtanMom)',
        image: '', status: 'Draft', slug: '', meta_title: '', meta_description: '',
        meta_keywords: '', og_image: '', date: new Date().toISOString().split('T')[0]
      });
    }
    setErrorMessage('');
  }, [post, isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from title if slug is empty
      if (name === 'title' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // VALIDATION
    if (!formData.title.trim()) {
      setErrorMessage('Post Title is required.');
      return;
    }
    if (!formData.content.trim()) {
      setErrorMessage('Story Content is required.');
      return;
    }
    if (!formData.category) {
      setErrorMessage('Please select a Category.');
      return;
    }

    // DATE VALIDATION & NORMALIZATION
    // Handles empty (today), Date objects, DD/MM/YYYY
    const finalDate = normalizeNcbDate(formData.date);
    if (!finalDate) {
      setErrorMessage('Publish date is invalid. Please reselect a valid date.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      // PREPARE PAYLOAD
      const submissionData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        meta_title: formData.meta_title || formData.title,
        og_image: formData.og_image || formData.image,
        author: formData.author || 'Admin (BangtanMom)',
        status: formData.status || 'Draft',
        category: formData.category || 'General',
        // Use normalized date (YYYY-MM-DD)
        date: finalDate
      };

      await onSave(post?.id, submissionData);
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-gray-900">{post ? 'Edit Story' : 'Create New Story'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><SafeIcon icon={FiX} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-sm">
                <SafeIcon icon={FiAlertTriangle} className="mr-2" /> {errorMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Post Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Story Content *</label>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData(p => ({ ...p, content: val }))} className="bg-white min-h-[300px]" />
                  </div>
                </div>

                <div className="border border-purple-100 rounded-xl bg-purple-50/30 overflow-hidden">
                  <button type="button" onClick={() => setShowSeo(!showSeo)} className="w-full px-6 py-4 flex items-center justify-between font-bold text-purple-900 hover:bg-purple-100/50 transition-colors">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiSearch} /> <span>SEO & Meta Details</span>
                    </div>
                    <SafeIcon icon={showSeo ? FiChevronUp : FiChevronDown} />
                  </button>
                  {showSeo && (
                    <div className="px-6 pb-6 space-y-4 border-t border-purple-100 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Slug (URL Path)</label>
                          <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="bts-world-tour-2027" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Meta Title</label>
                          <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="Fallback: Title" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Meta Description</label>
                        <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="Fallback: First 160 characters" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Keywords</label>
                          <input type="text" name="meta_keywords" value={formData.meta_keywords} onChange={handleChange} placeholder="bts, armor, kpop" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">OG Image URL</label>
                          <input type="text" name="og_image" value={formData.og_image} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="Fallback: Featured Image" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Publishing Status *</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-bold">
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Publish Date (YYYY-MM-DD)</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Author</label>
                    <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium">
                      {(safeCategories || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Featured Image</label>
                  <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="Image URL..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
                  {formData.image && (
                    <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <SafeImage src={formData.image} alt="Preview" fallback={BLOG_PLACEHOLDER} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
          
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isSaving} className="flex items-center px-8 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 transition-all">
              {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> : <SafeIcon icon={FiSave} className="mr-2" />}
              {post ? 'Update Story' : 'Publish Story'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPostModal;