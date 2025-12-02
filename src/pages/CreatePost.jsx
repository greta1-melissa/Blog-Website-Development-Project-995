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

const { FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertCircle } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useBlog();
  const { user } = useAuth();
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

  const categories = ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Product Recommendations'];

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

  // Handler specifically for ReactQuill
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
    if (!formData.title || !formData.content || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    const postData = {
      ...formData,
      image: formData.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
      author: user?.name || 'Anonymous Author'
    };

    try {
      const postId = await addPost(postData);
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error("Save failed:", error);
      alert(`Failed to save post to server: ${error.message}. The post is saved locally but may not be visible to others.`);
      navigate(`/`);
    } finally {
      setIsSaving(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link'
  ];

  return (
    <ProtectedRoute requiredRole="author">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Share Your Story
          </h1>
          <p className="text-lg text-gray-600">
            What's on your heart today? Let's share it with our community 💜
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 border border-purple-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="What's your story about?"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Choose a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <SafeIcon icon={FiImage} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Paste Dropbox link here..."
                />
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center w-full px-4 py-3 border border-dashed rounded-lg cursor-pointer transition-colors font-medium ${
                    uploadStatus === 'Upload Failed' 
                      ? 'border-red-300 text-red-600 bg-red-50' 
                      : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {isUploading ? (
                    <span className="animate-pulse">Uploading...</span>
                  ) : uploadStatus.includes('Upload Complete') ? (
                    <><SafeIcon icon={FiCheck} className="mr-2" /> Uploaded</>
                  ) : uploadStatus === 'Upload Failed' ? (
                    <><SafeIcon icon={FiAlertCircle} className="mr-2" /> Retry Upload</>
                  ) : (
                    <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload Photo</>
                  )}
                </label>
              </div>
            </div>
            {formData.image && (
              <div className="mt-3 relative rounded-lg overflow-hidden h-40 w-full md:w-64 border border-gray-200 bg-gray-50">
                <img
                  src={formData.image}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageError ? 'opacity-0' : 'opacity-100'}`}
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
                {imageError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <SafeIcon icon={FiImage} className="text-3xl mb-1 text-gray-300" />
                    <span className="text-xs">Preview unavailable</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-8">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Your Story *
            </label>
            <div className="rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
              <ReactQuill 
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                formats={quillFormats}
                className="bg-white min-h-[300px]"
                placeholder="Share your thoughts, experiences, or insights..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors shadow-lg shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="mr-2" />
                  Publish Post
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </ProtectedRoute>
  );
};

export default CreatePost;