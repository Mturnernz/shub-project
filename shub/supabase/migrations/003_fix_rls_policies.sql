-- Fix RLS policies to allow users to create their own profile

-- Allow authenticated users to insert their own user record
CREATE POLICY "Users can insert own record" ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to read their own record even if not in the table yet
CREATE POLICY "Users can read own record" ON users
FOR SELECT
USING (auth.uid() = id);
