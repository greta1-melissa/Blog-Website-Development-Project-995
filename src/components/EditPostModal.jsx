import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertCircle } = FiIcons;

const EditPostModal = ({ isOpen, onClose, post, onSave, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: ''
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
        image: post.image || ''
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
    try {
      await onSave(post.id, formData);
      onClose();
    } catch (error) {
      alert('Failed to save changes: ' + error.message);
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
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Edit Post</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <SafeIcon icon={FiImage} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="Image URL"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
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
                      className={`flex items-center justify-center px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                        uploadStatus === 'Upload Failed' ? 'border-red-300 text-red-600 bg-red-50' : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {isUploading ? (
                        <span className="animate-pulse">Uploading...</span>
                      ) : uploadStatus.includes('Upload Complete') ? (
                        <><SafeIcon icon={FiCheck} className="mr-2" /> Uploaded</>
                      ) : (
                        <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload</>
                      )}
                    </label>
                  </div>
                </div>
                {formData.image && (
                  <div className="relative h-40 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className={`w-full h-full object-cover transition-opacity ${imageError ? 'opacity-0' : 'opacity-100'}`}
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                    />
                    {imageError && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span className="text-sm">Image preview unavailable</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-vertical"
                required
              />
            </div>
          </form>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="mr-2" />
                  Save Changes
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