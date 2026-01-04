import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import { PLACEHOLDER_IMAGE } from '../config/assets';

const { FiHeart, FiStar, FiUsers, FiBookOpen } = FiIcons;

const About = () => {
  const interests = [
    { icon: FiHeart, title: 'Health & Wellness', description: 'Sharing realistic wellness tips for busy moms who want to prioritize self-care.' },
    { icon: FiUsers, title: 'Family Matters', description: 'Real stories about parenting, family traditions, and creating meaningful connections.' },
    { icon: FiStar, title: 'K-Drama Love', description: 'Reviews, recommendations, and how Korean dramas have enriched my life and family time.' },
    { icon: FiBookOpen, title: 'BTS & K-Pop', description: 'How music became my source of joy, inspiration, and unexpected life lessons.' }
  ];

  const personalStats = [
    { number: '2', label: 'Amazing Kids' },
    { number: '5+', label: 'Years Blogging' },
    { number: '100+', label: 'K-Dramas Watched' },
    { number: '∞', label: 'Cups of Coffee' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          About <span className="text-purple-600">Melissa</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          I'm Melissa, a mom of two who believes that motherhood doesn't mean losing yourself—it means discovering new parts of who you can become.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {personalStats.map((stat, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: index * 0.1 }} 
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
            <div className="text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">My Story</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Five years ago, I was a new mom feeling overwhelmed and isolated. I started this blog as a way to document my journey and connect with other parents.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Along the way, I discovered my love for Korean culture through dramas and music. It became a source of inspiration and family bonding time.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Today, I'm passionate about sharing realistic wellness tips, honest parenting moments, and the joy I've found in K-culture.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="rounded-xl shadow-lg mb-6 overflow-hidden aspect-video bg-gray-100">
            <SafeImage 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&fit=crop" 
              alt="Melissa" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quick Facts About Me</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Coffee is my love language ☕</li>
              <li>• I cry at every K-drama (happy or sad tears!)</li>
              <li>• My kids think I'm cool because I know BTS songs</li>
              <li>• I meal prep on Sundays like it's my job</li>
              <li>• I believe in progress, not perfection</li>
            </ul>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {interests.map((interest, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: index * 0.1 }} 
            className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={interest.icon} className="text-2xl text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{interest.title}</h3>
            <p className="text-gray-600 leading-relaxed">{interest.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default About;