// Test Host Account Creator for Local Development
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

const testHostData = {
  email: 'testhost@example.com',
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

async function createTestHost() {
  try {
    console.log('🚀 Creating test host account...');

    // 1. Try to sign in first (in case user already exists)
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testHostData.email,
      password: testHostData.password
    });

    let authData = signInData;

    // 2. If sign in fails, try to create the user
    if (signInError) {
      console.log('User does not exist or cannot sign in, creating new user...');

      const { data: newAuthData, error: authError } = await supabase.auth.signUp({
        email: testHostData.email,
        password: testHostData.password,
        options: {
          data: {
            name: testHostData.name,
            type: testHostData.type
          },
          emailRedirectTo: undefined
        }
      });

      if (authError) {
        console.error('❌ Auth error:', authError.message);
        return;
      }

      console.log('✅ Auth user created:', newAuthData.user?.email);
      authData = newAuthData;

      // Try to sign in again
      const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
        email: testHostData.email,
        password: testHostData.password
      });

      if (retrySignInError) {
        console.log('⚠️  User created but email confirmation required. Using auth data from signup...');
        console.log('ℹ️  Note: Some operations may not work until email is confirmed');
      } else {
        console.log('✅ User signed in successfully');
        authData = retrySignInData;
      }
    } else {
      console.log('✅ User signed in successfully (existing account)');
    }

    // 3. Create user profile (now authenticated)
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
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
        return;
      }

      console.log('✅ User profile created');

      // 4. Create sample services
      const sampleServices = [
        {
          host_id: authData.user.id,
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
          available: true,
          tags: ['massage', 'relaxation', 'wellness']
        },
        {
          host_id: authData.user.id,
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
          available: true,
          tags: ['massage', 'deep-tissue', 'therapeutic']
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

    console.log('\n🎉 Test host account created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log(`   Email: ${testHostData.email}`);
    console.log(`   Password: ${testHostData.password}`);
    console.log('\n🔗 Test at: http://localhost:5174/');
    console.log('\n💡 Note: If email verification is required, check your Supabase auth logs');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createTestHost();