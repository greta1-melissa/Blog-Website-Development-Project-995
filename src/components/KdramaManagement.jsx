import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useKdrama } from '../contexts/KdramaContext';
import EditKdramaModal from './EditKdramaModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { KDRAMA_PLACEHOLDER } from '../config/assets';

const { FiPlus, FiSearch, FiStar, FiEdit3, FiTrash2, FiExternalLink, FiCheckCircle } = FiIcons;

const KdramaManagement = () => {
  const { kdramas, addKdrama, updateKdrama, deleteKdrama, isLoading } = useKdrama();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrama, setEditingDrama] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const filteredDramas = useMemo(() => {
    return kdramas.filter(drama => 
      drama.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drama.tags && Array.isArray(drama.tags) && drama.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [kdramas, searchTerm]);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAdd = () => {
    setEditingDrama(null);
    setIsModalOpen(true);
  };

  const handleEdit = (drama) => {
    setEditingDrama(drama);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this recommendation?')) {
      try {
        await deleteKdrama(id);
        showToast('Drama removed!');
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  const handleToggleFeatured = async (drama) => {
    try {
      await updateKdrama(drama.id, { is_featured_on_home: drama.is_featured_on_home ? 0 : 1 });
      showToast('Visibility updated!');
    } catch (error) {
      console.error('Failed to update featured status', error);
    }
  };

  const handleSave = async (id, data) => {
    try {
      if (id && !String(id).startsWith('temp-')) {
        await updateKdrama(id, data);
        showToast('Drama updated!');
      } else {
        await addKdrama(data);
        showToast('Drama added!');
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
          <h2 className="text-2xl font-bold text-gray-900">K-Drama Recommendations</h2>
          <p className="text-sm text-gray-500">Curate your favorite shows for the community</p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 font-bold">
          <SafeIcon icon={FiPlus} className="mr-2" /> Add New Drama
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by title or tags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Drama</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Home Feature</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading dramas...</td></tr>
              ) : filteredDramas.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No dramas found.</td></tr>
              ) : (
                filteredDramas.map((drama) => (
                  <tr key={drama.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-16 rounded-lg overflow-hidden mr-4 bg-gray-100 border border-gray-100">
                          <SafeImage src={drama.image_url || drama.image} alt="" fallback={KDRAMA_PLACEHOLDER} className="w-full h-full object-cover" />
                        </div>
                        <div className="max-w-xs">
                          <div className="text-sm font-bold text-gray-900 truncate">{drama.title}</div>
                          <div className="text-[10px] text-gray-400">Slug: {drama.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {drama.tags && Array.isArray(drama.tags) && drama.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleToggleFeatured(drama)} className={`text-xl transition-colors ${drama.is_featured_on_home ? 'text-yellow-400' : 'text-gray-200 hover:text-gray-300'}`}>
                        <SafeIcon icon={FiStar} className={drama.is_featured_on_home ? 'fill-current' : ''} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <a href={`#/kdrama-recommendations/${drama.slug}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors inline-block"><SafeIcon icon={FiExternalLink} /></a>
                      <button onClick={() => handleEdit(drama)} className="text-gray-400 hover:text-purple-600 transition-colors"><SafeIcon icon={FiEdit3} /></button>
                      <button onClick={() => handleDelete(drama.id)} className="text-gray-400 hover:text-red-500 transition-colors"><SafeIcon icon={FiTrash2} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditKdramaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} drama={editingDrama} onSave={handleSave} />
    </div>
  );
};

export default KdramaManagement;