import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { BLOG_PLACEHOLDER } from '../config/assets';
import { normalizeDropboxUrl } from '../utils/media.js';

const { FiSave, FiImage, FiUploadCloud, FiCheck, FiSearch, FiCalendar, FiChevronDown, FiChevronUp, FiAlertTriangle } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useBlog();
  const { user } = useAuth();
  
  const [sections, setSections] = useState({ seo: true, schedule: true });

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: '',
    focusKeyword: '',
    seoTitle: '',
    metaDescription: '',
    scheduledDate: '',
    scheduledTime: '',
    status: 'draft'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Product Recommendations', 'Career'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'image') {
      // Automatically normalize image URLs on input
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
      
      // Upload to Cloudflare Function
      const response = await fetch('/api/upload-to-dropbox', {
        method: 'POST',
        body: data
      });

      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (result.success) {
          // Success! Use the returned direct URL
          setFormData(prev => ({ ...prev, image: result.url }));
          setUploadStatus('Upload Complete!');
          return;
        } else {
          throw new Error(result.message || "Server upload failed.");
        }
      } 
      
      const errorText = await response.text();
      throw new Error(`Upload Error: ${response.status}. Details: ${errorText.substring(0, 80)}`);

    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus('Upload Failed');
      setErrorMessage(`Upload failed: ${error.message}. Please try a manual URL or local fallback.`);
      
      // Optional: Local Base64 Fallback
      if (window.confirm("Upload failed. Use local image (Base64) instead?")) {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({ ...prev, image: reader.result }));
          setUploadStatus('Saved Locally');
          setErrorMessage('');
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title || !formData.content) {
      alert('Please fill in at least the Title and Content to save.');
      return;
    }

    setIsSaving(true);

    let finalStatus = formData.status;
    let finalDate = new Date().toISOString().split('T')[0];

    if (finalStatus === 'scheduled') {
      if (!formData.scheduledDate) {
        alert('Please select a date for your scheduled post.');
        setIsSaving(false);
        return;
      }
      finalDate = formData.scheduledDate;
    } else if (finalStatus === 'published') {
      // Keep today's date
    } else {
      finalStatus = 'draft';
    }

    // Ensure image_url is included in the payload
    const postData = {
      ...formData,
      image: formData.image || BLOG_PLACEHOLDER,
      image_url: formData.image || BLOG_PLACEHOLDER, // Explicit DB column
      author: user?.name || 'BangtanMom',
      date: finalDate,
      status: finalStatus
    };

    try {
      const postId = await addPost(postData);
      
      if (finalStatus === 'draft') {
        alert('Draft saved successfully!');
        navigate('/admin');
      } else if (finalStatus === 'scheduled') {
        alert(`Post scheduled for ${finalDate}!`);
        navigate('/admin');
      } else {
        alert('Post published!');
        navigate(`/post/${postId}`);
      }
    } catch (error) {
      console.error("Save failed:", error);
      setErrorMessage(`Failed to save post: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  return (
    <ProtectedRoute requiredRole="author">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Share Your Story
          </h1>
          <p className="text-lg text-gray-600">
            Create optimized content for your community 💜
          </p>
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
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-purple-50">
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium"
                  placeholder="Enter a catchy title..."
                  required
                />
              </div>

              <div className="mb-8">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <div className="rounded-lg overflow-hidden border border-gray-300">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={handleContentChange}
                    modules={quillModules}
                    className="bg-white min-h-[400px]"
                    placeholder="Share your thoughts..."
                  />
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-50 overflow-hidden">
              <button type="button" onClick={() => toggleSection('seo')} className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <SafeIcon icon={FiSearch} className="text-purple-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">SEO Optimization</h3>
                </div>
                <SafeIcon icon={sections.seo ? FiChevronUp : FiChevronDown} className="text-gray-500" />
              </button>
              <AnimatePresence>
                {sections.seo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Focus Keyword
                        </label>
                        <input
                          type="text"
                          name="focusKeyword"
                          value={formData.focusKeyword}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="e.g., K-Drama Reviews"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SEO Title
                        </label>
                        <input
                          type="text"
                          name="seoTitle"
                          value={formData.seoTitle}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder={formData.title || "Title tag for search engines"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          name="metaDescription"
                          value={formData.metaDescription}
                          onChange={handleChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                          placeholder="Summary for search results..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publish & Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-50 p-6">
              <div className="flex items-center mb-4 text-purple-800">
                <SafeIcon icon={FiCalendar} className="mr-2" />
                <h3 className="font-bold">Publishing</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Immediately</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>

                {formData.status === 'scheduled' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 bg-purple-50 p-3 rounded-lg border border-purple-100"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Publish Date *</label>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        required={formData.status === 'scheduled'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Publish Time</label>
                      <input
                        type="time"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-70"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      {isSaving ? 'Processing...' : (formData.status === 'draft' ? 'Save Draft' : 'Publish')}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <SafeIcon icon={FiSave} className="mr-2" />
                      {formData.status === 'draft' ? 'Save Draft' : 'Publish'}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-50 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Category</h3>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-50 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Featured Image</h3>
              <div className="space-y-4">
                <div className="relative">
                  <SafeIcon icon={FiImage} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Image URL..."
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
                    className={`flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors font-medium text-sm ${
                      uploadStatus.includes('Failed') 
                        ? 'border-red-300 text-red-600 bg-red-50' 
                        : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {isUploading ? (
                      <span className="animate-pulse">Uploading...</span>
                    ) : uploadStatus.includes('Complete') || uploadStatus.includes('Saved') ? (
                      <><SafeIcon icon={FiCheck} className="mr-2" /> {uploadStatus}</>
                    ) : (
                      <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload File</>
                    )}
                  </label>
                </div>
                
                {formData.image && (
                  <div className="relative rounded-lg overflow-hidden h-32 w-full border border-gray-200 bg-gray-50">
                    <img 
                      src={formData.image} 
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