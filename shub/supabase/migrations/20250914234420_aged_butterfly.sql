/*
  # Create storage buckets for profile management
  
  1. Storage Buckets
    - `profile-photos` for user profile images
    - `qualification-docs` for certification documents
  
  2. Storage Policies
    - Users can upload their own files
    - Users can read their own files
    - Profile photos are publicly readable
*/

-- Create profile photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true);

-- Create qualification documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('qualification-docs', 'qualification-docs', false);

-- Profile photos policies
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Qualification documents policies
CREATE POLICY "Users can upload their own qualification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'qualification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own qualification docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'qualification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own qualification docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'qualification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own qualification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'qualification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);