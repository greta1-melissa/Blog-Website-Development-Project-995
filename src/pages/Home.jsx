import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/BlogCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHeart, FiStar, FiUsers, FiPlay, FiExternalLink, FiTv, FiMusic, FiArrowRight, FiCalendar } = FiIcons;

const Home = () => {
  const { posts, categories } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === '' || post.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchTerm]);

  const mostRecentPost = posts[0];

  const currentKDrama = {
    title: "Queen of Tears",
    episode: "Episode 12",
    status: "Currently Watching",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop",
    description: "An emotional rollercoaster about love, family, and second chances. Kim Soo-hyun and Kim Ji-won's chemistry is absolutely incredible!",
    genre: "Romance, Drama",
    year: "2024"
  };

  const spotifyPlaylist = {
    name: "Bangtan Mom's K-Pop Vibes",
    description: "My current favorites - BTS, NewJeans, IVE, and more K-pop gems that keep me going through mom life!",
    trackCount: 47,
    playlistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX9tPFwDMOaN1", // Replace with your actual playlist
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX9tPFwDMOaN1?utm_source=generator&theme=0", // Replace with your actual embed
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
  };

  const featuredStats = [
    { icon: FiHeart, number: '500+', label: 'Happy Readers' },
    { icon: FiStar, number: '50+', label: 'Published Posts' },
    { icon: FiUsers, number: '100+', label: 'Community Members' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-purple-600">Bangtan Mom</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Hi, I'm Melissa! Join me as I share my journey through motherhood, wellness tips, 
          family adventures, and my love for BTS and K-culture. This is our cozy corner of 
          the internet where real life meets real conversations.
        </p>
        <div className="flex justify-center space-x-8 mb-8">
          {featuredStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <SafeIcon icon={stat.icon} className="text-purple-600 text-xl" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Featured Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Most Recent Blog Post */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest from the Blog</h2>
              <p className="text-gray-600">Fresh thoughts and stories from my heart</p>
            </div>
            {mostRecentPost && (
              <div className="p-6">
                <Link to={`/post/${mostRecentPost.id}`} className="block group">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <img
                        src={mostRecentPost.image}
                        alt={mostRecentPost.title}
                        className="w-full h-48 md:h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="md:w-2/3">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <SafeIcon icon={FiCalendar} className="mr-1" />
                        <span className="mr-4">{mostRecentPost.date}</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {mostRecentPost.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                        {mostRecentPost.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {mostRecentPost.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center text-purple-600 group-hover:text-purple-700 font-medium">
                        Read more <SafeIcon icon={FiArrowRight} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Currently Watching K-Drama */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiTv} className="text-purple-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Currently Watching</h2>
              </div>
              <p className="text-gray-600 text-sm">My latest K-drama obsession</p>
            </div>
            <div className="p-6">
              <div className="relative mb-4">
                <img
                  src={currentKDrama.image}
                  alt={currentKDrama.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {currentKDrama.status}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{currentKDrama.title}</h3>
              <p className="text-purple-600 text-sm mb-2">{currentKDrama.episode}</p>
              <p className="text-gray-600 text-sm mb-3">{currentKDrama.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{currentKDrama.genre}</span>
                <span>{currentKDrama.year}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spotify Playlist Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden mb-16"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiMusic} className="text-green-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">My Current Playlist</h2>
              </div>
              <p className="text-gray-600">The soundtrack to my mom life</p>
            </div>
            <a
              href={spotifyPlaylist.playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <SafeIcon icon={FiExternalLink} className="mr-2" />
              Open in Spotify
            </a>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={spotifyPlaylist.coverImage}
                  alt={spotifyPlaylist.name}
                  className="w-20 h-20 rounded-lg shadow-md"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{spotifyPlaylist.name}</h3>
                  <p className="text-gray-600 text-sm">{spotifyPlaylist.trackCount} songs</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{spotifyPlaylist.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <SafeIcon icon={FiPlay} className="mr-1" />
                <span>Listen on Spotify for the full experience</span>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4 h-80">
                <iframe
                  src={spotifyPlaylist.embedUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowtransparency="true"
                  allow="encrypted-media"
                  className="rounded-lg"
                  title="Spotify Playlist"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* All Posts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">All Posts</h2>
          <p className="text-gray-600">Explore all my stories, tips, and adventures</p>
        </div>

        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;