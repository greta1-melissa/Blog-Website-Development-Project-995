import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBlog } from '../contexts/BlogContext';
import EditProductModal from './EditProductModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { PLACEHOLDER_IMAGE } from '../config/assets';
import { formatDate } from '../utils/dateUtils';

const { FiPlus, FiSearch, FiStar, FiEdit3, FiTrash2, FiExternalLink, FiCheckCircle, FiShoppingBag } = FiIcons;

const ProductManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.subcategory || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleSave = async (id, data) => {
    try {
      if (id && !String(id).startsWith('p')) { // Check if it's a real DB ID (seeds start with 'p')
        await updateProduct(id, data);
        toast.success('Updated successfully!');
      } else {
        await addProduct(data);
        toast.success('Published successfully!');
      }
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Deleted successfully!');
      } catch (err) {
        toast.error(`Delete failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Recommendations</h2>
          <p className="text-sm text-gray-500">Manage your curated picks in the dedicated products table</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold">
          <SafeIcon icon={FiPlus} className="mr-2" /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search product name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
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
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No products found.</td></tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 bg-gray-100 border">
                        <SafeImage src={product.image} fallback={PLACEHOLDER_IMAGE} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{product.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg uppercase">{product.subcategory || 'General'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center text-yellow-400">
                      <SafeIcon icon={FiStar} className="fill-current mr-1 text-xs" />
                      <span className="text-sm font-bold text-gray-700">{product.rating || 5}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="text-gray-400 hover:text-purple-600"><SafeIcon icon={FiEdit3} /></button>
                    <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500"><SafeIcon icon={FiTrash2} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <EditProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={editingProduct} onSave={handleSave} />
    </div>
  );
};

export default ProductManagement;