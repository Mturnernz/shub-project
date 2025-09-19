-- Add is_published column to users table
ALTER TABLE public.users ADD COLUMN is_published BOOLEAN DEFAULT FALSE;