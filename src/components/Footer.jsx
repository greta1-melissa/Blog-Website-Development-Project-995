import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { Link } from 'react-router-dom';
import { LOGO_URL as logo } from '../config/assets';

const { FiHeart, FiInstagram, FiTwitter, FiYoutube } = FiIcons;

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <img src={logo} alt="BangtanMom" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-serif font-bold text-gray-900">BangtanMom</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Navigating motherhood with a little bit of chaos, a lot of love, and the perfect K-Pop playlist.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                <SafeIcon icon={FiInstagram} className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                <SafeIcon icon={FiTwitter} className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                <SafeIcon icon={FiYoutube} className="text-lg" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6">Explore</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-purple-600 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-purple-600 transition-colors">Our Story</Link></li>
              <li><Link to="/forums" className="hover:text-purple-600 transition-colors">Community Forums</Link></li>
              <li><Link to="/products" className="hover:text-purple-600 transition-colors">Shop Favorites</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6">Categories</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/?category=Health" className="hover:text-purple-600 transition-colors">Health & Wellness</Link></li>
              <li><Link to="/?category=Fam%20Bam" className="hover:text-purple-600 transition-colors">Family Life</Link></li>
              <li><Link to="/?category=K-Drama" className="hover:text-purple-600 transition-colors">K-Drama Reviews</Link></li>
              <li><Link to="/?category=BTS" className="hover:text-purple-600 transition-colors">BTS Army</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Cookie Policy</a></li>
              <li><Link to="/contact" className="hover:text-purple-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Bangtan Mom. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center">
            Made with <SafeIcon icon={FiHeart} className="text-purple-500 mx-1.5" /> by Melissa
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;