import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { Link } from 'react-router-dom';
import { LOGO_URL as logo } from '../config/assets';

const { FiHeart, FiInstagram, FiTwitter, FiYoutube } = FiIcons;

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Brand, Bio, Socials, and Safe Space Promise */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <SafeImage src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-serif font-bold text-gray-900">BangtanMom</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Navigating motherhood with a little bit of chaos, a lot of love, and the perfect K-Pop playlist.
            </p>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-colors">
                <SafeIcon icon={FiInstagram} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors">
                <SafeIcon icon={FiTwitter} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors">
                <SafeIcon icon={FiYoutube} />
              </a>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100/50">
              <p className="text-[11px] text-purple-800 leading-relaxed font-medium">
                This is a safe space for moms, ARMY, and anyone who needs a gentle corner of the internet. 💜
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Explore</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-purple-600 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-purple-600 transition-colors">Our Story</Link></li>
              <li><Link to="/forums" className="hover:text-purple-600 transition-colors">Community Forum</Link></li>
              <li><Link to="/kdrama-recommendations" className="hover:text-purple-600 transition-colors">K-Drama Reviews</Link></li>
              <li><Link to="/products" className="hover:text-purple-600 transition-colors">Product Picks</Link></li>
              <li><Link to="/contact" className="hover:text-purple-600 transition-colors">Get in Touch</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal & Privacy */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Legal & Privacy</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/safe-space-promise" className="hover:text-purple-600 transition-colors">Safe Space Promise</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-purple-600 transition-colors">Terms & Conditions</Link></li>
            </ul>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                Affiliate Disclosure: Some links may be affiliate links, meaning I earn a small commission at no extra cost to you.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Bangtan Mom. All rights reserved.</p>
          <p className="flex items-center">
            Made with <SafeIcon icon={FiHeart} className="inline text-purple-500 mx-1" /> by Melissa
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;