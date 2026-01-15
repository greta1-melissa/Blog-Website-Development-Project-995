import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { KDRAMA_PLACEHOLDER } from '../config/assets';
import { ensureUniqueSlug } from '../utils/slugUtils';
import { useKdrama } from '../contexts/KdramaContext';
import { normalizeDropboxSharedUrl } from '../utils/dropboxLink';
import { quillModules, quillFormats, editorStyles } from '../utils/editorConfig';

const { FiX, FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertTriangle, FiSearch, FiChevronDown, FiChevronUp, FiEye, FiEyeOff } = FiIcons;

const EditKdramaModal = ({ isOpen, onClose, drama, onSave }) => {
  const { kdramas } = useKdrama();
  const [showSeo, setShowSeo] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    tags: '',
    synopsis_short: '',
    synopsis_long: '',
    my_two_cents: '',
    image_url: '',
    status: 'published',
    is_featured_on_home: false,
    seo_title: '',
    meta_description: '',
    focus_keyword: '',
    og_image_url: '',
    canonical_url: '',
    noindex: false
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (drama) {
      setFormData({
        title: drama.title || '',
        slug: String(drama.slug ?? '').trim(),
        tags: Array.isArray(drama.tags) ? drama.tags.join(',') : String(drama.tags || ''),
        synopsis_short: drama.synopsis_short || '',
        synopsis_long: drama.synopsis_long || '',
        my_two_cents: drama.my_two_cents || '',
        image_url: drama.image_url || drama.image || '',
        status: drama.status || 'published',
        is_featured_on_home: drama.is_featured_on_home === true || drama.is_featured_on_home === 1,
        seo_title: drama.seo_title || '',
        meta_description: drama.meta_description || '',
        focus_keyword: drama.focus_keyword || '',
        og_image_url: drama.og_image_url || '',
        canonical_url: drama.canonical_url || '',
        noindex: drama.noindex === true || drama.noindex === 'true'
      });
      setErrorMessage('');
    } else {
      setFormData({
        title: '',
        slug: '',
        tags: '',
        synopsis_short: '',
        synopsis_long: '',
        my_two_cents: '',
        image_url: '',
        status: 'published',
        is_featured_on_home: false,
        seo_title: '',
        meta_description: '',
        focus_keyword: '',
        og_image_url: '',
        canonical_url: '',
        noindex: false
      });
    }
  }, [drama, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if (name === 'image_url' && typeof finalValue === 'string') {
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
        setFormData(prev => ({ ...prev, image_url: result.proxyUrl }));
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage('');

    try {
      const rawSlug = String(formData.slug ?? '').trim();
      const finalSlug = rawSlug || ensureUniqueSlug(formData.title, kdramas, drama?.id);

      const submissionData = {
        ...formData,
        slug: finalSlug,
        tags: String(formData.tags).split(',').map(t => t.trim()).filter(Boolean),
        is_featured_on_home: formData.is_featured_on_home ? 1 : 0
      };

      await onSave(drama?.id, submissionData);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-gray-900">{drama ? 'Edit K-Drama' : 'Add K-Drama'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <SafeIcon icon={FiX} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-sm">
                <SafeIcon icon={FiAlertTriangle} className="mr-2" />
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Custom Slug</label>
                    <input 
                      type="text" 
                      name="slug" 
                      value={formData.slug} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono" 
                      placeholder="drama-slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    name="tags" 
                    value={formData.tags} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
                    placeholder="Historical, Romance, Comedy" 
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Poster Image</label>
                  <div className="space-y-3">
                    <input 
                      type="url" 
                      name="image_url" 
                      value={formData.image_url} 
                      onChange={handleChange} 
                      placeholder="Direct Image URL..." 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none" 
                    />
                    <div className="relative">
                      <input type="file" id="kdrama-upload-fixed" onChange={handleFileUpload} className="hidden" accept="image/*" />
                      <label htmlFor="kdrama-upload-fixed" className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-purple-300 text-purple-600 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors text-sm font-medium">
                        {isUploading ? <span className="animate-pulse">Uploading...</span> : <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload Poster</>}
                      </label>
                    </div>
                    {formData.image_url && (
                      <div className="h-40 w-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-inner">
                        <SafeImage src={formData.image_url} alt="Preview" fallback={KDRAMA_PLACEHOLDER} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <button type="button" onClick={() => setShowSeo(!showSeo)} className="flex items-center justify-between w-full text-left">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiSearch} className="text-gray-400" />
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
                    <input type="checkbox" id="noindex_toggle_kdrama" name="noindex" checked={!formData.noindex} onChange={(e) => setFormData(prev => ({ ...prev, noindex: !e.target.checked }))} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                    <label htmlFor="noindex_toggle_kdrama" className="text-xs font-medium text-gray-700 cursor-pointer flex items-center">
                      <SafeIcon icon={!formData.noindex ? FiEye : FiEyeOff} className="mr-2 text-gray-400" />
                      Index this page?
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">My 2 Cents (Personal Opinion) *</label>
                <div className="rounded-xl overflow-hidden border border-purple-100">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.my_two_cents} 
                    onChange={(val) => setFormData(p => ({ ...p, my_two_cents: val }))} 
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-purple-50/10 min-h-[150px] italic" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Review / Synopsis</label>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.synopsis_long} 
                    onChange={(val) => setFormData(p => ({ ...p, synopsis_long: val }))} 
                    modules={quillModules}
                    formats={quillFormats}
                    className={editorStyles} 
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="is_featured_kdrama" 
                  name="is_featured_on_home" 
                  checked={formData.is_featured_on_home} 
                  onChange={handleChange} 
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
                />
                <label htmlFor="is_featured_kdrama" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Feature on Home Page Carousel</label>
              </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-white rounded-xl border border-gray-200 transition-colors">Cancel</button>
            <button 
              onClick={handleSubmit} 
              disabled={isSaving} 
              className="px-10 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 transition-all flex items-center"
            >
              {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> : <SafeIcon icon={FiSave} className="mr-2" />}
              {drama ? 'Update Recommendation' : 'Save Recommendation'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditKdramaModal;