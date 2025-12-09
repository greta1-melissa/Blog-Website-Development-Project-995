import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertCircle, FiSearch, FiCalendar, FiClock, FiChevronDown, FiChevronUp, FiGlobe } = FiIcons;

const EditPostModal = ({ isOpen, onClose, post, onSave, categories }) => {
  // Tab states for sections
  const [sections, setSections] = useState({
    seo: false,
    schedule: true
  });

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: '',
    // SEO Fields
    focusKeyword: '',
    seoTitle: '',
    metaDescription: '',
    // Scheduling Fields
    scheduledDate: '',
    scheduledTime: '',
    status: 'published'
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        category: post.category || '',
        image: post.image || '',
        // Populate SEO fields or defaults
        focusKeyword: post.focusKeyword || '',
        seoTitle: post.seoTitle || post.title || '',
        metaDescription: post.metaDescription || '',
        // Populate Status/Date
        status: post.status || 'published',
        scheduledDate: post.date || new Date().toISOString().split('T')[0],
        scheduledTime: '' // Time isn't persistently stored in simple schema, reset
      });
      setUploadStatus('');
      setImageError(false);
    }
  }, [post]);

  const processImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('dropbox.com') && url.includes('dl=0')) {
      return url.replace('dl=0', 'raw=1');
    }
    return url;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'image') {
      const processedUrl = processImageUrl(value);
      setFormData({ ...formData, [name]: processedUrl });
      setImageError(false);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content: content }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading...');
    setImageError(false);

    try {
      const data = new FormData();
      data.append('file', file);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/upload-to-dropbox', {
        method: 'POST',
        body: data,
        signal: controller.signal
      }).catch((err) => {
        console.warn("Fetch failed:", err);
        return null;
      });
      
      clearTimeout(timeoutId);

      const contentType = response?.headers?.get("content-type");
      if (response?.ok && contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (result.success) {
          setFormData(prev => ({ ...prev, image: result.url }));
          setUploadStatus('Upload Complete!');
          return;
        }
      }
      throw new Error("Server upload unavailable or failed");
    } catch (error) {
      console.warn("Server upload failed, falling back to local:", error);
      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setFormData(prev => ({ ...prev, image: base64 }));
        setUploadStatus('Upload Complete! (Local)');
      } catch (localError) {
        setUploadStatus('Upload Failed');
        alert("Could not process image.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Logic to update status and date based on user selection
    let finalStatus = formData.status;
    let finalDate = formData.scheduledDate || new Date().toISOString().split('T')[0];

    // Explicit check: If status is 'draft', force it to remain 'draft' regardless of date
    if (finalStatus === 'draft') {
      // Do nothing, ensure it stays draft
    } 
    // If user explicitly sets 'scheduled' and picks a future date
    else if (finalStatus === 'scheduled') {
      // We keep the date they selected
      // Note: Time is used for immediate validation but generally we store YYYY-MM-DD
    } else {
      finalStatus = 'published';
    }

    const updatedData = {
      ...formData,
      date: finalDate,
      status: finalStatus
    };

    try {
      await onSave(post.id, updatedData);
      onClose();
    } catch (error) {
      alert('Failed to save changes: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonText = () => {
    if (isSaving) return 'Saving...';
    switch (formData.status) {
      case 'draft': return 'Save Draft';
      case 'scheduled': return 'Schedule Post';
      case 'published': return 'Publish Changes';
      default: return 'Continue';
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Increased width to max-w-6xl for sidebar layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-20 px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Post</h2>
              <p className="text-xs text-gray-500">Updating: {post?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title & Content */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-medium text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <div className="rounded-lg overflow-hidden border border-gray-300">
                      <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={quillModules}
                        className="bg-white min-h-[300px]"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Section (Collapsible) */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('seo')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <SafeIcon icon={FiSearch} className="text-purple-600 mr-2" />
                      <h3 className="text-base font-bold text-gray-900">SEO Optimization</h3>
                    </div>
                    <SafeIcon icon={sections.seo ? FiChevronUp : FiChevronDown} className="text-gray-500" />
                  </button>
                  
                  <AnimatePresence>
                    {sections.seo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 bg-white"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keyword</label>
                            <input
                              type="text"
                              name="focusKeyword"
                              value={formData.focusKeyword}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                              placeholder="e.g., K-Drama Reviews"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                            <input
                              type="text"
                              name="seoTitle"
                              value={formData.seoTitle}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                            />
                            <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${formData.seoTitle.length > 60 ? 'bg-red-400' : 'bg-green-400'}`}
                                style={{ width: `${Math.min((formData.seoTitle.length / 60) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                            <textarea
                              name="metaDescription"
                              value={formData.metaDescription}
                              onChange={handleChange}
                              rows="3"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
                            />
                          </div>

                          {/* Preview Card */}
                          <div className="bg-white border border-gray-200 p-3 rounded-lg mt-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Preview</h4>
                            <div className="font-sans">
                              <div className="text-xs text-[#1a0dab] hover:underline cursor-pointer truncate font-medium text-lg leading-tight">
                                {formData.seoTitle || formData.title || "Your Post Title"}
                              </div>
                              <div className="text-xs text-[#006621] flex items-center mt-1">
                                bangtanmom.com › post
                              </div>
                              <div className="text-xs text-[#545454] line-clamp-2 mt-1">
                                {formData.metaDescription || "This is how your post description will appear. Add a meta description to control this snippet."}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Publishing */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center mb-4 text-purple-800">
                    <SafeIcon icon={FiCalendar} className="mr-2" />
                    <h3 className="font-bold">Publishing</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                      >
                        <option value="draft">Save as Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>

                    {/* Date Picker - Always visible but context changes */}
                    <div className={formData.status === 'scheduled' ? 'bg-purple-100 p-3 rounded-lg border border-purple-200' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.status === 'scheduled' ? 'Scheduled Date' : 'Publish Date'}
                      </label>
                      <input 
                        type="date" 
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                      />
                      {formData.status === 'scheduled' && (
                        <div className="mt-2 text-xs text-purple-700 flex items-start">
                          <SafeIcon icon={FiClock} className="mr-1 mt-0.5" />
                          Post will be hidden until this date.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Category</h3>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white text-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Image */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Featured Image</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <SafeIcon icon={FiImage} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          placeholder="Image URL"
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                        />
                      </div>
                      
                      <div className="relative">
                        <input
                          type="file"
                          id="edit-file-upload"
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*"
                        />
                        <label
                          htmlFor="edit-file-upload"
                          className={`flex items-center justify-center px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors whitespace-nowrap text-sm bg-white ${
                            uploadStatus === 'Upload Failed' 
                              ? 'border-red-300 text-red-600' 
                              : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {isUploading ? (
                            <span className="animate-pulse">Uploading...</span>
                          ) : uploadStatus.includes('Upload Complete') ? (
                            <><SafeIcon icon={FiCheck} className="mr-2" /> Uploaded</>
                          ) : (
                            <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload New File</>
                          )}
                        </label>
                      </div>
                    </div>

                    {formData.image && (
                      <div className="relative h-32 w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className={`w-full h-full object-cover transition-opacity ${imageError ? 'opacity-0' : 'opacity-100'}`}
                          onError={() => setImageError(true)}
                          onLoad={() => setImageError(false)}
                        />
                        {imageError && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <span className="text-xs">Image preview unavailable</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3 z-20">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center px-8 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 shadow-lg shadow-purple-200"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="mr-2" />
                  {getButtonText()}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPostModal;