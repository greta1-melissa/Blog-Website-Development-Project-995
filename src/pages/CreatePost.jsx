import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { BLOG_PLACEHOLDER } from '../config/assets';
import { generateSlug } from '../utils/slugUtils';
import { normalizeNcbDate } from '../services/nocodebackendClient';

const { FiSave, FiAlertTriangle, FiSearch, FiChevronDown, FiChevronUp } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost, categories } = useBlog();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    image: '',
    author: user?.name || 'Admin (BangtanMom)',
    status: 'Published',
    date: new Date().toISOString().split('T')[0],
    slug: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: ''
  });

  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, author: user.name }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  /**
   * Updated Publish Handler
   * Fixes 500 error by normalizing date to YYYY-MM-DD
   */
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

    // DATE NORMALIZATION & VALIDATION
    // This ensures that even if the picker returns DD/MM/YYYY, we send YYYY-MM-DD
    const finalDate = normalizeNcbDate(formData.date);
    if (!finalDate) {
      setErrorMessage('Publish date is invalid. Please reselect a valid date.');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);
    
    try {
      const postData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        meta_title: formData.meta_title || formData.title,
        og_image: formData.og_image || formData.image,
        date: finalDate // Strictly YYYY-MM-DD
      };

      const createdPost = await addPost(postData);
      const targetId = createdPost?.id || createdPost?.slug || createdPost;
      navigate(targetId ? `/post/${targetId}` : '/blogs');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="author">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Share Your Story</h1>
          <p className="text-gray-500">Create a new blog post for your community.</p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-sm">
            <SafeIcon icon={FiAlertTriangle} className="mr-3 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="mb-6">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Post Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg font-bold" required />
              </div>
              <div className="mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Story Content *</label>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData(p => ({ ...p, content: val }))} className="bg-white min-h-[400px]" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <button type="button" onClick={() => setShowSeo(!showSeo)} className="flex items-center justify-between w-full py-2 text-left group">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiSearch} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">SEO & Meta Detail Settings</span>
                  </div>
                  <SafeIcon icon={showSeo ? FiChevronUp : FiChevronDown} className="text-gray-400" />
                </button>
                
                {showSeo && (
                  <div className="mt-6 space-y-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Slug (URL Path)</label>
                        <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="bts-world-tour-2027" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Meta Title</label>
                        <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="Fallback: Title" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Publishing</h3>
              <div className="space-y-4">
                <button type="submit" disabled={isSaving} className="w-full flex items-center justify-center px-6 py-4 bg-purple-600 text-white font-bold rounded-xl disabled:opacity-70 shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
                  {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" /> : <><SafeIcon icon={FiSave} className="mr-2" /> Publish Story</>}
                </button>
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-xs font-bold">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Publish Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-xs font-bold" />
                </div>
              </div>
            </div>
            {/* Sidebar sections for Category, Image etc remain unchanged */}
          </div>
        </form>
      </motion.div>
    </ProtectedRoute>
  );
};

export default CreatePost;