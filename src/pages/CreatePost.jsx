import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast, { Toaster } from 'react-hot-toast';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { BLOG_PLACEHOLDER } from '../config/assets';
import { normalizeDropboxSharedUrl } from '../utils/dropboxLink';
import { generateSlug, ensureUniqueSlug } from '../utils/slugUtils';
import { quillModules, quillFormats, editorStyles } from '../utils/editorConfig';

const { FiSave, FiImage, FiUploadCloud, FiTag, FiAlertTriangle, FiSearch, FiChevronDown, FiChevronUp, FiEye, FiEyeOff } = FiIcons;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost, posts } = useBlog();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    excerpt: '',
    image: '',
    status: 'published',
    seo_title: '',
    meta_description: '',
    focus_keyword: '',
    og_image_url: '',
    canonical_url: '',
    noindex: false
  });

  const categories = ['Health', 'Fam Bam', 'K-Drama', 'BTS', 'Career'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'image' && typeof finalValue === 'string') {
      finalValue = normalizeDropboxSharedUrl(finalValue);
    }
    setFormData({ ...formData, [name]: finalValue });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
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
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      setErrorMessage(`Upload failed: ${error.message}`);
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      setErrorMessage('Please fill in Title, Content, and Category');
      toast.error('Please fill in all required fields');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);
    
    try {
      // GUARANTEE UNIQUE SLUG
      const baseSlug = generateSlug(formData.title);
      const finalSlug = ensureUniqueSlug(baseSlug, posts);

      const postData = {
        ...formData,
        slug: finalSlug,
        author: user?.name || 'BangtanMom'
      };

      const createdPost = await addPost(postData);
      toast.success(formData.status === 'published' ? 'Story published successfully!' : 'Draft saved successfully!');
      
      const targetId = createdPost?.id || createdPost;
      setTimeout(() => navigate(targetId ? `/post/${targetId}` : '/blogs'), 1500);
    } catch (error) {
      // Detailed error reporting
      const detail = error.upstreamBody ? `\nStatus: ${error.status}\nNCB Error: ${error.upstreamBody}` : '';
      const fullError = `${error.message}${detail}`;
      setErrorMessage(fullError);
      toast.error(`Save failed: ${error.upstreamBody || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="author">
      <Toaster position="top-right" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Share Your Story</h1>
          <p className="text-gray-500">Create a new blog post for your community.</p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start">
            <SafeIcon icon={FiAlertTriangle} className="text-red-500 mr-4 mt-1 flex-shrink-0 text-xl" />
            <div className="text-red-800 text-sm overflow-hidden flex-1">
              <p className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-60">Database Error Details</p>
              <pre className="whitespace-pre-wrap font-mono text-xs bg-red-100/50 p-3 rounded-lg border border-red-200/50">{errorMessage}</pre>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="mb-6">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Post Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg font-bold" required />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Short Excerpt (Summary)</label>
                <textarea 
                  name="excerpt" 
                  value={formData.excerpt} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm leading-relaxed" 
                  placeholder="A brief summary of your story for the blog cards..."
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Story Content *</label>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(val) => setFormData(p => ({ ...p, content: val }))} 
                    modules={quillModules}
                    formats={quillFormats}
                    className={editorStyles} 
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <button type="button" onClick={() => setShowSeo(!showSeo)} className="flex items-center justify-between w-full py-2 text-left group">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiSearch} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">SEO Settings</span>
                  </div>
                  <SafeIcon icon={showSeo ? FiChevronUp : FiChevronDown} className="text-gray-400" />
                </button>
                
                {showSeo && (
                  <div className="mt-6 space-y-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SEO Title</label>
                        <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="Fallback: Post Title" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Focus Keyword</label>
                        <input type="text" name="focus_keyword" value={formData.focus_keyword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="e.g. BTS lifestyle" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Meta Description</label>
                      <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="Fallback: Excerpt or first 160 chars" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                      <input type="checkbox" id="noindex_toggle" name="noindex" checked={!formData.noindex} onChange={(e) => setFormData(prev => ({ ...prev, noindex: !e.target.checked }))} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                      <label htmlFor="noindex_toggle" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                        <SafeIcon icon={!formData.noindex ? FiEye : FiEyeOff} className="mr-2 text-gray-400" />
                        Index this page? (Recommended: ON)
                      </label>
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
                <button type="submit" disabled={isSaving} className="w-full flex items-center justify-center px-6 py-4 bg-purple-600 text-white font-bold rounded-xl disabled:opacity-70 shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all hover:-translate-y-0.5">
                  {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" /> : <><SafeIcon icon={FiSave} className="mr-2" /> Publish Story</>}
                </button>
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-xs font-bold">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Category</h3>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 text-sm font-medium" required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Tags</h3>
              <div className="relative">
                <SafeIcon icon={FiTag} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  name="tags" 
                  value={formData.tags} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50 text-sm font-medium" 
                  placeholder="Comma separated tags..." 
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium italic">e.g. BTS, Health, Lifestyle</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Cover Image</h3>
              <div className="space-y-4">
                <input type="url" name="image" value={formData.image} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50" placeholder="Paste image URL..." />
                <div className="relative">
                  <input type="file" id="file-upload" onChange={handleFileUpload} className="hidden" accept="image/*" />
                  <label htmlFor="file-upload" className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-purple-200 rounded-xl cursor-pointer transition-all font-bold text-sm text-purple-600 hover:bg-purple-50">
                    {isUploading ? <span className="animate-pulse">Uploading...</span> : <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload from Device</>}
                  </label>
                </div>
                {formData.image && (
                  <div className="relative rounded-xl overflow-hidden aspect-video w-full border border-gray-100 shadow-inner">
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