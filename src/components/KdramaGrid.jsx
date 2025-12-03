import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowRight, FiImage } = FiIcons;

const KdramaGrid = () => {
  const recommendations = [
    {
      id: 'moon-lovers-scarlet-heart-ryeo',
      title: 'Moon Lovers: Scarlet Heart Ryeo',
      image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=800&auto=format&fit=crop&q=60',
      tags: ['Historical', 'Time travel', 'Angst'],
      synopsis: "A 21st-century woman is pulled back in time to the Goryeo dynasty and wakes up in the body of Hae Soo, a noble lady surrounded by princes who are destined to fight for the throne. As she gets tangled in their politics and love stories, she realises that knowing history doesn’t mean she can save everyone. It’s a beautiful, heartbreaking ride about fate, loyalty, and choosing your own heart."
    },
    {
      id: 'mr-queen',
      title: 'Mr. Queen',
      image: 'https://images.unsplash.com/photo-1580226330962-4217f2252a12?w=800&auto=format&fit=crop&q=60',
      tags: ['Historical', 'Body swap', 'Comedy'],
      synopsis: "A modern-day male chef suddenly wakes up in the body of Queen Cheorin in the Joseon era, with his loud personality trapped inside royal silk and strict palace rules. While he panics, plots, and swears his way through court life, he slowly discovers the truth behind the seemingly weak king and the power games around them. It’s chaotic, hilarious, and surprisingly emotional."
    },
    {
      id: 'moon-embracing-the-sun',
      title: 'Moon Embracing the Sun',
      image: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800&auto=format&fit=crop&q=60',
      tags: ['Historical', 'First love', 'Tragedy & healing'],
      synopsis: "A crown prince falls deeply in love with a bright, kind girl chosen to be his future queen, but a deadly political scheme tears them apart. Years later, she returns as a mysterious shaman with no memory of her past, while he has become a lonely king still haunted by his “lost” first love. The drama mixes palace intrigue, destiny, and the kind of longing that stays with you."
    },
    {
      id: 'love-in-the-moonlight',
      title: 'Love in the Moonlight',
      image: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=800&auto=format&fit=crop&q=60',
      tags: ['Historical', 'Youth romance', 'Disguise'],
      synopsis: "A street-smart girl who has lived her whole life disguised as a boy ends up working in the palace as a eunuch. There, she clashes with the mischievous crown prince, and their bickering slowly turns into something softer and sweeter. It’s a warm, charming coming-of-age story about first love, identity, and stepping into who you really are."
    },
    {
      id: 'rooftop-prince',
      title: 'Rooftop Prince',
      image: 'https://images.unsplash.com/photo-1617769431411-97b77053e163?w=800&auto=format&fit=crop&q=60',
      tags: ['Time travel', 'Romance', 'Mystery'],
      synopsis: "A Joseon crown prince and his three loyal followers suddenly time-travel to modern Seoul while trying to solve the suspicious death of his princess. They crash-land on the rooftop home of an ordinary woman and become the strangest housemates ever. Between solving a centuries-old mystery and navigating smartphones and elevators, he finds a second chance at love."
    },
    {
      id: 'under-the-queens-umbrella',
      title: 'Under the Queen’s Umbrella',
      image: 'https://images.unsplash.com/photo-1534237199039-011270b24d1a?w=800&auto=format&fit=crop&q=60',
      tags: ['Historical', 'Family', 'Strong queen'],
      synopsis: "Queen Hwaryeong is supposed to be calm and elegant, but her sons are chaotic princes constantly getting into trouble. To protect them from cruel politics and deadly competition for the throne, she drops the royal act and becomes a fierce, hands-on mom. This drama feels like a love letter to mothers who will do anything to keep their children safe and help them grow."
    },
    {
      id: 'its-okay-to-not-be-okay',
      title: 'It’s Okay to Not Be Okay',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=60',
      tags: ['Healing', 'Mental health', 'Romance'],
      synopsis: "A children’s book author with a dark, prickly personality crosses paths with a psychiatric ward caretaker who has spent his whole life caring for his autistic older brother. Each of them carries deep emotional scars and survival stories that don’t look “pretty” from the outside. Together, they slowly learn how to face their trauma, set boundaries, and believe they’re worthy of love."
    },
    {
      id: 'itaewon-class',
      title: 'Itaewon Class',
      image: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&auto=format&fit=crop&q=60',
      tags: ['Revenge', 'Found family', 'Business'],
      synopsis: "After losing his father and his future because of a powerful chaebol family, Park Sae-ro-yi decides to build a small bar-restaurant in Itaewon and turn it into something big enough to fight back. Along the way, he gathers a group of misfits who become his team, his family, and his reason to keep going. It’s a story about dignity, second chances, and building your own path."
    },
    {
      id: 'the-crowned-clown',
      title: 'The Crowned Clown',
      image: 'https://images.unsplash.com/photo-1616091093744-c09579730419?w=800&auto=format&fit=crop&q=60',
      tags: ['Historical', 'Doppelganger', 'Power & justice'],
      synopsis: "To survive assassination attempts and endless political wars, a tormented king secretly brings a lowly clown who looks just like him into the palace and puts him on the throne. The clown, who has only ever performed for laughs, suddenly has to act like a ruler and protect the people around him. Watching him grow into a braver, kinder “king” makes this drama gripping and emotional."
    },
    {
      id: '18-again',
      title: '18 Again',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ad0?w=800&auto=format&fit=crop&q=60',
      tags: ['Family', 'Fantasy', 'Second chances'],
      synopsis: "A worn-out husband and father on the brink of divorce suddenly finds himself back in his 18-year-old body while keeping his 37-year-old mind. Pretending to be a high school student, he gets to see his wife and kids’ lives from the outside and realises how much he misunderstood. It’s a heartfelt story about regret, parenting, and remembering why you fell in love in the first place."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {recommendations.map((drama, index) => (
        <motion.div
          key={drama.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-50 flex flex-col h-full overflow-hidden"
        >
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden bg-purple-100">
            {drama.image ? (
              <img 
                src={drama.image} 
                alt={drama.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-300">
                <SafeIcon icon={FiImage} className="text-4xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {drama.tags.slice(0, 2).map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-white/90 backdrop-blur-sm text-purple-800 text-xs font-bold rounded-md shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {drama.title}
            </h3>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-4">
              {drama.synopsis}
            </p>

            <Link
              to={`/kdrama-recommendations#${drama.id}`}
              className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors mt-auto group/link"
            >
              Read my full thoughts 
              <SafeIcon icon={FiArrowRight} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KdramaGrid;