-- Create storage buckets for profile management
-- Using ON CONFLICT to handle cases where buckets already exist

-- Create profile-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create qualification-docs bucket  
INSERT INTO storage.buckets (id, name, public)
VALUES ('qualification-docs', 'qualification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-photos bucket
-- Users can upload their own files
CREATE POLICY "Users can upload own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own files
CREATE POLICY "Users can read own profile photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Profile photos are publicly readable
CREATE POLICY "Profile photos are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Storage policies for qualification-docs bucket
-- Users can upload their own files
CREATE POLICY "Users can upload own qualification docs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'qualification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own files only
CREATE POLICY "Users can read own qualification docs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'qualification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);