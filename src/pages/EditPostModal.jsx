import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { BLOG_PLACEHOLDER } from '../config/assets';

const { FiX, FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertTriangle } = FiIcons;

const EditPostModal = ({ isOpen, onClose, post, onSave, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        category: post.category || '',
        image: post.image || post.image_url || ''
      });
      setUploadStatus('');
      setErrorMessage('');
    }
  }, [post, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        // Store proxy URL only
        setFormData(prev => ({ ...prev, image: result.proxyUrl }));
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

    setErrorMessage('');
    const cleanImage = formData.image ? formData.image.trim() : '';

    setIsSaving(true);
    try {
      await onSave(post.id, { ...formData, image: cleanImage });
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
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <div className="rounded-lg overflow-hidden border border-gray-300">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.content} 
                      onChange={(val) => setFormData(p => ({ ...p, content: val }))}
                      className="bg-white min-h-[300px]"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Settings</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white text-sm"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
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
                          placeholder="Image URL..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none text-sm bg-white"
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
                          className={`flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors whitespace-nowrap text-sm bg-white border-purple-300 text-purple-600 hover:bg-purple-50`}
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
                      <div className="relative h-40 w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                        <SafeImage 
                          src={formData.image} 
                          alt="Preview" 
                          fallback={BLOG_PLACEHOLDER}
                          className="w-full h-full object-cover"
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
              className="flex items-center px-8 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
              {isSaving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> Saving...</>
              ) : (
                <><SafeIcon icon={FiSave} className="mr-2" /> Save Changes</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPostModal;