import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { normalizeDropboxImageUrl, getImageSrc } from '../utils/media.js';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiX, FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertTriangle, FiHeart } = FiIcons;

const EditKdramaModal = ({ isOpen, onClose, drama, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    tags: '',
    synopsis_short: '',
    synopsis_long: '',
    my_two_cents: '',
    image_url: '',
    image_alt: '',
    is_featured_on_home: false,
    display_order: 0
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (drama) {
      setFormData({
        title: drama.title || '',
        slug: drama.slug || '',
        tags: Array.isArray(drama.tags) ? drama.tags.join(',') : (drama.tags || ''),
        synopsis_short: drama.synopsis_short || drama.synopsis || '',
        synopsis_long: drama.synopsis_long || drama.synopsis || '',
        my_two_cents: drama.my_two_cents || '',
        image_url: normalizeDropboxImageUrl(drama.image_url || drama.image || ''),
        image_alt: drama.image_alt || drama.title || '',
        is_featured_on_home: drama.is_featured_on_home || false,
        display_order: drama.display_order || 0
      });
      setUploadStatus('');
      setImageError(false);
      setErrorMessage('');
    } else {
      setFormData({
        title: '', slug: '', tags: '', synopsis_short: '', synopsis_long: '',
        my_two_cents: '', image_url: '', image_alt: '', is_featured_on_home: false, display_order: 10
      });
    }
  }, [drama, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'image_url') {
      finalValue = normalizeDropboxImageUrl(finalValue);
      setImageError(false);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
        setFormData(prev => ({ ...prev, image_url: result.proxyUrl }));
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
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setErrorMessage('');

    const cleanImage = formData.image_url ? formData.image_url.trim() : '';

    // IMAGE PERSISTENCE GUARD
    if (cleanImage) {
      if (cleanImage.includes('dropbox.com')) {
        setErrorMessage("Direct Dropbox links are forbidden. Please use the 'Upload' button to generate a permanent proxy link.");
        return;
      }
      if (!cleanImage.startsWith('/api/media/dropbox') && !cleanImage.includes('images.unsplash.com')) {
        setErrorMessage("Invalid Image URL. Must be a proxy link (starts with /api/media/dropbox).");
        return;
      }
    }

    setIsSaving(true);
    const processedTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean).join(',');

    try {
      await onSave(drama ? drama.id : null, { ...formData, image_url: cleanImage, tags: processedTags });
      onClose();
    } catch (error) {
      setErrorMessage(`Failed to save: ${error.message}`);
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
          <div className="sticky top-0 bg-white z-20 px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">{drama ? 'Edit K-Drama' : 'Add New K-Drama'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <SafeIcon icon={FiAlertTriangle} className="text-red-500 mr-2 mt-0.5 text-lg flex-shrink-0" />
                <span className="text-red-700 text-sm font-medium">{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

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
                      <input type="file" id="kdrama-file-upload" onChange={handleFileUpload} className="hidden" accept="image/*" />
                      <label htmlFor="kdrama-file-upload" className={`flex items-center justify-center px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors text-sm bg-white ${uploadStatus.includes('Failed') ? 'border-red-300 text-red-600' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}>
                        {isUploading ? <span className="animate-pulse">Uploading...</span> : uploadStatus.includes('Complete') ? <><SafeIcon icon={FiCheck} className="mr-2" /> {uploadStatus}</> : <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload New File</>}
                      </label>
                    </div>

                    {formData.image_url && (
                      <div className="relative h-40 w-full bg-white rounded-lg overflow-hidden border border-gray-200 mt-2">
                        <img
                          src={getImageSrc(formData.image_url)}
                          alt="Preview"
                          className={`w-full h-full object-cover transition-opacity ${imageError ? 'opacity-0' : 'opacity-100'}`}
                          onError={() => { setImageError(true); }}
                          onLoad={() => setImageError(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Synopsis</label>
                <textarea
                  name="synopsis_short"
                  value={formData.synopsis_short}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Synopsis</label>
                  <textarea
                    name="synopsis_long"
                    value={formData.synopsis_long}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-1 flex items-center">
                    <SafeIcon icon={FiHeart} className="mr-1 text-purple-500" /> My 2 Cents
                  </label>
                  <textarea
                    name="my_two_cents"
                    value={formData.my_two_cents}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-purple-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={onClose} className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-200" disabled={isSaving}>Cancel</button>
              <button type="submit" disabled={isSaving} className="flex items-center px-8 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 shadow-lg shadow-purple-200">
                {isSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> Saving...</> : <><SafeIcon icon={FiSave} className="mr-2" /> Save Drama</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditKdramaModal;