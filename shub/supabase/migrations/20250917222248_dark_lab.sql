/*
  # Fix services display issue

  1. Schema Updates
    - Add missing `is_published` column to users table
    - Add missing `tags` column to services table
    - Add status constraint to users table

  2. Sample Data
    - Create some sample published hosts
    - Create sample services for these hosts

  3. Data Integrity
    - Set appropriate defaults for new columns
    - Ensure existing data works with new schema
*/

-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Add status constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_status_check'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_status_check CHECK (status IN ('available', 'busy', 'away'));
    END IF;
END $$;

-- Add missing tags column to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create sample published hosts
INSERT INTO public.users (
    id,
    name,
    email,
    type,
    avatar,
    location,
    verified,
    is_published,
    created_at
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Sophia Clarke',
    'sophia.clarke@example.com',
    'host',
    'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Auckland',
    true,
    true,
    now() - interval '15 days'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Isabella Rose', 
    'isabella.rose@example.com',
    'host',
    'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Wellington',
    true,
    true,
    now() - interval '10 days'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Emma Davis',
    'emma.davis@example.com', 
    'host',
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Christchurch',
    true,
    true,
    now() - interval '8 days'
)
ON CONFLICT (id) DO NOTHING;

-- Create sample services
INSERT INTO public.services (
    id,
    host_id,
    host_name,
    host_avatar,
    title,
    description,
    price,
    duration,
    category,
    location,
    images,
    tags,
    verified,
    rating,
    review_count,
    available,
    created_at
) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Sophia Clarke',
    'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Premium Companionship',
    'Professional companion services for social events, dinners, and private occasions. Discreet and sophisticated.',
    300,
    120,
    'Companionship',
    'Auckland',
    ARRAY[
        'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    ARRAY['professional', 'premium', 'discreet'],
    true,
    4.9,
    47,
    true,
    now() - interval '14 days'
),
(
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'Isabella Rose',
    'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Elite Evening Services',
    'Sophisticated evening companionship with a focus on creating memorable experiences. Available for outcalls.',
    450,
    180,
    'Evening Services',
    'Wellington',
    ARRAY[
        'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    ARRAY['elite', 'evening', 'outcall'],
    true,
    4.8,
    32,
    true,
    now() - interval '12 days'
),
(
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    'Emma Davis',
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Relaxation & Wellness',
    'Professional therapeutic services focusing on relaxation and wellness. Private studio available.',
    250,
    90,
    'Wellness',
    'Christchurch',
    ARRAY[
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    ARRAY['wellness', 'therapeutic', 'relaxation'],
    true,
    4.7,
    28,
    true,
    now() - interval '9 days'
),
(
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'Sophia Clarke',
    'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Social Event Companion',
    'Perfect companion for business events, weddings, and social gatherings. Elegant and professional.',
    350,
    240,
    'Social Events',
    'Auckland',
    ARRAY[
        'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    ARRAY['social', 'events', 'business', 'weddings'],
    true,
    4.9,
    18,
    true,
    now() - interval '6 days'
),
(
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222', 
    'Isabella Rose',
    'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Travel Companion',
    'Sophisticated travel companion for business trips or leisure travel. Cultured and well-traveled.',
    500,
    480,
    'Travel Companion',
    'Wellington',
    ARRAY[
        'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    ARRAY['travel', 'business', 'cultured', 'sophisticated'],
    true,
    4.8,
    12,
    true,
    now() - interval '4 days'
)
ON CONFLICT (id) DO NOTHING;