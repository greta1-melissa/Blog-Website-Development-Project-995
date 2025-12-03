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

const { FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertCircle, FiSearch, FiCalendar, FiClock, FiChevronDown, FiChevronUp, FiGlobe } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useBlog();
  const { user } = useAuth();
  
  // Tab states for sections
  const [sections, setSections] = useState({
    seo: true,
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
    status: 'published' // 'published', 'draft', 'scheduled'
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

    // Determine Status and Date
    let finalStatus = formData.status;
    let finalDate = new Date().toISOString().split('T')[0];

    if (formData.scheduledDate) {
      finalDate = formData.scheduledDate; // Format: YYYY-MM-DD
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime || '00:00'}`);
      
      if (scheduledDateTime > new Date()) {
        finalStatus = 'scheduled';
      }
    }

    const postData = {
      ...formData,
      image: formData.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
      author: user?.name || 'Anonymous Author',
      date: finalDate,
      status: finalStatus
    };

    try {
      const postId = await addPost(postData);
      
      if (finalStatus === 'scheduled') {
        alert(`Post scheduled for ${finalDate}!`);
        navigate('/admin'); // Redirect to admin to see scheduled post
      } else {
        navigate(`/post/${postId}`);
      }
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
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
                <div className="rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={handleContentChange}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white min-h-[400px]"
                    placeholder="Share your thoughts..."
                  />
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-50 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('seo')}
                className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
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
                        <p className="text-xs text-gray-500 mt-1">The main phrase you want this post to rank for.</p>
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
                        <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${formData.seoTitle.length > 60 ? 'bg-red-400' : 'bg-green-400'}`}
                            style={{ width: `${Math.min((formData.seoTitle.length / 60) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>Recommended: 50-60 characters</span>
                          <span>{formData.seoTitle.length} chars</span>
                        </p>
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
                        <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${formData.metaDescription.length > 160 ? 'bg-red-400' : 'bg-green-400'}`}
                            style={{ width: `${Math.min((formData.metaDescription.length / 160) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>Recommended: 150-160 characters</span>
                          <span>{formData.metaDescription.length} chars</span>
                        </p>
                      </div>
                      
                      {/* SERP Preview */}
                      <div className="bg-white border border-gray-200 p-4 rounded-lg">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Google Preview</h4>
                        <div className="font-sans">
                          <div className="text-sm text-gray-800 flex items-center mb-1">
                            <span className="bg-gray-100 rounded-full p-1 mr-2"><SafeIcon icon={FiGlobe} className="text-gray-500 text-xs"/></span>
                            <span>bangtanmom.com › post</span>
                          </div>
                          <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-medium">
                            {formData.seoTitle || formData.title || "Your Post Title"}
                          </div>
                          <div className="text-sm text-[#4d5156] line-clamp-2">
                            {formData.metaDescription || "This is how your post description will appear in search engine results. Make it catchy and relevant to your focus keyword!"}
                          </div>
                        </div>
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
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="draft">Save as Draft</option>
                    <option value="scheduled">Schedule</option>
                  </select>
                </div>

                {formData.status === 'scheduled' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 bg-purple-50 p-3 rounded-lg"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                      <input 
                        type="date" 
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Time</label>
                      <input 
                        type="time" 
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <SafeIcon icon={FiSave} className="mr-2" />
                      {formData.status === 'scheduled' ? 'Schedule Post' : 'Publish Post'}
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
                    className={`flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors font-medium text-sm ${uploadStatus === 'Upload Failed' ? 'border-red-300 text-red-600 bg-red-50' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
                  >
                    {isUploading ? (
                      <span className="animate-pulse">Uploading...</span>
                    ) : uploadStatus.includes('Upload Complete') ? (
                      <><SafeIcon icon={FiCheck} className="mr-2" /> Uploaded</>
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