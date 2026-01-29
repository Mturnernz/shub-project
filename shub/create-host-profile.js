// Simple Host Profile Creator - Manual entry for existing auth user
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test host credentials - use these to log in manually first
const testHostData = {
  email: 'testhost@shub.local',
  password: 'TestHost123!',
  name: 'Alex Thompson',
  type: 'host',
  bio: 'Professional massage therapist with 5+ years experience. Specializing in deep tissue and relaxation massage.',
  location: 'Auckland, New Zealand',
  verified: true,
  profilePhotos: [
    'https://images.unsplash.com/photo-1594736797933-d0401ba19ab7?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
  ]
};

async function createHostProfile() {
  try {
    console.log('🔐 Please sign in with your test host account first in the browser:');
    console.log(`   Email: ${testHostData.email}`);
    console.log(`   Password: ${testHostData.password}`);
    console.log('   URL: http://localhost:5173/');
    console.log('');
    console.log('⏳ Waiting for authentication...');

    // Check if user is signed in
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ No authenticated user found. Please sign in first.');
      return;
    }

    console.log('✅ Authenticated user found:', user.email);

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      console.log('✅ Profile already exists for this user');
      console.log('Profile data:', existingProfile);
      await createSampleServices(user.id);
      return;
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          name: testHostData.name,
          email: user.email,
          type: testHostData.type,
          avatar: testHostData.profilePhotos[0],
          location: testHostData.location,
          verified: testHostData.verified
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError.message);
      return;
    }

    console.log('✅ User profile created successfully');

    // Create sample services
    await createSampleServices(user.id);

    console.log('\n🎉 Test host setup completed!');
    console.log('\n📧 Login Credentials:');
    console.log(`   Email: ${testHostData.email}`);
    console.log(`   Password: ${testHostData.password}`);
    console.log('\n🔗 Test at: http://localhost:5173/');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function createSampleServices(hostId) {
  const sampleServices = [
    {
      host_id: hostId,
      host_name: testHostData.name,
      host_avatar: testHostData.profilePhotos[0],
      title: 'Relaxation Massage',
      description: 'Professional relaxation massage to help you unwind and de-stress. 60-minute session in a calm, professional environment.',
      price: 120,
      duration: 60,
      category: 'Massage Therapy',
      location: 'Auckland CBD',
      images: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop'
      ],
      verified: true,
      rating: 4.8,
      review_count: 24,
      available: true
    },
    {
      host_id: hostId,
      host_name: testHostData.name,
      host_avatar: testHostData.profilePhotos[0],
      title: 'Deep Tissue Massage',
      description: 'Therapeutic deep tissue massage for muscle tension and pain relief. Perfect for athletes or those with chronic muscle issues.',
      price: 150,
      duration: 90,
      category: 'Massage Therapy',
      location: 'Auckland CBD',
      images: [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop'
      ],
      verified: true,
      rating: 4.9,
      review_count: 18,
      available: true
    }
  ];

  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .insert(sampleServices)
    .select();

  if (servicesError) {
    console.error('❌ Services creation error:', servicesError.message);
  } else {
    console.log('✅ Sample services created:', servicesData.length);
  }
}

console.log('📝 Host Profile Creator');
console.log('');
console.log('This script will create a test host profile for an authenticated user.');
console.log('');
console.log('Step 1: Sign in to your app at http://localhost:5173/');
console.log(`Step 2: Use email: ${testHostData.email} and password: ${testHostData.password}`);
console.log('Step 3: Keep the browser tab open and run this script');
console.log('');
console.log('Press Ctrl+C to cancel, or any key to continue...');

// Wait for user input
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  createHostProfile();
});