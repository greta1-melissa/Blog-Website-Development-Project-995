import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertCircle, FiHeart } = FiIcons;

const EditKdramaModal = ({ isOpen, onClose, drama, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    tags: '',
    synopsis_short: '',
    synopsis_long: '',
    my_two_cents: '', // Added new field
    image_url: '',
    image_alt: '',
    is_featured_on_home: false,
    display_order: 0
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (drama) {
      setFormData({
        title: drama.title || '',
        slug: drama.slug || '',
        tags: Array.isArray(drama.tags) ? drama.tags.join(', ') : (drama.tags || ''),
        synopsis_short: drama.synopsis_short || drama.synopsis || '',
        synopsis_long: drama.synopsis_long || drama.synopsis || '',
        my_two_cents: drama.my_two_cents || '', // Load field
        // CRITICAL: Prioritize image_url, check image as fallback
        image_url: drama.image_url || drama.image || '',
        image_alt: drama.image_alt || drama.title || '',
        is_featured_on_home: drama.is_featured_on_home || false,
        display_order: drama.display_order || 0
      });
      setUploadStatus('');
      setImageError(false);
    } else {
      setFormData({
        title: '',
        slug: '',
        tags: '',
        synopsis_short: '',
        synopsis_long: '',
        my_two_cents: '',
        image_url: '',
        image_alt: '',
        is_featured_on_home: false,
        display_order: 10
      });
    }
  }, [drama, isOpen]);

  // Auto-generate slug
  useEffect(() => {
    if (!drama && formData.title && !formData.slug) {
      const autoSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title, drama]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'image_url') setImageError(false);
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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
          // CRITICAL: Set image_url explicitly from result
          setFormData(prev => ({ ...prev, image_url: result.url }));
          setUploadStatus('Upload Complete!');
          return;
        }
      }
      throw new Error("Server upload unavailable or failed");
    } catch (error) {
      console.warn("Server upload failed, falling back to local base64:", error);
      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setFormData(prev => ({ ...prev, image_url: base64 }));
        setUploadStatus('Upload Complete! (Local)');
      } catch (localError) {
        setUploadStatus('Upload Failed');
        alert("Could not process image.");
      }
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const processedData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      display_order: parseInt(formData.display_order) || 0
    };

    try {
      await onSave(drama ? drama.id : null, processedData);
      onClose();
    } catch (error) {
      alert('Failed to save: ' + error.message);
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
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-20 px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {drama ? 'Edit K-Drama' : 'Add New K-Drama'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono text-gray-600 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Historical, Romance, Comedy"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      name="is_featured_on_home"
                      checked={formData.is_featured_on_home}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="is_featured" className="ml-2 text-sm font-bold text-gray-800">Feature on Home Page</label>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Display Order</label>
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleChange}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column (Image) */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="space-y-3">
                    <div className="relative">
                      <SafeIcon icon={FiImage} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="Image URL"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        id="kdrama-file-upload"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <label 
                        htmlFor="kdrama-file-upload" 
                        className={`flex items-center justify-center px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors text-sm bg-white ${uploadStatus.includes('Failed') ? 'border-red-300 text-red-600' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
                      >
                        {isUploading ? 
                          <span className="animate-pulse">Uploading...</span> : 
                          uploadStatus.includes('Complete') ? 
                          <><SafeIcon icon={FiCheck} className="mr-2" /> Uploaded</> : 
                          <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload New File</>
                        }
                      </label>
                    </div>
                    
                    {formData.image_url && (
                      <div className="relative h-40 w-full bg-white rounded-lg overflow-hidden border border-gray-200 mt-2">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className={`w-full h-full object-cover transition-opacity ${imageError ? 'opacity-0' : 'opacity-100'}`}
                          onError={() => setImageError(true)}
                          onLoad={() => setImageError(false)}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Image Alt Text</label>
                      <input
                        type="text"
                        name="image_alt"
                        value={formData.image_alt}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        placeholder="Description for accessibility"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Synopsis and My 2 Cents */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Synopsis (Home Page)</label>
                <textarea
                  name="synopsis_short"
                  value={formData.synopsis_short}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="A brief teaser..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Long Synopsis (Recommendations Page)</label>
                    <textarea
                    name="synopsis_long"
                    value={formData.synopsis_long}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="The full story details..."
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-purple-800 mb-1 flex items-center">
                        <SafeIcon icon={FiHeart} className="mr-1 text-purple-500" /> My 2 Cents (Personal Opinion)
                     </label>
                    <textarea
                    name="my_two_cents"
                    value={formData.my_two_cents}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-purple-50/50"
                    placeholder="Why you love this drama, favorite moments, etc..."
                    />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-8 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 shadow-lg shadow-purple-200"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <><SafeIcon icon={FiSave} className="mr-2" /> Save Drama</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditKdramaModal;