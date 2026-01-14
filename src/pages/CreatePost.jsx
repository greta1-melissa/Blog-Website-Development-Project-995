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
import SafeImage from '../common/SafeImage';
import { BLOG_PLACEHOLDER } from '../config/assets';
import { normalizeDropboxSharedUrl } from '../utils/dropboxLink';
import { generateSlug } from '../utils/slugUtils';

const { FiSave, FiImage, FiUploadCloud, FiCheck, FiAlertTriangle, FiSearch, FiChevronDown, FiChevronUp } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useBlog();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: '',
    status: 'published',
    // SEO Fields
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_image_url: '',
    canonical_url: '',
    noindex: false
  });

  const categories = ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Career'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Normalize Dropbox links
    if (name === 'image' && typeof finalValue === 'string') {
      finalValue = normalizeDropboxSharedUrl(finalValue);
    }

    setFormData({ ...formData, [name]: finalValue });
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
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      setErrorMessage('Please fill in all required fields (Title, Content, and Category)');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);
    
    try {
      const cleanImage = formData.image ? formData.image.trim() : '';
      const slug = generateSlug(formData.title);
      
      const postData = {
        ...formData,
        slug,
        image: cleanImage,
        author: user?.name || 'BangtanMom',
        date: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const createdPost = await addPost(postData);
      
      // If addPost returns the whole object or just ID
      const targetId = createdPost?.id || createdPost;
      
      if (targetId) {
        navigate(`/post/${targetId}`);
      } else {
        navigate('/blogs');
      }
    } catch (error) {
      console.error("CreatePost submission error:", error);
      setErrorMessage(`Failed to save: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="author">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Share Your Story</h1>
          <p className="text-gray-500">Create a new blog post for your community.</p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <SafeIcon icon={FiAlertTriangle} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
            <div className="text-red-800">
              <p className="font-bold text-sm">Action Required</p>
              <p className="text-xs opacity-90">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="mb-6">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Post Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Enter a catchy title..."
                  value={formData.title} 
                  onChange={handleChange} 
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg font-bold" 
                  required 
                />
              </div>
              <div className="mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Story Content *</label>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(val) => setFormData(p => ({ ...p, content: val }))} 
                    className="bg-white min-h-[400px]" 
                  />
                </div>
              </div>

              {/* SEO Section */}
              <div className="border-t border-gray-100 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowSeo(!showSeo)}
                  className="flex items-center justify-between w-full py-2 text-left group"
                >
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiSearch} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Search Engine Optimization (SEO)</span>
                  </div>
                  <SafeIcon icon={showSeo ? FiChevronUp : FiChevronDown} className="text-gray-400" />
                </button>
                
                {showSeo && (
                  <div className="mt-6 space-y-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SEO Title</label>
                      <input 
                        type="text" 
                        name="seo_title" 
                        value={formData.seo_title} 
                        onChange={handleChange} 
                        placeholder="Meta title (defaults to post title)"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SEO Description</label>
                      <textarea 
                        name="seo_description" 
                        value={formData.seo_description} 
                        onChange={handleChange} 
                        rows="3"
                        placeholder="Meta description for search results"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SEO Keywords</label>
                      <input 
                        type="text" 
                        name="seo_keywords" 
                        value={formData.seo_keywords} 
                        onChange={handleChange} 
                        placeholder="k-pop, bts, lifestyle (comma separated)"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Canonical URL</label>
                        <input 
                          type="url" 
                          name="canonical_url" 
                          value={formData.canonical_url} 
                          onChange={handleChange} 
                          placeholder="https://example.com/original-post"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" 
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="noindex" 
                            checked={formData.noindex} 
                            onChange={handleChange} 
                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" 
                          />
                          <span className="text-sm font-medium text-gray-700">Hide from search engines (noindex)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Publishing</h3>
              <div className="space-y-4">
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full flex items-center justify-center px-6 py-4 bg-purple-600 text-white font-bold rounded-xl disabled:opacity-70 shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all hover:-translate-y-0.5"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <><SafeIcon icon={FiSave} className="mr-2" /> Publish Story</>
                  )}
                </button>
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-xs font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Category</h3>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 text-sm font-medium" 
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Cover Image</h3>
              <div className="space-y-4">
                <div className="relative">
                  <SafeIcon icon={FiImage} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="url" 
                    name="image" 
                    value={formData.image} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50" 
                    placeholder="Paste image URL..." 
                  />
                </div>
                
                <div className="relative">
                  <input type="file" id="file-upload" onChange={handleFileUpload} className="hidden" accept="image/*" />
                  <label htmlFor="file-upload" className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-purple-200 rounded-xl cursor-pointer transition-all font-bold text-sm text-purple-600 hover:bg-purple-50 hover:border-purple-300">
                    {isUploading ? (
                      <span className="animate-pulse">Uploading...</span>
                    ) : uploadStatus.includes('Complete') ? (
                      <><SafeIcon icon={FiCheck} className="mr-2" /> Uploaded!</>
                    ) : (
                      <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload from Device</>
                    )}
                  </label>
                </div>

                {formData.image && (
                  <div className="relative rounded-xl overflow-hidden aspect-video w-full border border-gray-100 bg-gray-50 shadow-inner">
                    <SafeImage src={formData.image} alt="Preview" fallback={BLOG_PLACEHOLDER} className="w-full h-full object-cover" />
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