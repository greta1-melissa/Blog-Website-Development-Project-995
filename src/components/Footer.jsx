import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { Link } from 'react-router-dom';
import { LOGO_URL as logo } from '../config/assets';

const { FiHeart, FiInstagram, FiTwitter, FiYoutube, FiLock } = FiIcons;

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-16">
          {/* Column 1: Brand & Socials */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <SafeImage src={logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-2xl font-serif font-bold text-gray-900">BangtanMom</span>
            </Link>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              Navigating motherhood with a little bit of chaos, a lot of love, and the perfect K-Pop playlist.
            </p>
            <div className="flex space-x-5 mb-8">
              <a href="#" className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all transform hover:scale-110">
                <SafeIcon icon={FiInstagram} className="text-xl" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-all transform hover:scale-110">
                <SafeIcon icon={FiTwitter} className="text-xl" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-all transform hover:scale-110">
                <SafeIcon icon={FiYoutube} className="text-xl" />
              </a>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100/50">
              <p className="text-sm text-purple-800 leading-relaxed font-semibold text-center">
                This is a safe space for moms, ARMY, and anyone who needs a gentle corner of the internet. 💜
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div id="footer-explore">
            <h3 className="text-xl font-bold text-gray-900 mb-8 font-serif">Explore</h3>
            <ul className="space-y-4 text-base text-gray-600 font-medium">
              <li><Link to="/" className="hover:text-purple-600 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-purple-600 transition-colors">Our Story</Link></li>
              <li><Link to="/forums" className="hover:text-purple-600 transition-colors">Community Forum</Link></li>
              <li><Link to="/kdrama-recommendations" className="hover:text-purple-600 transition-colors">K-Drama Reviews</Link></li>
              <li><Link to="/products" className="hover:text-purple-600 transition-colors">Product Picks</Link></li>
              <li><Link to="/contact" className="hover:text-purple-600 transition-colors">Get in Touch</Link></li>
              
              {/* ADMIN ACCESS - Reinforced Visibility */}
              <li className="pt-6 mt-6 border-t border-gray-100">
                <Link 
                  to="/admin-login" 
                  className="flex items-center text-sm text-purple-600 hover:text-purple-800 transition-all group font-bold uppercase tracking-widest bg-purple-50 py-2 px-3 rounded-lg inline-flex"
                >
                  <SafeIcon icon={FiLock} className="mr-2 transform group-hover:scale-110 transition-transform" />
                  <span>Admin Access</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Privacy */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-8 font-serif">Legal & Privacy</h3>
            <ul className="space-y-4 text-base text-gray-600 font-medium">
              <li><Link to="/safe-space-promise" className="hover:text-purple-600 transition-colors">Safe Space Promise</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-purple-600 transition-colors">Terms & Conditions</Link></li>
            </ul>
            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-500 leading-relaxed italic">
                Affiliate Disclosure: Some links may be affiliate links, meaning I earn a small commission at no extra cost to you.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-base text-gray-500 font-medium">
          <p>&copy; {new Date().getFullYear()} Bangtan Mom. All rights reserved.</p>
          <p className="flex items-center">
            Made with <SafeIcon icon={FiHeart} className="inline text-purple-500 mx-2 text-lg" /> by Melissa
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;