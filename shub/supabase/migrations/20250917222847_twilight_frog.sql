/*
  # Add sample published host and services

  1. Updates
    - Mark sample hosts as published
    - Ensure sample services are available

  This migration creates sample data so you can immediately see services when browsing as a guest.
*/

-- Mark existing sample users as published (if they exist)
UPDATE users 
SET is_published = true 
WHERE email IN ('sophia@example.com', 'isabella@example.com', 'emma@example.com');

-- Create sample hosts if they don't exist
INSERT INTO users (id, name, email, type, avatar, location, verified, is_published, bio, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Sophia Clarke', 'sophia@example.com', 'host', 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400', 'Auckland', true, true, 'Professional and discreet companion with years of experience. I specialize in creating memorable experiences for social events, business functions, and private occasions. My approach focuses on genuine connection and ensuring you feel comfortable and confident.', 'available'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Isabella Rose', 'isabella@example.com', 'host', 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400', 'Wellington', true, true, 'Elite companion specializing in sophisticated evening services. I bring elegance and charm to any occasion, whether it''s a dinner date, cultural event, or private gathering. My goal is to provide you with an exceptional and unforgettable experience.', 'available'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Emma Davis', 'emma@example.com', 'host', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400', 'Christchurch', true, true, 'Wellness and relaxation specialist focused on therapeutic services. I provide a calming and professional environment in my private studio. My services are designed to help you unwind, destress, and feel rejuvenated.', 'available')
ON CONFLICT (id) DO UPDATE SET
  is_published = EXCLUDED.is_published,
  bio = EXCLUDED.bio,
  status = EXCLUDED.status;

-- Create sample services if they don't exist
INSERT INTO services (id, host_id, host_name, host_avatar, title, description, price, duration, category, location, images, verified, rating, review_count, available, tags)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Sophia Clarke', 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400', 'Premium Companionship', 'Professional companion services for social events, dinners, and private occasions. Discreet and sophisticated approach with focus on creating memorable experiences.', 300, 120, 'Companionship', 'Auckland', ARRAY['https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800'], true, 4.9, 47, true, ARRAY['professional', 'discreet', 'premium']),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Isabella Rose', 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400', 'Elite Evening Services', 'Sophisticated evening companionship with focus on creating memorable experiences. Available for outcalls and special events.', 450, 180, 'Evening Services', 'Wellington', ARRAY['https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800'], true, 4.8, 32, true, ARRAY['elite', 'evening', 'outcall']),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Emma Davis', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400', 'Relaxation & Wellness', 'Professional therapeutic services focusing on relaxation and wellness. Private studio available with calming atmosphere.', 250, 90, 'Wellness', 'Christchurch', ARRAY['https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800'], true, 4.7, 28, true, ARRAY['wellness', 'therapeutic', 'relaxation'])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration = EXCLUDED.duration,
  category = EXCLUDED.category,
  available = EXCLUDED.available,
  tags = EXCLUDED.tags;