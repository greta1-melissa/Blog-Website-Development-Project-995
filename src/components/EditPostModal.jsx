import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { normalizeDropboxUrl, getImageSrc } from '../utils/media.js';

const { FiX, FiSave, FiImage, FiUploadCloud, FiCheck, FiSearch, FiCalendar, FiChevronDown, FiChevronUp, FiAlertTriangle } = FiIcons;

const EditPostModal = ({ isOpen, onClose, post, onSave, categories }) => {
  const [sections, setSections] = useState({ seo: false, schedule: true });
  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: '',
    readTime: '',
    focusKeyword: '',
    seoTitle: '',
    metaDescription: '',
    scheduledDate: '',
    scheduledTime: '',
    status: 'published'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        category: post.category || '',
        image: post.image_url || post.image || '',
        readTime: post.readTime || post.readtime || '',
        focusKeyword: post.focusKeyword || '',
        seoTitle: post.seoTitle || post.title || '',
        metaDescription: post.metaDescription || '',
        status: post.status || 'published',
        scheduledDate: post.date || new Date().toISOString().split('T')[0],
        scheduledTime: ''
      });
      setUploadStatus('');
      setImageError(false);
      setErrorMessage('');
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'image') {
      const processedUrl = normalizeDropboxUrl(value);
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
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append('file', file);

      const response = await fetch('/api/upload-to-dropbox', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      
      // STRICT RESPONSE HANDLING: Only accept proxyUrl
      if (response.ok && result.success && result.proxyUrl) {
        setFormData(prev => ({ ...prev, image: result.proxyUrl }));
        setUploadStatus('Upload Complete!');
      } else {
        const errorMsg = result.proxyUrl ? (result.message || "Upload failed") : "Server did not return a valid proxy URL.";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.warn("Upload failed:", error);
      setUploadStatus('Upload Failed');
      setErrorMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    const cleanImageInput = formData.image ? formData.image.trim() : '';

    // IMAGE PERSISTENCE GUARD
    if (cleanImageInput) {
      if (cleanImageInput.includes('dropbox.com')) {
        setErrorMessage("Direct Dropbox links are forbidden. Please use the 'Upload' button to generate a permanent proxy link.");
        setIsSaving(false);
        return;
      }
      if (!cleanImageInput.startsWith('/api/media/dropbox') && !cleanImageInput.includes('images.unsplash.com')) {
        setErrorMessage("Invalid Image URL. Must be a proxy link (starts with /api/media/dropbox).");
        setIsSaving(false);
        return;
      }
    }

    const finalImage = cleanImageInput || post.image_url || post.image || '';
    const { readTime, ...restOfFormData } = formData;
    
    const updatedData = {
      ...restOfFormData,
      readtime: readTime,
      image: finalImage,
      date: formData.scheduledDate || new Date().toISOString().split('T')[0],
      status: formData.status
    };

    try {
      await onSave(post.id, updatedData);
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        >
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
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <SafeIcon icon={FiAlertTriangle} className="text-red-500 mr-2 mt-0.5" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                      <input
                        type="text"
                        name="readTime"
                        value={formData.readTime}
                        onChange={handleChange}
                        placeholder="e.g. 5 min read"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>

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
                          className={`flex items-center justify-center px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors whitespace-nowrap text-sm bg-white ${uploadStatus === 'Upload Failed' ? 'border-red-300 text-red-600' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
                        >
                          {isUploading ? (
                            <span className="animate-pulse">Uploading...</span>
                          ) : uploadStatus.includes('Complete') ? (
                            <><SafeIcon icon={FiCheck} className="mr-2" /> {uploadStatus}</>
                          ) : (
                            <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload New File</>
                          )}
                        </label>
                      </div>
                    </div>

                    {formData.image && (
                      <div className="relative h-32 w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={getImageSrc(formData.image)}
                          alt="Preview"
                          className={`w-full h-full object-cover transition-opacity ${imageError ? 'opacity-0' : 'opacity-100'}`}
                          onError={() => setImageError(true)}
                          onLoad={() => setImageError(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

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
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> Saving...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="mr-2" /> {getButtonText()}
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