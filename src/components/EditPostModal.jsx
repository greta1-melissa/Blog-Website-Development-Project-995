import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { BLOG_PLACEHOLDER } from '../config/assets';
import { ensureUniqueSlug } from '../utils/slugUtils';
import { useBlog } from '../contexts/BlogContext';
import { normalizeDropboxSharedUrl } from '../utils/dropboxLink';
import { quillModules, quillFormats, editorStyles } from '../utils/editorConfig';

const { FiX, FiSave, FiImage, FiUploadCloud, FiAlertTriangle, FiSearch, FiChevronDown, FiChevronUp, FiEye, FiEyeOff } = FiIcons;

const EditPostModal = ({ isOpen, onClose, post, onSave, categories }) => {
  const { posts } = useBlog();
  const [showSeo, setShowSeo] = useState(false);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', category: '', excerpt: '', image: '', status: 'published', seo_title: '', meta_description: '', focus_keyword: '', og_image_url: '', canonical_url: '', noindex: false });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        category: post.category || '',
        excerpt: post.excerpt || '',
        image: post.image || post.image_url || post.featured_image_url || '',
        status: post.status || 'published',
        seo_title: post.seo_title || '',
        meta_description: post.meta_description || post.seo_description || '',
        focus_keyword: post.focus_keyword || post.seo_keywords || '',
        og_image_url: post.og_image_url || '',
        canonical_url: post.canonical_url || '',
        noindex: post.noindex === true || post.noindex === 'true'
      });
      setErrorMessage('');
    }
  }, [post, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'image' && typeof finalValue === 'string') {
      finalValue = normalizeDropboxSharedUrl(finalValue);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload-to-dropbox', { method: 'POST', body: data });
      const result = await res.json();
      if (res.ok && result.success) {
        setFormData(prev => ({ ...prev, image: result.proxyUrl }));
      } else throw new Error(result.message || "Upload failed");
    } catch (error) { setErrorMessage(error.message); } finally { setIsUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      const finalSlug = formData.slug.trim() || ensureUniqueSlug(formData.title, posts, post?.id);
      const submissionData = { ...formData, slug: finalSlug };
      await onSave(post?.id, submissionData);
      onClose();
    } catch (error) { setErrorMessage(error.message); } finally { setIsSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-gray-900">{post ? 'Edit Story' : 'Create New Story'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><SafeIcon icon={FiX} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-xs overflow-hidden">
                <SafeIcon icon={FiAlertTriangle} className="mr-2 flex-shrink-0" />
                <span className="whitespace-pre-wrap">{errorMessage}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-lg font-bold" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Short Excerpt (Summary)</label>
                  <textarea 
                    name="excerpt" 
                    value={formData.excerpt} 
                    onChange={handleChange} 
                    rows="3" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm leading-relaxed" 
                    placeholder="A brief summary of your story for the blog cards..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Content *</label>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.content} 
                      onChange={(val) => setFormData(p => ({ ...p, content: val }))} 
                      modules={quillModules}
                      formats={quillFormats}
                      className={editorStyles} 
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <button type="button" onClick={() => setShowSeo(!showSeo)} className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiSearch} className="text-xs font-bold text-gray-700 uppercase tracking-wide" />
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">SEO Settings</span>
                    </div>
                    <SafeIcon icon={showSeo ? FiChevronUp : FiChevronDown} className="text-gray-400" />
                  </button>
                  {showSeo && (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} placeholder="SEO Title" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                        <input type="text" name="focus_keyword" value={formData.focus_keyword} onChange={handleChange} placeholder="Focus Keyword" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                      </div>
                      <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows="2" placeholder="Meta Description" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                        <input type="checkbox" id="noindex_toggle_edit" name="noindex" checked={!formData.noindex} onChange={(e) => setFormData(prev => ({ ...prev, noindex: !e.target.checked }))} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                        <label htmlFor="noindex_toggle_edit" className="text-xs font-medium text-gray-700 cursor-pointer flex items-center">
                          <SafeIcon icon={!formData.noindex ? FiEye : FiEyeOff} className="mr-2 text-gray-400" />
                          Index this page?
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                  <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-2 uppercase text-[10px] tracking-widest">Publishing Info</h3>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" required>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                  <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-2 uppercase text-[10px] tracking-widest">Featured Image</h3>
                  <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="Image URL..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                  <div className="relative">
                    <input type="file" id="post-file-upload-edit" onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <label htmlFor="post-file-upload-edit" className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-purple-200 text-purple-600 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors text-sm font-medium bg-white">
                      {isUploading ? <span className="animate-pulse">Uploading...</span> : <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Change Image</>}
                    </label>
                  </div>
                  {formData.image && (
                    <div className="relative h-40 w-full rounded-xl overflow-hidden border border-gray-200">
                      <SafeImage src={formData.image} alt="Preview" fallback={BLOG_PLACEHOLDER} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
          
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-white rounded-xl transition-colors border border-gray-200">Cancel</button>
            <button onClick={handleSubmit} disabled={isSaving} className="flex items-center px-10 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50">
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