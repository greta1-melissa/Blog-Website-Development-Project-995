import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBlog } from '../contexts/BlogContext';
import EditProductModal from './EditProductModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { PLACEHOLDER_IMAGE } from '../config/assets';
import { formatDate } from '../utils/dateUtils';

const { FiPlus, FiSearch, FiStar, FiEdit3, FiTrash2, FiExternalLink, FiCheckCircle, FiShoppingBag } = FiIcons;

const ProductManagement = () => {
  const { posts, addPost, updatePost, deletePost, isLoading } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const productPosts = useMemo(() => {
    return posts.filter(post => 
      (post.category || '').trim() === 'Product Recommendations' &&
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (post.subcategory || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [posts, searchTerm]);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product recommendation?')) {
      try {
        await deletePost(id);
        showToast('Product removed successfully!');
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleSave = async (id, data) => {
    const payload = {
      ...data,
      category: 'Product Recommendations' 
    };
    
    try {
      if (id) {
        await updatePost(id, payload);
        showToast('Product updated successfully!');
      } else {
        await addPost(payload);
        showToast('Product recommendation added!');
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-24 right-8 z-[60] bg-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center">
          <SafeIcon icon={FiCheckCircle} className="mr-2" /> {successMsg}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Recommendations</h2>
          <p className="text-sm text-gray-500">Manage your curated shopping picks and reviews</p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 font-bold">
          <SafeIcon icon={FiPlus} className="mr-2" /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by product name or subcategory..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subcategory</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading products...</td></tr>
              ) : productPosts.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No product recommendations found.</td></tr>
              ) : (
                productPosts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 bg-gray-100 border border-gray-100">
                          <SafeImage src={product.image || product.image_url} alt="" fallback={PLACEHOLDER_IMAGE} className="w-full h-full object-cover" />
                        </div>
                        <div className="max-w-xs">
                          <div className="text-sm font-bold text-gray-900 truncate">{product.title}</div>
                          <div className="text-[10px] text-gray-400">{formatDate(product.date)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                        {product.subcategory || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center text-yellow-400">
                        <SafeIcon icon={FiStar} className="fill-current mr-1 text-xs" />
                        <span className="text-sm font-bold text-gray-700">{product.rating || 5}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <a href={`#/post/${product.id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors inline-block"><SafeIcon icon={FiExternalLink} /></a>
                      <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-purple-600 transition-colors"><SafeIcon icon={FiEdit3} /></button>
                      <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500 transition-colors"><SafeIcon icon={FiTrash2} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={editingProduct} 
        onSave={handleSave} 
      />
    </div>
  );
};

export default ProductManagement;