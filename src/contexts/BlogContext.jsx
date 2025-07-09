import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

const initialPosts = [
  {
    id: 1,
    title: "Morning Wellness Routine: How I Start My Day as a Busy Mom",
    content: "Being a mom means juggling countless responsibilities, but I've learned that taking care of myself first thing in the morning sets the tone for everything else. My wellness routine doesn't require hours – just 30 minutes of intentional self-care that makes all the difference.\n\nI start with 5 minutes of deep breathing or light stretching. Nothing fancy, just gentle movements that help me connect with my body and mind. Then I prepare a nutritious breakfast – usually overnight oats with berries or a green smoothie that I can sip while getting the kids ready.\n\nThe key is consistency, not perfection. Some mornings are chaotic, and that's okay. Even just taking three deep breaths while my coffee brews counts as self-care. Remember, we can't pour from an empty cup, and our families need us at our best.\n\nWhat does your morning routine look like? I'd love to hear how other moms are prioritizing their wellness!",
    author: "Melissa",
    date: "2024-01-15",
    category: "Health",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop"
  },
  {
    id: 2,
    title: "Teaching Kids About Emotions: Lessons from K-Drama Parenting",
    content: "I never expected that my love for K-dramas would actually help me become a better parent, but here we are! Korean dramas have taught me so much about emotional intelligence, family bonds, and the importance of open communication.\n\nIn many K-dramas, you'll notice how family members sit down together to discuss their feelings, even when it's uncomfortable. This has inspired me to create 'family feeling circles' with my kids where we talk about our highs and lows from the day.\n\nOne thing I've learned from shows like 'Reply 1988' is that childhood moments are precious and fleeting. It's made me more intentional about being present with my children, putting down my phone, and really listening when they want to share something with me.\n\nThe emotional depth in K-dramas has also helped me understand that it's okay to show vulnerability to my kids. They need to see that adults have feelings too, and that it's healthy to express them in appropriate ways.\n\nWhat lessons have you learned from unexpected places? Sometimes wisdom comes from the most surprising sources!",
    author: "Melissa",
    date: "2024-01-12",
    category: "Fam Bam",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=400&fit=crop"
  },
  {
    id: 3,
    title: "My Top 5 Comfort K-Dramas for Stressful Mom Days",
    content: "After a long day of mom duties, sometimes all I want is to escape into a good story. K-dramas have become my go-to comfort entertainment, and I've discovered some absolute gems that never fail to lift my spirits.\n\n**1. Hometown's Embrace** - This heartwarming series about a woman returning to her small hometown reminds me that it's never too late to start over. Perfect for when I'm feeling overwhelmed.\n\n**2. Coffee Prince** - A classic rom-com that makes me laugh every time. The chemistry between the leads is incredible, and it's the perfect length for a weekend binge.\n\n**3. Reply 1988** - This one makes me cry happy tears. It's all about family, friendship, and growing up. Watching it makes me appreciate the simple moments with my own family.\n\n**4. What's Wrong with Secretary Kim** - Pure romantic comedy gold. Sometimes a mom just needs some light-hearted romance and beautiful fashion inspiration.\n\n**5. Hospital Playlist** - About friendship, work-life balance, and finding joy in everyday moments. As someone trying to balance everything, this show really speaks to me.\n\nWhat are your comfort shows? I'm always looking for new recommendations to add to my 'mom needs a break' watchlist!",
    author: "Melissa",
    date: "2024-01-10",
    category: "K-Drama",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1489599735734-79b4d4d3b4c4?w=800&h=400&fit=crop"
  },
  {
    id: 4,
    title: "How BTS Taught Me About Self-Love and Resilience",
    content: "I'll admit it – I became an ARMY in my 30s, and it's been one of the most unexpected joys of my adult life. What started as curiosity about this group my teenage neighbor kept talking about has turned into a source of genuine inspiration and comfort.\n\nBTS's message of self-love resonates deeply with me as a mom. We're so focused on caring for everyone else that we often forget to extend that same kindness to ourselves. Songs like 'Answer: Love Myself' remind me that self-compassion isn't selfish – it's necessary.\n\nTheir work ethic is incredible, but what I admire most is how they talk openly about mental health, struggles, and growth. In 'The Most Beautiful Moment in Life' series, they explore the complexity of youth and dreams, which has helped me reflect on my own journey and the dreams I'm still pursuing.\n\nWatching their performances and interviews has taught me about resilience. They've faced criticism, language barriers, and industry challenges, but they've stayed true to their message and each other. It's inspired me to be more persistent in my own goals and to show my kids that it's okay to dream big.\n\nTheir music has become part of my self-care routine. Whether I'm cleaning the house to 'Dynamite' or having a quiet moment with 'Spring Day,' their songs provide both energy and comfort.\n\nMusic has always been powerful, but BTS has reminded me that it can be a source of healing and motivation at any age.",
    author: "Melissa",
    date: "2024-01-08",
    category: "BTS",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop"
  },
  {
    id: 5,
    title: "Healthy Meal Prep Ideas That Even Picky Kids Will Love",
    content: "Meal prepping as a mom is a game-changer, but it gets tricky when you have picky eaters. After years of trial and error, I've found some strategies that work for our family and keep everyone happy and healthy.\n\n**The Build-Your-Own Approach**: I prep components separately so everyone can customize their meals. Cooked rice, grilled chicken, roasted vegetables, and various sauces. Kids love having choices!\n\n**Hidden Veggie Wins**: Smoothie packs with frozen fruits and sneaky spinach, meatballs with finely grated vegetables, and pasta sauces loaded with pureed carrots and bell peppers.\n\n**Batch Cooking Favorites**: Homemade chicken nuggets (baked, not fried), mini meatballs, and breakfast muffins with vegetables. These freeze beautifully and kids think they're treats.\n\n**Snack Prep Success**: Cut vegetables with hummus, homemade energy balls, and portion-controlled snack bags. Having everything ready prevents the 'I'm hungry but there's nothing to eat' drama.\n\nThe key is involving kids in the process. They're more likely to eat something they helped prepare. Even toddlers can wash vegetables or mix ingredients.\n\nWhat are your go-to meal prep strategies? I'm always looking for new ideas to keep our family eating well without the daily stress!",
    author: "Melissa",
    date: "2024-01-05",
    category: "Health",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop"
  },
  {
    id: 6,
    title: "Creating Family Movie Nights: K-Drama Edition",
    content: "Who says family movie night has to be just movies? We've started having K-drama family nights, and it's become one of our favorite traditions. Here's how we make it work with kids of different ages.\n\n**Choosing Age-Appropriate Content**: We stick to lighter, family-friendly dramas. 'Reply 1988' is perfect for older kids, while 'Welcome to Waikiki' provides good laughs for the whole family.\n\n**Making it Special**: We prepare Korean snacks like homemade Korean corn dogs, kimchi fried rice, or even just some Korean pears and tea. The kids love the cultural exploration.\n\n**Discussion Time**: After each episode, we talk about what we learned about Korean culture, family values, or interesting differences from our own experiences.\n\n**Learning Together**: We've started picking up Korean phrases from the shows. My 8-year-old now says 'annyeonghaseyo' to everyone, and my teenager has become genuinely interested in Korean culture.\n\nIt's amazing how these shows have opened up conversations about different cultures, family dynamics, and even life lessons. Plus, it's quality time together without the usual distractions.\n\nHave you tried incorporating international content into your family time? It's been such a wonderful way to broaden our horizons together!",
    author: "Melissa",
    date: "2024-01-03",
    category: "Fam Bam",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop"
  },
  {
    id: 7,
    title: "Must-Have Korean Skincare Products That Actually Work",
    content: "As a busy mom, I don't have time for a 12-step skincare routine, but I've discovered some Korean skincare gems that have transformed my skin with minimal effort. Here are my tried-and-true recommendations that fit perfectly into a mom's hectic schedule.\n\n**CeraVe Hydrating Cleanser**: This gentle, non-foaming cleanser removes makeup and impurities without stripping my skin. Perfect for those late nights when I barely have energy to wash my face.\n\n**COSRX Snail 96 Mucin Power Essence**: I know it sounds weird, but this essence has been a game-changer for my post-pregnancy skin. It's incredibly hydrating and helps with healing any breakouts.\n\n**Beauty of Joseon Glow Replenishing Rice Milk**: This toner is like a drink of water for tired mom skin. It's gentle, hydrating, and gives me that healthy glow even on 4 hours of sleep.\n\n**Innisfree Green Tea Seed Serum**: Lightweight but incredibly moisturizing, this serum absorbs quickly and doesn't leave any sticky residue. Perfect for my morning routine when I'm rushing to get the kids ready.\n\n**PURITO Centella Unscented Sun Screen**: Finding a sunscreen that doesn't irritate my sensitive skin was a struggle until I found this one. It's gentle, effective, and doesn't leave a white cast.\n\nThe best part? Most of these products are affordable and a little goes a long way. My skin has never looked better, and I'm spending less time and money on my routine!\n\nHave you tried any Korean skincare products? I'd love to hear your recommendations!",
    author: "Melissa",
    date: "2024-01-20",
    category: "Product Recommendations",
    subcategory: "Beauty & Skincare",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=400&fit=crop"
  },
  {
    id: 8,
    title: "The Best Mom-Friendly Workout Gear That Actually Lasts",
    content: "Finding workout gear that can keep up with mom life is no joke. Between playground adventures, impromptu dance parties, and actual workouts (when I can squeeze them in), I need clothes that can handle it all. Here are my absolute favorites that have stood the test of time and toddler tantrums.\n\n**Lululemon Align Leggings**: Yes, they're pricey, but these leggings are worth every penny. I've had mine for over two years and they still look new. They're buttery soft, don't dig in, and are perfect for everything from yoga to chasing kids at the park.\n\n**Athleta Salutation Stash Tights**: These have pockets! As a mom, pockets are essential. I can carry my phone, keys, and snacks without needing a bag. The fabric is thick enough to be squat-proof but still breathable.\n\n**Nike Dri-FIT Sports Bras**: These provide excellent support without being too tight. I can wear them all day if needed, and they wash beautifully. The racerback design is comfortable under tank tops.\n\n**Allbirds Tree Runners**: These shoes are a game-changer for busy moms. They're comfortable enough for long walks, supportive enough for light workouts, and stylish enough to wear with regular clothes. Plus, they're machine washable!\n\n**Hydro Flask Water Bottle**: Staying hydrated is crucial, especially when breastfeeding or chasing kids. This bottle keeps water cold for hours and has survived countless drops from stroller cup holders.\n\n**Wireless Earbuds (Apple AirPods)**: For those rare moments when I can work out alone, these are essential. They stay in place, have great sound quality, and the battery lasts long enough for multiple workouts.\n\nInvesting in quality workout gear might seem expensive upfront, but it's worth it when you find pieces that last and make you feel confident. What are your favorite mom-friendly workout essentials?",
    author: "Melissa",
    date: "2024-01-18",
    category: "Product Recommendations",
    subcategory: "Fitness & Wellness",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop"
  },
  {
    id: 9,
    title: "My Favorite BTS Merch: What's Actually Worth Buying",
    content: "As a mom who loves BTS, I've become quite selective about the merch I buy. Let's be honest – we can't buy EVERYTHING (though sometimes I want to!). Here are the items that have actually been worth the investment for this budget-conscious ARMY mom.\n\n**BT21 Plushies**: These adorable characters designed by the members themselves make my home office feel cheerful, and my kids love them too! They're well-made and have held up to plenty of hugs. Chimmy and RJ are our favorites! Price: $25-35 depending on size.\n\n**The Notes Books**: These companion books to the BTS Universe provide such amazing storytelling depth. I love reading them during my rare quiet moments. If you enjoy the more narrative aspects of BTS' work, these are absolutely worth it. Price: About $15-20 each.\n\n**BTS Seasons Greetings Calendar**: I actually use this daily! The photo quality is excellent, and it makes planning family activities more fun when I get to see the members each time I check the date. Price: Around $40-50, but it lasts all year.\n\n**ARMY Bomb (Light Stick)**: I hesitated on this purchase for a long time, but after attending a concert, I'm so glad I bought it. Even at home, my kids and I turn it on during BTS YouTube concerts for a more immersive feel. Price: $55-60.\n\n**In The Soop Pajamas**: Absolutely the most comfortable loungewear I own. Perfect for cozy K-drama watching sessions after the kids go to bed. The quality is outstanding, and they've held up beautifully through countless washes. Price: $70-80 for the set.\n\nWhat BTS items have you found worth purchasing? I'd love to hear what other ARMY moms have in their collections!",
    author: "Melissa",
    date: "2024-01-25",
    category: "Product Recommendations",
    subcategory: "BTS & K-Pop",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=400&fit=crop"
  },
  {
    id: 10,
    title: "Baby Products I Wish I'd Discovered Sooner",
    content: "If I could go back in time and give my new-mom self some advice, it would definitely include a list of these game-changing products. These items made parenting so much easier once I discovered them, and I only wish I'd found them sooner!\n\n**Baby Brezza Formula Pro**: For formula-feeding parents, this machine is LIFE-CHANGING. It's essentially a Keurig for formula – perfectly mixed, perfectly warmed bottles at the press of a button, even at 3 AM when you can barely keep your eyes open. Price: $200, but worth every penny for the sleep you'll save.\n\n**Haakaa Silicone Breast Pump**: This simple silicone pump attaches to one breast while you're nursing on the other, collecting milk that would otherwise be wasted. I collected several ounces daily without any extra pumping time. Price: Around $15.\n\n**Hatch Rest Sound Machine**: This sound machine, night light, and time-to-rise alert all in one has helped establish our sleep routines from newborn through toddler years. You control it from your phone, so no more tiptoeing in to adjust settings. Price: $60-70.\n\n**Nanit Baby Monitor**: Unlike traditional video monitors, the Nanit mounts above the crib for a clear bird's-eye view. It tracks sleep patterns and breathing motion without wearables, and the picture quality is incredible, even in night vision. Price: $300, but often on sale.\n\n**Little Sleepies Bamboo Pajamas**: These incredibly soft bamboo pajamas have two-way zippers for easy middle-of-the-night diaper changes. They're breathable, stretchy, and hold up amazingly well through countless washes. Price: $30-35.\n\n**FridaBaby Nose Frida**: It looks weird, but this nasal aspirator works SO much better than the bulb syringes. Essential for cold season with little ones. Price: $10-15.\n\nWhat baby products do you wish you'd discovered sooner? I'd love to hear your recommendations!",
    author: "Melissa",
    date: "2024-01-30",
    category: "Product Recommendations",
    subcategory: "Baby & Kids",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=400&fit=crop"
  },
  {
    id: 11,
    title: "Korean Cooking Essentials: Building Your K-Food Pantry",
    content: "Since falling in love with Korean culture, I've been recreating some of my favorite dishes at home. If you're looking to explore Korean cooking, here are the essential ingredients and tools to get started – all available online or at most Asian grocery stores.\n\n**Gochujang**: This fermented red chili paste is a fundamental Korean ingredient. It's spicy, sweet, and adds incredible depth to everything from bibimbap to stews. My favorite brand is Chung Jung One. Price: $8-10 for a tub that lasts months.\n\n**Gochugaru**: These Korean red pepper flakes have a different flavor profile than regular crushed red pepper – they're fruity and less intensely spicy. Essential for kimchi and many Korean dishes. Price: $9-12 per bag.\n\n**Doenjang**: This fermented soybean paste is similar to miso but with a stronger flavor. It's the base for doenjang jjigae (soybean paste stew) and adds umami to many dishes. Price: $8-10 per container.\n\n**Korean Short Grain Rice**: Rice is central to Korean cuisine, and the slightly sticky texture of short grain rice works perfectly. I like CJ Hetbahn or Nongshim brands. Price: $15-20 for a large bag.\n\n**Stone Bowl (Dolsot)**: If you want to make authentic bibimbap with the crispy rice bottom, a stone bowl is essential. They're surprisingly affordable and last forever. Price: $20-30.\n\n**Korean Pancake Mix**: For quick and easy pajeon (scallion pancakes), having a premade mix on hand is so convenient. Just add water and your choice of vegetables or seafood. Price: $5-7 per bag.\n\n**Kimchi**: While you can make your own, having a good store-bought kimchi on hand is convenient. Look for Jongga or Chongga brands for authentic flavor. Price: $8-12 per jar.\n\nWhat Korean ingredients or cooking tools do you love? I'm always looking to expand my collection!",
    author: "Melissa",
    date: "2024-02-05",
    category: "Product Recommendations",
    subcategory: "Food & Kitchen",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1583224964978-2d1a9f079621?w=800&h=400&fit=crop"
  }
];

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('momBlogPosts');
    return savedPosts ? JSON.parse(savedPosts) : initialPosts;
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    localStorage.setItem('momBlogPosts', JSON.stringify(posts));
    const uniqueCategories = [...new Set(posts.map(post => post.category))];
    setCategories(uniqueCategories);
  }, [posts]);

  const addPost = (post) => {
    const newPost = {
      ...post,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      readTime: `${Math.ceil(post.content.split(' ').length / 200)} min read`,
      author: "Melissa"
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost.id;
  };

  const getPost = (id) => {
    return posts.find(post => post.id === parseInt(id));
  };

  const getPostsByCategory = (category) => {
    return posts.filter(post => post.category === category);
  };

  const value = {
    posts,
    categories,
    addPost,
    getPost,
    getPostsByCategory
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};