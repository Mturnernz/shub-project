/*
  # Seed Sample Data for Shub Marketplace

  1. Sample Data
    - Insert sample users (hosts and clients)
    - Insert sample services
    - Insert sample bookings

  This migration adds sample data to help with development and testing.
*/

-- Insert sample users
INSERT INTO users (id, name, email, type, avatar, location, verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sophia Clarke', 'sophia@example.com', 'host', 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400', 'Auckland', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Isabella Rose', 'isabella@example.com', 'host', 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400', 'Wellington', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Emma Davis', 'emma@example.com', 'host', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400', 'Christchurch', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'James Wilson', 'james@example.com', 'client', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400', 'Auckland', true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Sarah Johnson', 'sarah@example.com', 'client', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400', 'Wellington', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample services
INSERT INTO services (id, host_id, host_name, host_avatar, title, description, price, duration, category, location, images, verified, rating, review_count, available) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Sophia Clarke', 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400', 'Premium Companionship', 'Professional companion services for social events, dinners, and private occasions. Discreet and sophisticated.', 300, 120, 'Companionship', 'Auckland', ARRAY['https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800'], true, 4.9, 47, true),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Isabella Rose', 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400', 'Elite Evening Services', 'Sophisticated evening companionship with a focus on creating memorable experiences. Available for outcalls.', 450, 180, 'Evening Services', 'Wellington', ARRAY['https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800'], true, 4.8, 32, true),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Emma Davis', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400', 'Relaxation & Wellness', 'Professional therapeutic services focusing on relaxation and wellness. Private studio available.', 250, 90, 'Wellness', 'Christchurch', ARRAY['https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800'], true, 4.7, 28, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample bookings
INSERT INTO bookings (id, service_id, client_id, host_id, date, status, total_amount) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15 19:00:00+00', 'confirmed', 300),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '2024-01-20 20:00:00+00', 'pending', 450)
ON CONFLICT (id) DO NOTHING;