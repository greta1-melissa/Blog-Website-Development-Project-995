import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
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
        image_url: drama.image_url || drama.image || '',
        image_alt: drama.image_alt || drama.title || '',
        is_featured_on_home: drama.is_featured_on_home || false,
        display_order: drama.display_order || 0
      });
      setUploadStatus('');
      setErrorMessage('');
    }
  }, [drama, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading...');
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append('file', file);

      const response = await fetch('/api/upload-to-dropbox', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (response.ok && result.success && result.proxyUrl) {
        setFormData(prev => ({ ...prev, image_url: result.proxyUrl }));
        setUploadStatus('Upload Complete!');
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
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

    setIsSaving(true);
    try {
      const processedTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean).join(',');
      await onSave(drama ? drama.id : null, { ...formData, tags: processedTags });
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
              <SafeIcon icon={FiX} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="space-y-3">
                      <div className="relative">
                        <SafeIcon icon={FiImage} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          name="image_url"
                          value={formData.image_url}
                          onChange={handleChange}
                          placeholder="Image URL (include ?raw=1 for Dropbox)"
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none text-sm bg-white"
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
                          className="flex items-center justify-center px-4 py-2 border border-dashed border-purple-300 text-purple-600 rounded-lg cursor-pointer hover:bg-purple-50 text-sm bg-white"
                        >
                          <SafeIcon icon={FiUploadCloud} className="mr-2" />
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </label>
                      </div>
                      {formData.image_url && (
                        <div className="relative h-40 w-full bg-white rounded-lg overflow-hidden border border-gray-200 mt-2">
                          <SafeImage src={formData.image_url} alt="Preview" fallback={KDRAMA_PLACEHOLDER} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Synopsis & Thoughts</label>
                <textarea
                  name="synopsis_short"
                  value={formData.synopsis_short}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Short summary..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  name="my_two_cents"
                  value={formData.my_two_cents}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Your review..."
                  className="w-full px-4 py-2 border border-purple-200 bg-purple-50/30 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Drama'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditKdramaModal;