-- Shub Test Data Seed
-- Test host/worker profiles for development

-- ============================================
-- TEST USERS (HOSTS/WORKERS)
-- ============================================

INSERT INTO users (id, display_name, email, role, avatar_url, is_verified, is_active) VALUES
-- Auckland hosts
('11111111-1111-1111-1111-111111111111', 'Sophie', 'sophie@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', true, true),
('22222222-2222-2222-2222-222222222222', 'Emma', 'emma@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', true, true),
('33333333-3333-3333-3333-333333333333', 'Mia', 'mia@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', true, true),
('44444444-4444-4444-4444-444444444444', 'Olivia', 'olivia@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', false, true),

-- Wellington hosts
('55555555-5555-5555-5555-555555555555', 'Ava', 'ava@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', true, true),
('66666666-6666-6666-6666-666666666666', 'Isabella', 'isabella@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400', true, true),

-- Christchurch hosts
('77777777-7777-7777-7777-777777777777', 'Charlotte', 'charlotte@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, true),
('88888888-8888-8888-8888-888888888888', 'Amelia', 'amelia@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', true, true),

-- Queenstown hosts
('99999999-9999-9999-9999-999999999999', 'Harper', 'harper@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', true, true),

-- Hamilton host
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lily', 'lily@test.shub.nz', 'worker', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400', true, true),

-- Test clients
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Client', 'client@test.shub.nz', 'client', null, true, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Demo User', 'demo@test.shub.nz', 'client', null, false, true),

-- Admin user
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Admin', 'admin@shub.nz', 'admin', null, true, true);

-- ============================================
-- WORKER PROFILES
-- ============================================

INSERT INTO worker_profiles (user_id, bio, tagline, services, region, city, availability, hourly_rate_text, min_rate, max_rate, photo_album, condoms_mandatory, published, rating, review_count, response_time, languages, age, gender, body_type, height, ethnicity, hair_color, eye_color) VALUES

-- Sophie - Auckland CBD
('11111111-1111-1111-1111-111111111111',
'Hi there! I''m Sophie, a friendly and professional companion based in Auckland CBD. I love meeting new people and creating memorable experiences. Whether you''re looking for dinner company, a travel companion, or something more intimate, I''m here to make your time special. I pride myself on being punctual, discreet, and always putting your comfort first.',
'Your perfect companion for any occasion',
ARRAY['Companionship', 'Dinner Dates', 'Travel Companion', 'GFE', 'Massage'],
'Auckland', 'Auckland CBD',
ARRAY['Mon 10am-8pm', 'Tue 10am-8pm', 'Wed 10am-8pm', 'Thu 10am-8pm', 'Fri 10am-10pm', 'Sat 12pm-10pm'],
'$300-500/hr',
300, 500,
ARRAY['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800'],
true, true,
4.9, 47, 'Usually responds within 1 hour',
ARRAY['English', 'French'],
26, 'Female', 'Slim', '170cm', 'European', 'Blonde', 'Blue'),

-- Emma - North Shore
('22222222-2222-2222-2222-222222222222',
'Hey! I''m Emma, a bubbly and adventurous companion on Auckland''s beautiful North Shore. I''m passionate about fitness, good conversation, and creating genuine connections. I offer a range of services from casual companionship to intimate encounters. Safety and discretion are my top priorities.',
'Adventure awaits with me',
ARRAY['Companionship', 'GFE', 'Couples', 'Overnights', 'Events'],
'Auckland', 'North Shore',
ARRAY['Mon 2pm-10pm', 'Tue 2pm-10pm', 'Wed OFF', 'Thu 2pm-10pm', 'Fri 2pm-12am', 'Sat 2pm-12am', 'Sun 4pm-10pm'],
'$250-400/hr',
250, 400,
ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800'],
true, true,
4.7, 32, 'Usually responds within 2 hours',
ARRAY['English'],
24, 'Female', 'Athletic', '165cm', 'European', 'Brown', 'Green'),

-- Mia - Auckland South
('33333333-3333-3333-3333-333333333333',
'Kia ora! I''m Mia, a warm and sensual Kiwi girl from South Auckland. I bring authentic Kiwi hospitality to every encounter. I''m known for my infectious laugh and ability to make anyone feel at ease. Come experience genuine NZ warmth!',
'Authentic Kiwi warmth',
ARRAY['Companionship', 'GFE', 'Massage', 'BDSM Light'],
'Auckland', 'South Auckland',
ARRAY['Tue 11am-7pm', 'Wed 11am-7pm', 'Thu 11am-7pm', 'Fri 11am-9pm', 'Sat 1pm-9pm'],
'$200-350/hr',
200, 350,
ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'],
true, true,
4.8, 28, 'Usually responds within 30 mins',
ARRAY['English', 'Te Reo Maori'],
28, 'Female', 'Curvy', '163cm', 'Maori/Pacific', 'Black', 'Brown'),

-- Olivia - Auckland (Unverified)
('44444444-4444-4444-4444-444444444444',
'Hello! I''m Olivia, new to the scene but eager to connect. I''m a university student looking to meet interesting people and have fun experiences. Still building my reputation but I promise quality time!',
'Fresh face, genuine connection',
ARRAY['Companionship', 'Dinner Dates', 'GFE'],
'Auckland', 'Auckland CBD',
ARRAY['Fri 6pm-11pm', 'Sat 2pm-11pm', 'Sun 2pm-8pm'],
'$200-300/hr',
200, 300,
ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'],
true, true,
0, 0, 'Usually responds within 4 hours',
ARRAY['English', 'Mandarin'],
22, 'Female', 'Petite', '158cm', 'Asian', 'Black', 'Brown'),

-- Ava - Wellington CBD
('55555555-5555-5555-5555-555555555555',
'Welcome! I''m Ava, Wellington''s premier companion. I combine intelligence with sensuality - perfect for professional gentlemen who appreciate stimulating conversation as much as physical connection. I''m a trained masseuse and offer the complete girlfriend experience.',
'Intelligence meets sensuality',
ARRAY['Companionship', 'GFE', 'Massage', 'Dinner Dates', 'Overnights', 'Travel Companion'],
'Wellington', 'Wellington CBD',
ARRAY['Mon 10am-6pm', 'Tue 10am-6pm', 'Wed 10am-6pm', 'Thu 10am-6pm', 'Fri 10am-8pm'],
'$350-600/hr',
350, 600,
ARRAY['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800'],
true, true,
5.0, 63, 'Usually responds within 1 hour',
ARRAY['English', 'Spanish', 'Italian'],
30, 'Female', 'Slim', '175cm', 'European', 'Dark Brown', 'Hazel'),

-- Isabella - Lower Hutt
('66666666-6666-6666-6666-666666666666',
'Hi lovely! I''m Isabella, your Latin lover in the Wellington region. I bring passion, fire, and genuine warmth to every encounter. Originally from Brazil, I''ve called NZ home for 5 years. Let me show you what real passion feels like!',
'Latin passion, Kiwi heart',
ARRAY['GFE', 'Massage', 'Companionship', 'Couples'],
'Wellington', 'Lower Hutt',
ARRAY['Mon 12pm-8pm', 'Wed 12pm-8pm', 'Thu 12pm-8pm', 'Sat 10am-10pm'],
'$250-400/hr',
250, 400,
ARRAY['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800'],
true, true,
4.6, 19, 'Usually responds within 2 hours',
ARRAY['English', 'Portuguese', 'Spanish'],
27, 'Female', 'Curvy', '168cm', 'Latina', 'Black', 'Brown'),

-- Charlotte - Christchurch
('77777777-7777-7777-7777-777777777777',
'Hello darling! I''m Charlotte, Christchurch''s sophisticated companion. I specialize in providing a high-end, discreet service for discerning gentlemen. Whether it''s a corporate event, fine dining, or private time, I ensure every moment is exceptional.',
'Sophistication and discretion',
ARRAY['Companionship', 'Events', 'Dinner Dates', 'GFE', 'Travel Companion', 'Overnights'],
'Canterbury', 'Christchurch',
ARRAY['Tue 11am-7pm', 'Wed 11am-7pm', 'Thu 11am-7pm', 'Fri 11am-9pm', 'Sat 11am-9pm'],
'$400-700/hr',
400, 700,
ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
true, true,
4.9, 51, 'Usually responds within 1 hour',
ARRAY['English', 'French'],
32, 'Female', 'Slim', '172cm', 'European', 'Blonde', 'Blue'),

-- Amelia - Christchurch
('88888888-8888-8888-8888-888888888888',
'Hey there! I''m Amelia, a fun-loving companion in Christchurch. I''m the girl next door with a naughty side! I love Netflix, hiking, and creating unforgettable experiences. Down to earth and always up for a good time.',
'Girl next door with a twist',
ARRAY['Companionship', 'GFE', 'Massage'],
'Canterbury', 'Christchurch',
ARRAY['Mon 4pm-10pm', 'Tue 4pm-10pm', 'Thu 4pm-10pm', 'Fri 2pm-12am', 'Sat 2pm-12am'],
'$200-350/hr',
200, 350,
ARRAY['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800'],
true, true,
4.5, 15, 'Usually responds within 3 hours',
ARRAY['English'],
25, 'Female', 'Athletic', '167cm', 'European', 'Auburn', 'Green'),

-- Harper - Queenstown
('99999999-9999-9999-9999-999999999999',
'G''day! I''m Harper, Queenstown''s adventure companion. When I''m not on the slopes or jumping out of planes, I''m providing premium companionship services. Perfect for tourists wanting a local guide with benefits, or locals looking for excitement!',
'Adventure capital companion',
ARRAY['Companionship', 'Travel Companion', 'GFE', 'Dinner Dates', 'Overnights'],
'Otago', 'Queenstown',
ARRAY['Wed 10am-8pm', 'Thu 10am-8pm', 'Fri 10am-10pm', 'Sat 10am-10pm', 'Sun 10am-6pm'],
'$350-550/hr',
350, 550,
ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800'],
true, true,
4.8, 38, 'Usually responds within 2 hours',
ARRAY['English', 'German'],
29, 'Female', 'Athletic', '170cm', 'European', 'Blonde', 'Blue'),

-- Lily - Hamilton
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
'Heya! I''m Lily, Hamilton''s sweetheart. I''m a genuine, caring companion who loves making people feel special. I offer a relaxed, no-rush experience in the heart of the Waikato. Let''s escape the ordinary together!',
'Hamilton''s sweetheart',
ARRAY['Companionship', 'GFE', 'Massage', 'Dinner Dates'],
'Waikato', 'Hamilton',
ARRAY['Mon 10am-6pm', 'Tue 10am-6pm', 'Wed 10am-6pm', 'Thu 10am-6pm', 'Fri 10am-8pm'],
'$180-300/hr',
180, 300,
ARRAY['https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800'],
true, true,
4.7, 22, 'Usually responds within 1 hour',
ARRAY['English'],
26, 'Female', 'Curvy', '165cm', 'European', 'Red', 'Green');

-- ============================================
-- CLIENT PROFILES
-- ============================================

INSERT INTO client_profiles (user_id, preferences, saved_workers) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '{"preferred_region": "Auckland", "preferred_services": ["GFE", "Dinner Dates"]}',
 ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid]),
('cccccccc-cccc-cccc-cccc-cccccccccccc',
 '{"preferred_region": "Wellington"}',
 ARRAY[]::uuid[]);

-- ============================================
-- SAMPLE SERVICES
-- ============================================

INSERT INTO services (worker_id, title, description, price, duration, category, is_active) VALUES
-- Sophie's services
('11111111-1111-1111-1111-111111111111', 'Quick Connect', 'Perfect for a brief, quality encounter', 300, 60, 'Standard', true),
('11111111-1111-1111-1111-111111111111', 'Extended Experience', 'More time to connect and enjoy', 500, 120, 'Extended', true),
('11111111-1111-1111-1111-111111111111', 'Dinner Date', 'Fine dining and delightful company', 600, 180, 'Social', true),

-- Emma's services
('22222222-2222-2222-2222-222222222222', 'Introductory Session', 'Get to know each other', 250, 60, 'Standard', true),
('22222222-2222-2222-2222-222222222222', 'Couples Experience', 'Special service for adventurous couples', 600, 120, 'Couples', true),

-- Ava's services
('55555555-5555-5555-5555-555555555555', 'Premium Hour', 'The ultimate girlfriend experience', 400, 60, 'Premium', true),
('55555555-5555-5555-5555-555555555555', 'Sensual Massage', 'Professional relaxation with a sensual touch', 350, 90, 'Massage', true),
('55555555-5555-5555-5555-555555555555', 'Overnight Escape', 'A full evening of companionship', 2000, 720, 'Overnight', true),

-- Charlotte's services
('77777777-7777-7777-7777-777777777777', 'Executive Companion', 'Perfect for business events', 500, 120, 'Social', true),
('77777777-7777-7777-7777-777777777777', 'Weekend Getaway', 'Travel companion for your adventures', 3500, 1440, 'Travel', true);

-- ============================================
-- SAMPLE REVIEWS
-- ============================================

INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment, is_public) VALUES
(null, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 5, 'Absolutely wonderful experience. Sophie is everything her profile promises and more. Professional, punctual, and genuinely enjoyable company.', true),
(null, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 5, 'Ava is simply the best. Intelligent conversation, beautiful, and made me feel completely at ease. Will definitely see again.', true),
(null, 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 5, 'Charlotte accompanied me to a work function and was the perfect date. Elegant, charming, and professional throughout.', true);

-- ============================================
-- SAMPLE FAVORITES
-- ============================================

INSERT INTO favorites (client_id, worker_id) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777');

-- ============================================
-- SAMPLE AVAILABILITY SLOTS
-- ============================================

-- Sophie's weekly availability
INSERT INTO availability_slots (worker_id, day_of_week, start_time, end_time) VALUES
('11111111-1111-1111-1111-111111111111', 1, '10:00', '20:00'), -- Monday
('11111111-1111-1111-1111-111111111111', 2, '10:00', '20:00'), -- Tuesday
('11111111-1111-1111-1111-111111111111', 3, '10:00', '20:00'), -- Wednesday
('11111111-1111-1111-1111-111111111111', 4, '10:00', '20:00'), -- Thursday
('11111111-1111-1111-1111-111111111111', 5, '10:00', '22:00'), -- Friday
('11111111-1111-1111-1111-111111111111', 6, '12:00', '22:00'); -- Saturday

-- Ava's weekly availability
INSERT INTO availability_slots (worker_id, day_of_week, start_time, end_time) VALUES
('55555555-5555-5555-5555-555555555555', 1, '10:00', '18:00'),
('55555555-5555-5555-5555-555555555555', 2, '10:00', '18:00'),
('55555555-5555-5555-5555-555555555555', 3, '10:00', '18:00'),
('55555555-5555-5555-5555-555555555555', 4, '10:00', '18:00'),
('55555555-5555-5555-5555-555555555555', 5, '10:00', '20:00');
