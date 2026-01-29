import { supabase } from '../src/lib/supabase-node.js';

const sampleProfiles = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Aria Chen',
    email: 'aria.chen@example.com',
    type: 'host',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Auckland',
    verified: true,
    is_published: true,
    bio: `Professional wellness therapist with over 8 years of experience in holistic healing and relaxation techniques. I specialize in therapeutic massage, aromatherapy, and stress relief sessions designed to restore your mind and body balance.

My approach combines traditional techniques with modern wellness practices, creating a personalized experience for each client. I believe in the power of touch and mindful presence to promote healing and relaxation.

I hold certifications in Swedish massage, deep tissue therapy, and aromatherapy from the New Zealand Institute of Massage Therapy. My private studio is equipped with professional-grade equipment and maintains the highest standards of hygiene and comfort.

Whether you're dealing with stress, muscle tension, or simply need time to unwind, I'm here to provide a safe, professional, and rejuvenating experience tailored to your needs.`,
    profile_photos: [
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3777572/pexels-photo-3777572.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    status_message: 'Accepting new clients - book your wellness session today!',
    primary_location: 'Auckland',
    service_areas: [
      { city: 'Auckland', radius: 25 },
      { city: 'Hamilton', radius: 15 }
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Mandarin', proficiency: 'Fluent' }
    ],
    services: [
      {
        title: 'Therapeutic Wellness Session',
        description: 'A comprehensive 90-minute wellness experience combining therapeutic massage, aromatherapy, and relaxation techniques. Perfect for stress relief and muscle tension release.',
        price: 280,
        duration: 90,
        category: 'Wellness',
        images: [
          'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3777572/pexels-photo-3777572.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['therapeutic', 'aromatherapy', 'relaxation', 'stress-relief']
      },
      {
        title: 'Executive Stress Relief Package',
        description: 'Designed for busy professionals. A focused 60-minute session targeting key stress points with deep tissue techniques and mindfulness breathing exercises.',
        price: 220,
        duration: 60,
        category: 'Wellness',
        images: [
          'https://images.pexels.com/photos/3777572/pexels-photo-3777572.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['executive', 'deep-tissue', 'stress-relief', 'professional']
      }
    ]
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    name: 'Luna Rodriguez',
    email: 'luna.rodriguez@example.com',
    type: 'host',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Wellington',
    verified: true,
    is_published: true,
    bio: `Elite companion and cultural guide with a passion for creating memorable experiences. With a background in hospitality and cultural studies, I specialize in providing sophisticated companionship for social events, business functions, and cultural exploration.

I bring intelligence, elegance, and genuine conversation to every encounter. Whether you need a companion for a gala dinner, business networking event, or want to explore Wellington's vibrant cultural scene, I ensure every moment is engaging and enjoyable.

My services are designed for discerning individuals who appreciate quality time, stimulating conversation, and refined company. I am well-traveled, multilingual, and comfortable in both formal and casual settings.

Discretion and professionalism are paramount in my work. I create a safe, respectful environment where clients can relax and enjoy authentic human connection.`,
    profile_photos: [
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1845534/pexels-photo-1845534.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'busy',
    status_message: 'Available for evening events and cultural tours',
    primary_location: 'Wellington',
    service_areas: [
      { city: 'Wellington', radius: 30 },
      { city: 'Palmerston North', radius: 20 }
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Spanish', proficiency: 'Native' },
      { language: 'French', proficiency: 'Fluent' }
    ],
    services: [
      {
        title: 'Elite Evening Companionship',
        description: 'Sophisticated companion services for upscale events, dinners, and social gatherings. Perfect for galas, business events, or fine dining experiences where you want engaging, intelligent company.',
        price: 450,
        duration: 180,
        category: 'Companionship',
        images: [
          'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['elegant', 'sophisticated', 'events', 'fine-dining']
      },
      {
        title: 'Cultural Wellington Tour',
        description: 'Explore Wellington\'s rich cultural scene with a knowledgeable local guide. Includes museum visits, art galleries, local cuisine, and insider knowledge of the city\'s hidden gems.',
        price: 320,
        duration: 240,
        category: 'Travel Companion',
        images: [
          'https://images.pexels.com/photos/1845534/pexels-photo-1845534.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['cultural', 'tour-guide', 'wellington', 'museums', 'local-expertise']
      }
    ]
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    name: 'Zara Patel',
    email: 'zara.patel@example.com',
    type: 'host',
    avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Christchurch',
    verified: true,
    is_published: true,
    bio: `Professional yoga instructor and mindfulness coach dedicated to helping others find inner peace and physical wellness. With over 10 years of practice and 5 years of teaching experience, I offer personalized sessions that blend traditional yoga with modern wellness techniques.

My background includes certifications in Hatha Yoga, Vinyasa Flow, and mindfulness meditation from internationally recognized institutions. I believe in creating a safe, non-judgmental space where everyone can explore their practice at their own pace.

Whether you're a complete beginner or looking to deepen your existing practice, I tailor each session to your specific needs and goals. My approach emphasizes proper alignment, breathwork, and the mind-body connection.

I also specialize in stress management techniques, helping busy professionals find balance and tranquility in their daily lives through the power of yoga and meditation.`,
    profile_photos: [
      'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3823207/pexels-photo-3823207.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'away',
    status_message: 'New client special: First session 20% off!',
    primary_location: 'Christchurch',
    service_areas: [
      { city: 'Christchurch', radius: 20 },
      { city: 'Timaru', radius: 25 }
    ],
    languages: [
      { language: 'English', proficiency: 'Fluent' },
      { language: 'Hindi', proficiency: 'Native' },
      { language: 'Sanskrit', proficiency: 'Conversational' }
    ],
    services: [
      {
        title: 'Private Yoga & Mindfulness Session',
        description: 'Personalized one-on-one yoga and meditation session tailored to your needs and experience level. Includes breathwork, gentle poses, and guided mindfulness practice.',
        price: 180,
        duration: 75,
        category: 'Wellness',
        images: [
          'https://images.pexels.com/photos/3823207/pexels-photo-3823207.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3822647/pexels-photo-3822647.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['yoga', 'meditation', 'mindfulness', 'private', 'wellness']
      },
      {
        title: 'Stress Relief & Balance Workshop',
        description: 'Intensive 2-hour session combining yoga, meditation, and practical stress management techniques. Perfect for those dealing with work pressure or life transitions.',
        price: 280,
        duration: 120,
        category: 'Wellness',
        images: [
          'https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['stress-relief', 'workshop', 'balance', 'intensive', 'life-coaching']
      }
    ]
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    name: 'Maya Thompson',
    email: 'maya.thompson@example.com',
    type: 'host',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Auckland',
    verified: true,
    is_published: true,
    bio: `Professional companion specializing in creating authentic connections and memorable experiences. With a background in psychology and hospitality, I understand the importance of genuine human interaction and emotional intelligence.

My approach is centered around active listening, empathy, and creating a comfortable environment where clients feel truly heard and valued. Whether you need someone to accompany you to social events, provide intellectual stimulation through deep conversation, or simply offer supportive companionship, I bring warmth and authenticity to every interaction.

I have experience working with diverse clients from various backgrounds and am skilled at adapting to different social situations with grace and confidence. My interests include literature, art, travel, and human psychology, which makes for engaging and meaningful conversations.

Confidentiality and respect are the foundation of my work. Every client deserves to feel safe, valued, and understood, and that's exactly what I strive to provide.`,
    profile_photos: [
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1036620/pexels-photo-1036620.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'busy',
    status_message: 'Available for dinner dates and social events',
    primary_location: 'Auckland',
    service_areas: [
      { city: 'Auckland', radius: 35 },
      { city: 'Tauranga', radius: 20 }
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'German', proficiency: 'Fluent' }
    ],
    services: [
      {
        title: 'Dinner Date Companionship',
        description: 'Elegant companion for dinner dates, providing engaging conversation and sophisticated presence. Perfect for business dinners, special occasions, or when you want to enjoy fine dining with delightful company.',
        price: 350,
        duration: 150,
        category: 'Companionship',
        images: [
          'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1036620/pexels-photo-1036620.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['dinner', 'elegant', 'conversation', 'sophisticated']
      },
      {
        title: 'Social Event Companion',
        description: 'Professional companion for parties, networking events, or social gatherings. I provide confident social support, helping you feel at ease and making great impressions.',
        price: 400,
        duration: 180,
        category: 'Social Events',
        images: [
          'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['social', 'networking', 'events', 'confident', 'support']
      }
    ]
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    name: 'Kaia Williams',
    email: 'kaia.williams@example.com',
    type: 'host',
    avatar: 'https://images.pexels.com/photos/1571153/pexels-photo-1571153.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Wellington',
    verified: true,
    is_published: true,
    bio: `Adventure companion and travel enthusiast passionate about exploring New Zealand's stunning landscapes and hidden gems. With extensive knowledge of local attractions, outdoor activities, and cultural experiences, I create unforgettable adventure experiences tailored to your interests.

As a certified outdoor guide and fitness enthusiast, I specialize in hiking, nature photography, wine tours, and cultural immersion experiences. Whether you're visiting New Zealand for the first time or you're a local looking to rediscover your own backyard, I bring energy, knowledge, and genuine passion to every adventure.

My approach combines physical activity with cultural education, ensuring you not only see the sights but truly understand and appreciate the natural beauty and rich heritage of New Zealand. Safety is always my top priority, and I'm trained in first aid and outdoor emergency procedures.

I love meeting new people and sharing the incredible experiences that New Zealand has to offer. Every adventure is customized to your fitness level, interests, and time constraints.`,
    profile_photos: [
      'https://images.pexels.com/photos/1571153/pexels-photo-1571153.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571181/pexels-photo-1571181.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571160/pexels-photo-1571160.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'away',
    status_message: 'Perfect hiking weather - book your adventure!',
    primary_location: 'Wellington',
    service_areas: [
      { city: 'Wellington', radius: 50 },
      { city: 'Nelson', radius: 40 },
      { city: 'Queenstown', radius: 30 }
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Maori', proficiency: 'Conversational' }
    ],
    services: [
      {
        title: 'Adventure Hiking Experience',
        description: 'Guided hiking adventure through New Zealand\'s most beautiful trails. Includes safety equipment, photography assistance, and local knowledge about flora, fauna, and geological features.',
        price: 300,
        duration: 240,
        category: 'Travel Companion',
        images: [
          'https://images.pexels.com/photos/1571181/pexels-photo-1571181.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1571160/pexels-photo-1571160.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['hiking', 'adventure', 'nature', 'photography', 'outdoor']
      },
      {
        title: 'Wellington Wine & Culture Tour',
        description: 'Private tour combining Wellington\'s best wineries with cultural landmarks. Includes transportation, wine tastings, gourmet food pairings, and insider stories about the region.',
        price: 380,
        duration: 300,
        category: 'Travel Companion',
        images: [
          'https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        tags: ['wine', 'culture', 'tour', 'wellington', 'gourmet', 'private']
      }
    ]
  }
];

async function createSampleProfiles() {
  try {
    console.log('🚀 Creating sample profiles...\n');

    for (const profile of sampleProfiles) {
      console.log(`Creating profile for ${profile.name}...`);
      
      // Insert user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert([{
          id: profile.id,
          name: profile.name,
          email: profile.email,
          type: profile.type,
          avatar: profile.avatar,
          location: profile.location,
          verified: profile.verified,
          is_published: profile.is_published,
          bio: profile.bio,
          profile_photos: profile.profile_photos,
          status: profile.status,
          status_message: profile.status_message,
          primary_location: profile.primary_location,
          service_areas: profile.service_areas,
          languages: profile.languages
        }])
        .select();

      if (userError) {
        console.error(`❌ Error creating user ${profile.name}:`, userError);
        continue;
      }

      console.log(`✅ Created user profile for ${profile.name}`);

      // Insert services for this host
      for (const service of profile.services) {
        const serviceData = {
          host_id: profile.id,
          host_name: profile.name,
          host_avatar: profile.avatar,
          title: service.title,
          description: service.description,
          price: service.price,
          duration: service.duration,
          category: service.category,
          location: profile.location,
          images: service.images,
          tags: service.tags,
          verified: profile.verified,
          rating: 4.8 + Math.random() * 0.2, // Random rating between 4.8-5.0
          review_count: Math.floor(Math.random() * 50) + 10, // Random reviews 10-60
          available: true
        };

        const { error: serviceError } = await supabase
          .from('services')
          .upsert([serviceData]);

        if (serviceError) {
          console.error(`❌ Error creating service "${service.title}":`, serviceError);
        } else {
          console.log(`   ✅ Created service: ${service.title}`);
        }
      }

      console.log('');
    }

    console.log('🎉 All sample profiles created successfully!\n');
    
    // Verify creation
    const { data: users, error } = await supabase
      .from('users')
      .select('name, email, type, is_published')
      .eq('is_published', true);

    if (!error && users) {
      console.log('📊 Published profiles in database:');
      users.forEach(user => {
        console.log(`   • ${user.name} (${user.email}) - ${user.type}`);
      });
    }

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('title, host_name, price, category')
      .eq('available', true);

    if (!servicesError && services) {
      console.log(`\n📋 Total services available: ${services.length}`);
      console.log('Services by category:');
      const categories = {};
      services.forEach(service => {
        categories[service.category] = (categories[service.category] || 0) + 1;
      });
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`   • ${category}: ${count} services`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating sample profiles:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleProfiles();
}

export { createSampleProfiles };