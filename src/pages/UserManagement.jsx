import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ncbCreate, ncbDelete, ncbUpdate } from '../services/nocodebackendClient';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { formatDate } from '../utils/dateUtils';

const { FiUsers, FiEdit, FiTrash2, FiUserPlus, FiSearch, FiShield, FiEdit3, FiEye } = FiIcons;

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '', role: 'subscriber' });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ncb/read/users');
      const json = await res.json();
      
      let userData = Array.isArray(json.data) ? json.data : [];
      
      // MOCK FALLBACK DATA (Including the 2 requested accounts)
      if (userData.length < 3) {
        userData = [
          {
            id: 'admin-1',
            name: 'BangtanMom',
            email: 'bangtanmom@bangtanmom.com',
            username: 'bangtanmom',
            role: 'admin',
            status: 'active',
            joinDate: '2024-01-01',
            lastLogin: new Date().toISOString()
          },
          {
            id: 'mock-author-123',
            name: 'Chloe Park',
            email: 'author@test.com',
            username: 'chloepark',
            role: 'author',
            status: 'active',
            joinDate: '2024-03-10',
            lastLogin: '2024-12-01'
          },
          {
            id: 'mock-subscriber-456',
            name: 'Min-ji Kim',
            email: 'subscriber@test.com',
            username: 'minjikim',
            role: 'subscriber',
            status: 'active',
            joinDate: '2024-03-12',
            lastLogin: '2024-12-02'
          }
        ];
      }
      setUsers(userData);
    } catch (error) {
      console.error("UserManagement fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === '' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      await ncbUpdate('users', userId, { role: newRole });
    } catch (err) { console.error(err); }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-fuchsia-100 text-fuchsia-800';
      case 'author': return 'bg-violet-100 text-violet-800';
      case 'subscriber': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return FiShield;
      case 'author': return FiEdit3;
      case 'subscriber': return FiEye;
      default: return FiUsers;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">User Management</h2>
        <button onClick={() => setShowAddUser(true)} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-lg shadow-purple-200">
          <SafeIcon icon={FiUserPlus} className="mr-2" /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="md:w-48 px-4 py-3 border border-gray-200 rounded-xl outline-none text-sm bg-white">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="author">Author</option>
          <option value="subscriber">Subscriber</option>
        </select>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">Syncing user database...</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3 border border-purple-200">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                        <div className="text-[11px] text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border-0 cursor-pointer ${getRoleColor(user.role)}`}
                      disabled={user.email === 'bangtanmom@bangtanmom.com'}
                    >
                      <option value="subscriber">Subscriber</option>
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">{formatDate(user.joinDate)}</td>
                  <td className="px-6 py-5 text-right space-x-3">
                    <button className="text-gray-400 hover:text-purple-600 transition-colors"><SafeIcon icon={FiEdit} /></button>
                    {user.email !== 'bangtanmom@bangtanmom.com' && (
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><SafeIcon icon={FiTrash2} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;