import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiTv, FiStar, FiHeart, FiFilm } = FiIcons;

const KdramaRecommendations = () => {
  const currentFavorites = [
    {
      id: 'moon-lovers-scarlet-heart-ryeo',
      title: 'Moon Lovers: Scarlet Heart Ryeo',
      tags: ['Historical', 'Time travel', 'Angst'],
      synopsis: "A 21st-century woman is pulled back in time to the Goryeo dynasty and wakes up in the body of Hae Soo, a noble lady surrounded by princes who are destined to fight for the throne. As she gets tangled in their politics and love stories, she realises that knowing history doesn’t mean she can save everyone. It’s a beautiful, heartbreaking ride about fate, loyalty, and choosing your own heart."
    },
    {
      id: 'mr-queen',
      title: 'Mr. Queen',
      tags: ['Historical', 'Body swap', 'Comedy'],
      synopsis: "A modern-day male chef suddenly wakes up in the body of Queen Cheorin in the Joseon era, with his loud personality trapped inside royal silk and strict palace rules. While he panics, plots, and swears his way through court life, he slowly discovers the truth behind the seemingly weak king and the power games around them. It’s chaotic, hilarious, and surprisingly emotional."
    },
    {
      id: 'moon-embracing-the-sun',
      title: 'Moon Embracing the Sun',
      tags: ['Historical', 'First love', 'Tragedy & healing'],
      synopsis: "A crown prince falls deeply in love with a bright, kind girl chosen to be his future queen, but a deadly political scheme tears them apart. Years later, she returns as a mysterious shaman with no memory of her past, while he has become a lonely king still haunted by his “lost” first love. The drama mixes palace intrigue, destiny, and the kind of longing that stays with you."
    },
    {
      id: 'love-in-the-moonlight',
      title: 'Love in the Moonlight',
      tags: ['Historical', 'Youth romance', 'Disguise'],
      synopsis: "A street-smart girl who has lived her whole life disguised as a boy ends up working in the palace as a eunuch. There, she clashes with the mischievous crown prince, and their bickering slowly turns into something softer and sweeter. It’s a warm, charming coming-of-age story about first love, identity, and stepping into who you really are."
    },
    {
      id: 'rooftop-prince',
      title: 'Rooftop Prince',
      tags: ['Time travel', 'Romance', 'Mystery'],
      synopsis: "A Joseon crown prince and his three loyal followers suddenly time-travel to modern Seoul while trying to solve the suspicious death of his princess. They crash-land on the rooftop home of an ordinary woman and become the strangest housemates ever. Between solving a centuries-old mystery and navigating smartphones and elevators, he finds a second chance at love."
    },
    {
      id: 'under-the-queens-umbrella',
      title: 'Under the Queen’s Umbrella',
      tags: ['Historical', 'Family', 'Strong queen'],
      synopsis: "Queen Hwaryeong is supposed to be calm and elegant, but her sons are chaotic princes constantly getting into trouble. To protect them from cruel politics and deadly competition for the throne, she drops the royal act and becomes a fierce, hands-on mom. This drama feels like a love letter to mothers who will do anything to keep their children safe and help them grow."
    },
    {
      id: 'its-okay-to-not-be-okay',
      title: 'It’s Okay to Not Be Okay',
      tags: ['Healing', 'Mental health', 'Romance'],
      synopsis: "A children’s book author with a dark, prickly personality crosses paths with a psychiatric ward caretaker who has spent his whole life caring for his autistic older brother. Each of them carries deep emotional scars and survival stories that don’t look “pretty” from the outside. Together, they slowly learn how to face their trauma, set boundaries, and believe they’re worthy of love."
    },
    {
      id: 'itaewon-class',
      title: 'Itaewon Class',
      tags: ['Revenge', 'Found family', 'Business'],
      synopsis: "After losing his father and his future because of a powerful chaebol family, Park Sae-ro-yi decides to build a small bar-restaurant in Itaewon and turn it into something big enough to fight back. Along the way, he gathers a group of misfits who become his team, his family, and his reason to keep going. It’s a story about dignity, second chances, and building your own path."
    },
    {
      id: 'the-crowned-clown',
      title: 'The Crowned Clown',
      tags: ['Historical', 'Doppelganger', 'Power & justice'],
      synopsis: "To survive assassination attempts and endless political wars, a tormented king secretly brings a lowly clown who looks just like him into the palace and puts him on the throne. The clown, who has only ever performed for laughs, suddenly has to act like a ruler and protect the people around him. Watching him grow into a braver, kinder “king” makes this drama gripping and emotional."
    },
    {
      id: '18-again',
      title: '18 Again',
      tags: ['Family', 'Fantasy', 'Second chances'],
      synopsis: "A worn-out husband and father on the brink of divorce suddenly finds himself back in his 18-year-old body while keeping his 37-year-old mind. Pretending to be a high school student, he gets to see his wife and kids’ lives from the outside and realises how much he misunderstood. It’s a heartfelt story about regret, parenting, and remembering why you fell in love in the first place."
    }
  ];

  const moreFavorites = [
    {
      id: 'crash-landing-on-you',
      title: 'Crash Landing on You',
      synopsis: "A South Korean heiress accidentally crash-lands in North Korea during a paragliding trip gone wrong and is discovered by a quiet, principled North Korean officer. While he hides her and searches for a way to send her home, the two slowly fall in love in the most impossible situation. It’s dramatic, funny, and deeply romantic, with a lot of heart."
    },
    {
      id: 'hwarang',
      title: 'Hwarang: The Poet Warrior Youth',
      synopsis: "In the Silla kingdom, a group of elite young men called Hwarang are gathered to become the future leaders and protectors of the crown. As they train, they clash, form friendships, fall in love, and discover dangerous secrets about who they really are. It’s a mix of bromance, royal politics, and flower-boy chaos in sageuk form."
    },
    {
      id: 'ghost-doctor',
      title: 'Ghost Doctor',
      synopsis: "A genius but arrogant cardiothoracic surgeon gets into an accident, and his spirit ends up possessing the body of a clumsy but well-connected resident who hates doing real surgery. The two doctors, complete opposites in personality and skill, are forced to share one body and one career. The result is a funny, heartfelt story about humility, teamwork, and what it truly means to save lives."
    },
    {
      id: 'alchemy-of-souls',
      title: 'Alchemy of Souls',
      synopsis: "In a fantasy kingdom where powerful mages can shift souls, a feared assassin’s soul becomes trapped inside the weak body of a blind young woman. She secretly trains a nobleman who can’t properly control his own power, while hiding who she really is from everyone around them. The show blends magic, romance, and destiny with some really memorable world-building."
    },
    {
      id: 'a-korean-odyssey',
      title: 'A Korean Odyssey (Hwayugi)',
      synopsis: "This modern fantasy is loosely based on Journey to the West and follows a woman who has seen ghosts since childhood and the mischievous immortal who once promised to protect her. Years later, their fates are tied together again by contracts, curses, and a love that is never simple. It’s spooky, funny, and unexpectedly romantic all at once."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <Link 
          to="/" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-6 transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} className="mr-2" /> Back to Home
        </Link>
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiTv} className="text-3xl text-purple-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
          K-Drama Recommendations <span className="text-purple-600">to Date</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          This is my growing list of K-dramas that made me laugh, cry, think, and completely lose sleep. I’ll keep updating this page with more detailed reviews, mom POVs, and favourite scenes as I go, but here’s a guide to the shows I recommend so far.
        </p>
      </div>

      {/* Main Recommendations */}
      <div className="space-y-12">
        <div className="flex items-center mb-8">
          <SafeIcon icon={FiStar} className="text-purple-600 text-2xl mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Current Favourites (So Far)</h2>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {currentFavorites.map((drama) => (
            <div 
              id={drama.id} 
              key={drama.id}
              className="bg-white rounded-2xl shadow-sm border border-purple-50 p-8 scroll-mt-24"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{drama.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {drama.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wide border border-purple-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {drama.synopsis}
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h4 className="flex items-center text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                      <SafeIcon icon={FiHeart} className="mr-2 text-purple-500" />
                      My Thoughts:
                    </h4>
                    <p className="text-gray-500 italic">
                      (I’ll share my full review and mom POV about this drama here soon.)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More Recommendations */}
      <div className="mt-20 space-y-12">
        <div className="flex items-center mb-8">
          <SafeIcon icon={FiFilm} className="text-purple-600 text-2xl mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">More K-Dramas I Love</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {moreFavorites.map((drama) => (
            <div 
              id={drama.id} 
              key={drama.id}
              className="bg-white rounded-2xl shadow-sm border border-purple-50 p-8 hover:shadow-md transition-shadow scroll-mt-24"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">{drama.title}</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {drama.synopsis}
              </p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="flex items-center text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                  <SafeIcon icon={FiHeart} className="mr-2 text-purple-500" />
                  My Thoughts:
                </h4>
                <p className="text-sm text-gray-500 italic">
                  (I’ll share my full review and mom POV about this drama here soon.)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default KdramaRecommendations;