import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { PLACEHOLDER_IMAGE } from '../config/assets';
import { useAuth } from '../contexts/AuthContext';
import { normalizeDropboxSharedUrl } from '../utils/dropboxLink';

const { FiX, FiSave, FiImage, FiUploadCloud, FiStar, FiAlertTriangle, FiShoppingBag } = FiIcons;

const EditProductModal = ({ isOpen, onClose, product, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    subcategory: 'General',
    rating: 5,
    content: '',
    image: '',
    status: 'published'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        subcategory: product.subcategory || 'General',
        rating: product.rating || 5,
        content: product.content || '',
        image: product.image || product.image_url || '',
        status: product.status || 'published'
      });
      setErrorMessage('');
    } else {
      setFormData({
        title: '',
        subcategory: 'General',
        rating: 5,
        content: '',
        image: '',
        status: 'published'
      });
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = name === 'rating' ? parseInt(value) : value;
    if (name === 'image' && typeof finalValue === 'string') {
      finalValue = normalizeDropboxSharedUrl(finalValue);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload-to-dropbox', { method: 'POST', body: data });
      const result = await res.json();
      if (res.ok && result.success) {
        setFormData(prev => ({ ...prev, image: result.proxyUrl }));
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      await onSave(product?.id, {
        ...formData,
        author: user?.name || 'BangtanMom',
        date: product?.date || new Date().toISOString()
      });
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <SafeIcon icon={FiShoppingBag} className="mr-2 text-purple-600" />
              {product ? 'Edit Product Recommendation' : 'New Product Recommendation'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <SafeIcon icon={FiX} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-sm">
                <SafeIcon icon={FiAlertTriangle} className="mr-2" /> {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Product Name *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" required placeholder="e.g. Lavender Sleep Mist" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Subcategory</label>
                    <input type="text" name="subcategory" value={formData.subcategory} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder="Skincare, Tech, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Star Rating (1-5)</label>
                    <select name="rating" value={formData.rating} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm">
                      {[5, 4, 3, 2, 1].map(num => (
                        <option key={num} value={num}>{num} Stars</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Product Image</label>
                  <div className="space-y-3">
                    <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="Image URL..." className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                    <div className="relative">
                      <input type="file" id="product-upload" onChange={handleFileUpload} className="hidden" accept="image/*" />
                      <label htmlFor="product-upload" className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-purple-300 text-purple-600 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors text-sm font-medium">
                        {isUploading ? <span className="animate-pulse">Uploading...</span> : <><SafeIcon icon={FiUploadCloud} className="mr-2" /> Upload Photo</>}
                      </label>
                    </div>
                    {formData.image && (
                      <div className="h-32 w-full rounded-xl overflow-hidden border border-gray-200 bg-white">
                        <SafeImage src={formData.image} alt="Preview" fallback={PLACEHOLDER_IMAGE} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Review / Description *</label>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData(p => ({ ...p, content: val }))} className="bg-white min-h-[300px]" />
              </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-white rounded-xl border border-gray-200 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isSaving} className="px-10 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 transition-all flex items-center" >
              {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> : <SafeIcon icon={FiSave} className="mr-2" />}
              {product ? 'Update Recommendation' : 'Publish Recommendation'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditProductModal;