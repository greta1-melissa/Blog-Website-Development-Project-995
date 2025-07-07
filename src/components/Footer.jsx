import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHeart, FiInstagram, FiTwitter, FiYoutube } = FiIcons;

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiHeart} className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold">Bangtan Mom</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              A personal space where I share my journey as a mom, wellness tips, family moments, 
              and my love for BTS and K-culture. Join me in navigating the beautiful chaos of motherhood.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <SafeIcon icon={FiInstagram} className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <SafeIcon icon={FiTwitter} className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <SafeIcon icon={FiYoutube} className="text-xl" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Write</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Me</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Health & Wellness</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fam Bam</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">K-Drama Reviews</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">BTS & K-Pop</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Product Recommendations</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center">
            Made with <SafeIcon icon={FiHeart} className="text-purple-500 mx-1" /> by Melissa
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;