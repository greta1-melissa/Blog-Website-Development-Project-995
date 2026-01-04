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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <SafeImage src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-serif font-bold text-gray-900">BangtanMom</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Navigating motherhood with a little bit of chaos, a lot of love, and the perfect K-Pop playlist.
            </p>
            <div className="flex space-x-4">
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
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Explore</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-purple-600">Home</Link></li>
              <li><Link to="/about" className="hover:text-purple-600">Our Story</Link></li>
              <li><Link to="/forums" className="hover:text-purple-600">Community</Link></li>
              <li><Link to="/products" className="hover:text-purple-600">Shop Favorites</Link></li>
              <li><Link to="/kdrama-recommendations" className="hover:text-purple-600">K-Dramas</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Categories</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/?category=Health" className="hover:text-purple-600">Health & Wellness</Link></li>
              <li><Link to="/?category=Fam%20Bam" className="hover:text-purple-600">Family Life</Link></li>
              <li><Link to="/?category=K-Drama" className="hover:text-purple-600">K-Drama Reviews</Link></li>
              <li><Link to="/?category=BTS" className="hover:text-purple-600">BTS Army</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Our Promise</h3>
            <div className="space-y-4">
              <p className="text-xs text-purple-800 bg-purple-50 p-3 rounded-lg leading-relaxed">
                This is a safe space for moms, ARMY, and anyone who needs a gentle corner of the internet.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/safe-space-promise" className="hover:text-purple-600">Safe Space Promise</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-purple-600">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-purple-600">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Bangtan Mom. Made with <SafeIcon icon={FiHeart} className="inline text-purple-500 mx-1" /> by Melissa
        </div>
      </div>
    </footer>
  );
};

export default Footer;