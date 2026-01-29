// Create Confirmed Test Host Account
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testHostData = {
  email: 'alex.host@gmail.com', // Use a real Gmail address pattern
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

async function createConfirmedHost() {
  console.log('🚀 Creating confirmed test host account...');
  console.log('📧 Email:', testHostData.email);
  console.log('🔑 Password:', testHostData.password);
  console.log('');

  try {
    // Step 1: Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testHostData.email,
      password: testHostData.password,
      options: {
        data: {
          name: testHostData.name,
          type: testHostData.type
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ User already exists, trying to sign in...');

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testHostData.email,
          password: testHostData.password
        });

        if (signInError) {
          console.error('❌ Cannot sign in:', signInError.message);
          console.log('');
          console.log('🛠️  Manual Setup Required:');
          console.log('1. Go to your Supabase Dashboard');
          console.log('2. Navigate to Authentication > Users');
          console.log(`3. Find user: ${testHostData.email}`);
          console.log('4. Click on the user and mark "Email Confirmed" as true');
          console.log('5. Try logging in again');
          return;
        }

        console.log('✅ Signed in successfully!');
        await createUserProfile(signInData.user);
        return;
      }

      console.error('❌ Signup error:', authError.message);
      return;
    }

    if (authData.user) {
      console.log('✅ User created:', authData.user.email);

      if (authData.user.email_confirmed_at) {
        console.log('✅ Email already confirmed!');
        await createUserProfile(authData.user);
      } else {
        console.log('⚠️  Email confirmation required');
        console.log('');
        console.log('🛠️  Manual Confirmation Steps:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to Authentication > Users');
        console.log(`3. Find user: ${testHostData.email}`);
        console.log('4. Click on the user and set "Email Confirmed" to true');
        console.log('5. Run this script again to complete setup');
        console.log('');
        console.log('OR try these credentials once confirmed:');
        console.log(`Email: ${testHostData.email}`);
        console.log(`Password: ${testHostData.password}`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function createUserProfile(user) {
  try {
    // Try to sign in to get a valid session
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: testHostData.email,
      password: testHostData.password
    });

    if (signInError) {
      console.error('❌ Cannot sign in to create profile:', signInError.message);
      return;
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      console.log('✅ Profile already exists');
      await createSampleServices(user.id);
      console.log('');
      console.log('🎉 Setup complete!');
      printLoginInfo();
      return;
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          name: testHostData.name,
          email: testHostData.email,
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
      console.log('');
      console.log('🛠️  To create profile manually after login:');
      console.log('1. Sign in to the app with the credentials above');
      console.log('2. Complete your host profile in the app');
      printLoginInfo();
      return;
    }

    console.log('✅ Profile created successfully');

    await createSampleServices(user.id);

    console.log('');
    console.log('🎉 Test host setup completed!');
    printLoginInfo();

  } catch (error) {
    console.error('❌ Profile creation error:', error);
    printLoginInfo();
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

function printLoginInfo() {
  console.log('');
  console.log('📋 Test Host Login Info:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email: ${testHostData.email}`);
  console.log(`🔑 Password: ${testHostData.password}`);
  console.log('🌐 URL: http://localhost:5173/');
  console.log('');
  console.log('👤 Host Details:');
  console.log(`   Name: ${testHostData.name}`);
  console.log(`   Location: ${testHostData.location}`);
  console.log(`   Verified: ${testHostData.verified ? 'Yes' : 'No'}`);
}

createConfirmedHost();