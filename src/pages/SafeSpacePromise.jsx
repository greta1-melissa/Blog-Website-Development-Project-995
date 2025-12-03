import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHeart, FiShield, FiCheckCircle, FiXCircle } = FiIcons;

const SafeSpacePromise = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiHeart} className="text-3xl text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-serif">Safe Space Promise</h1>
          <p className="text-sm text-gray-500">Last updated: 3 December 2025</p>
        </div>

        <div className="prose prose-purple max-w-none text-gray-700">
          <p className="text-lg leading-relaxed mb-8 text-center max-w-2xl mx-auto">
            BangtanMom.com is my little corner of the internet where moms, ARMY, and anyone who needs a soft place to land can feel seen and safe. This space is built on kindness, respect, and empathy. By visiting, reading, or commenting here, you’re helping keep that promise alive.
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-10">
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="flex items-center text-green-800 font-bold text-xl mb-4">
                <SafeIcon icon={FiCheckCircle} className="mr-2" /> What This Space Is For
              </h3>
              <ul className="space-y-3 text-green-900">
                <li className="flex items-start"><span className="mr-2">•</span> Honest stories and feelings</li>
                <li className="flex items-start"><span className="mr-2">•</span> Support, encouragement, and gentle conversations</li>
                <li className="flex items-start"><span className="mr-2">•</span> Celebrating fandom, motherhood, work-from-home life, mental health, and small joys</li>
              </ul>
            </div>

            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <h3 className="flex items-center text-red-800 font-bold text-xl mb-4">
                <SafeIcon icon={FiXCircle} className="mr-2" /> What This Space Is Not For
              </h3>
              <ul className="space-y-3 text-red-900">
                <li className="flex items-start"><span className="mr-2">•</span> No bullying or shaming</li>
                <li className="flex items-start"><span className="mr-2">•</span> No hate speech, discrimination, or harassment</li>
                <li className="flex items-start"><span className="mr-2">•</span> No personal attacks, doxxing, or spreading harm</li>
                <li className="flex items-start"><span className="mr-2">•</span> No spam or disruptive behavior</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
            <SafeIcon icon={FiShield} className="mr-2 text-purple-600" /> Moderation
          </h3>
          <p>
            As the site owner, I reserve the right to edit, hide, or delete any comment or post that I personally deem inappropriate, harmful, or not aligned with this safe space. I may also block or restrict users who repeatedly ignore these guidelines.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Be Kind to Yourself, Too</h3>
          <p>
            This is a reminder that your feelings matter, you deserve kindness, and it’s okay to step away if something feels heavy. We are all doing our best.
          </p>

          <hr className="my-8 border-purple-100" />

          <p className="text-center text-sm text-gray-500">
            For full legal details, please read our <Link to="/terms-and-conditions" className="text-purple-600 hover:underline font-medium">Terms & Conditions</Link> and <Link to="/privacy-policy" className="text-purple-600 hover:underline font-medium">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SafeSpacePromise;