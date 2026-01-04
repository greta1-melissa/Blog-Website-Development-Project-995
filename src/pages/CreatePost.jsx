import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { normalizeDropboxUrl, getImageSrc } from '../utils/media.js';

const { FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertTriangle } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useBlog();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imageError, setImageError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: '',
    status: 'draft'
  });

  const categories = ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Product Recommendations', 'Career'];

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

      // CANONICAL ENDPOINT: /api/upload-to-dropbox
      // FORM FIELD: "file"
      const response = await fetch('/api/upload-to-dropbox', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      // CANONICAL CONTRACT: { success: true, proxyUrl: string, name: string }
      if (response.ok && result.success && result.proxyUrl) {
        setFormData(prev => ({ ...prev, image: result.proxyUrl }));
        setUploadStatus('Upload Complete!');
      } else {
        const errorMsg = result.message || "Upload failed. Server did not return a valid proxy URL.";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("[CreatePost] Upload failed:", error);
      setUploadStatus('Upload Failed');
      setErrorMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    
    setErrorMessage('');
    const cleanImage = formData.image ? formData.image.trim() : '';

    // IMAGE PERSISTENCE GUARD
    if (cleanImage) {
      if (cleanImage.includes('dropbox.com/scl')) {
        setErrorMessage("Direct Dropbox links are forbidden. Please use the 'Upload' button to generate a permanent proxy link.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!cleanImage.startsWith('/api/media/dropbox') && !cleanImage.includes('images.unsplash.com')) {
        setErrorMessage("Invalid Image URL. Must be a proxy link (starts with /api/media/dropbox).");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const postId = await addPost({
        ...formData,
        image: cleanImage,
        author: user?.name || 'BangtanMom'
      });
      navigate(formData.status === 'published' ? `/post/${postId}` : '/admin');
    } catch (error) {
      setErrorMessage(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="author">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Share Your Story</h1>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <SafeIcon icon={FiAlertTriangle} className="text-red-500 mr-3 mt-1" />
            <div className="text-red-800 font-medium">
              <p>Error:</p>
              <p className="text-sm font-normal">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-purple-50">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <div className="rounded-lg overflow-hidden border border-gray-300">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(val) => setFormData(p => ({ ...p, content: val }))}
                    className="bg-white min-h-[400px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-purple-50 p-6">
              <h3 className="font-bold mb-4 text-gray-900">Publishing</h3>
              <div className="space-y-4">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Publish Now</option>
                </select>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-70 shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <><SafeIcon icon={FiSave} className="mr-2" /> {formData.status === 'draft' ? 'Save Draft' : 'Save Post'}</>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-purple-50 p-6">
              <h3 className="font-bold mb-4 text-gray-900">Category</h3>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-purple-50 p-6">
              <h3 className="font-bold mb-4 text-gray-900">Featured Image</h3>
              <div className="space-y-4">
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                  placeholder="Image URL..."
                />
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors font-medium text-sm ${
                    uploadStatus.includes('Failed') ? 'border-red-300 text-red-600 bg-red-50' : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {isUploading ? (
                    <span className="animate-pulse">Uploading...</span>
                  ) : uploadStatus.includes('Complete') ? (
                    <><SafeIcon icon={FiCheck} className="mr-2" /> {uploadStatus}</>
                  ) : (
                    <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload File</>
                  )}
                </label>

                {formData.image && (
                  <div className="relative rounded-lg overflow-hidden h-32 w-full border border-gray-200 bg-gray-50">
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
        </form>
      </motion.div>
    </ProtectedRoute>
  );
};

export default CreatePost;