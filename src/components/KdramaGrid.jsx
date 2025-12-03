import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowRight } = FiIcons;

const KdramaGrid = () => {
  const recommendations = [
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map((drama, index) => (
        <motion.div
          key={drama.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-purple-50 flex flex-col h-full"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight min-h-[56px] flex items-center">
              {drama.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {drama.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-md border border-purple-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-4">
            {drama.synopsis}
          </p>

          <Link
            to={`/kdrama-recommendations#${drama.id}`}
            className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors mt-auto group"
          >
            Read my full thoughts 
            <SafeIcon icon={FiArrowRight} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default KdramaGrid;