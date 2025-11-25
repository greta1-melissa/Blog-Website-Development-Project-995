import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch } = FiIcons;

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
      <div className="relative flex items-center bg-white rounded-xl shadow-sm">
        <div className="pl-4 text-gray-400 group-focus-within:text-purple-500 transition-colors">
          <SafeIcon icon={FiSearch} className="text-xl" />
        </div>
        <input
          type="text"
          placeholder="Search posts, authors, or tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-3 pr-4 py-4 bg-transparent border-none rounded-xl focus:ring-0 text-gray-700 placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default SearchBar;