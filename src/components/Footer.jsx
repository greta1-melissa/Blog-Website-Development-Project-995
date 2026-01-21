import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { Link } from 'react-router-dom';
import { LOGO_URL } from '../config/assets';

const { FiMail, FiInstagram, FiTwitter, FiHeart, FiShield, FiLock } = FiIcons;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <SafeImage src={LOGO_URL} alt="BangtanMom Logo" className="w-10 h-10" />
              <span className="text-2xl font-black tracking-tighter text-gray-900 font-serif">BangtanMom</span>
            </Link>
            <p className="text-gray-500 leading-relaxed">
              Charting the beautiful chaos of motherhood through the lens of a BTS fan. Finding magic in the mundane and melody in the motherhood.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300">
                <SafeIcon icon={FiInstagram} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300">
                <SafeIcon icon={FiTwitter} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300">
                <SafeIcon icon={FiMail} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/blogs" className="text-gray-500 hover:text-purple-600 transition-colors">Our Stories</Link></li>
              <li><Link to="/kdrama-recommendations" className="text-gray-500 hover:text-purple-600 transition-colors">K-Drama Picks</Link></li>
              <li><Link to="/product-recommendations" className="text-gray-500 hover:text-purple-600 transition-colors">Me-Time Rituals</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-purple-600 transition-colors">The Story Behind</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal & Admin */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6">Legal & Privacy</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy-policy" className="text-gray-500 hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-purple-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/safe-space-promise" className="text-gray-500 hover:text-purple-600 transition-colors">Safe Space Promise</Link></li>
              <li>
                <Link to="/admin" className="inline-flex items-center text-gray-400 hover:text-purple-600 transition-colors text-sm font-medium mt-4">
                  <SafeIcon icon={FiLock} className="mr-2" /> Admin Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="bg-purple-50 p-8 rounded-3xl">
            <h4 className="text-purple-900 font-bold mb-4 flex items-center">
              <SafeIcon icon={FiHeart} className="mr-2" /> Stay Connected
            </h4>
            <p className="text-purple-700/70 text-sm mb-6">Join our community for weekly doses of comfort and K-content.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-3 rounded-xl bg-white border-transparent focus:ring-2 focus:ring-purple-400 outline-none text-sm"
              />
              <button className="mt-3 w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-100 flex flex-col md:row justify-between items-center text-gray-400 text-sm">
          <p>© {currentYear} BangtanMom. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0">
            <SafeIcon icon={FiShield} className="mr-2 text-purple-400" />
            <span>A Safe Space for Every Mom</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;