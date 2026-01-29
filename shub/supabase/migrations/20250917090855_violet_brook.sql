@@ .. @@
 /*
   # Initial Database Schema Setup
 
   1. New Tables
     - `users`
       - `id` (uuid, primary key)
       - `name` (text)
       - `email` (text, unique)
       - `type` (text, host/client)
       - `avatar` (text, optional)
       - `location` (text, optional) 
       - `verified` (boolean, default false)
       - `created_at` (timestamp)
     - `services`
       - `id` (uuid, primary key)
       - `host_id` (uuid, foreign key to users)
       - `host_name` (text)
       - `host_avatar` (text, optional)
       - `title` (text)
       - `description` (text)
       - `price` (numeric, must be > 0)
       - `duration` (integer, must be > 0) 
       - `category` (text)
       - `location` (text)
       - `images` (text array)
       - `verified` (boolean, default false)
       - `rating` (numeric, 0-5 range)
       - `review_count` (integer, >= 0)
       - `available` (boolean, default true)
       - `created_at` (timestamp)
     - `bookings`
       - `id` (uuid, primary key)
       - `service_id` (uuid, foreign key to services)
       - `client_id` (uuid, foreign key to users)
       - `host_id` (uuid, foreign key to users)
       - `date` (timestamp)
       - `status` (text, enum values)
       - `total_amount` (numeric, must be > 0)
       - `created_at` (timestamp)
 
   2. Security
     - Enable RLS on all tables
     - Add policies for users to read/update own data
     - Add policies for services (public read, host manage)
     - Add policies for bookings (user-specific access)
 
   3. Performance
     - Add indexes on frequently queried columns
 */
 
 -- Drop existing policies to avoid conflicts
 DROP POLICY IF EXISTS "Users can read own data" ON users;
 DROP POLICY IF EXISTS "Users can update own data" ON users;
 DROP POLICY IF EXISTS "Users can insert own data" ON users;
 DROP POLICY IF EXISTS "Anyone can read available services" ON services;
 DROP POLICY IF EXISTS "Hosts can manage their services" ON services;
 DROP POLICY IF EXISTS "Users can read their bookings" ON bookings;
 DROP POLICY IF EXISTS "Clients can create bookings" ON bookings;
 DROP POLICY IF EXISTS "Hosts and clients can update their bookings" ON bookings;
 
 -- Create users table
 CREATE TABLE IF NOT EXISTS users (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   name text NOT NULL,
   email text UNIQUE NOT NULL,
   type text NOT NULL CHECK (type IN ('host', 'client')),
   avatar text,
   location text,
   verified boolean DEFAULT false,
   created_at timestamptz DEFAULT now()
 );
 
 -- Create services table
 CREATE TABLE IF NOT EXISTS services (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   host_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
   host_name text NOT NULL,
   host_avatar text,
   title text NOT NULL,
   description text NOT NULL,
   price numeric NOT NULL CHECK (price > 0),
   duration integer NOT NULL CHECK (duration > 0),
   category text NOT NULL,
   location text NOT NULL,
   images text[] DEFAULT '{}',
   verified boolean DEFAULT false,
   rating numeric DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
   review_count integer DEFAULT 0 CHECK (review_count >= 0),
   available boolean DEFAULT true,
   created_at timestamptz DEFAULT now()
 );
 
 -- Create bookings table
 CREATE TABLE IF NOT EXISTS bookings (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   service_id uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
   client_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
   host_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
   date timestamptz NOT NULL,
   status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
   total_amount numeric NOT NULL CHECK (total_amount > 0),
   created_at timestamptz DEFAULT now()
 );
 
 -- Enable Row Level Security
 ALTER TABLE users ENABLE ROW LEVEL SECURITY;
 ALTER TABLE services ENABLE ROW LEVEL SECURITY;
 ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
 
 -- Users policies
 CREATE POLICY "Users can read own data"
   ON users
   FOR SELECT
   TO authenticated
   USING (auth.uid() = id);
 
 CREATE POLICY "Users can update own data"
   ON users
   FOR UPDATE
   TO authenticated
   USING (auth.uid() = id);
 
 CREATE POLICY "Users can insert own data"
   ON users
   FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = id);
 
 -- Services policies
 CREATE POLICY "Anyone can read available services"
   ON services
   FOR SELECT
   TO anon, authenticated
   USING (available = true);
 
 CREATE POLICY "Hosts can manage their services"
   ON services
   FOR ALL
   TO authenticated
   USING (host_id = auth.uid());
 
 -- Bookings policies
 CREATE POLICY "Users can read their bookings"
   ON bookings
   FOR SELECT
   TO authenticated
   USING (client_id = auth.uid() OR host_id = auth.uid());
 
 CREATE POLICY "Clients can create bookings"
   ON bookings
   FOR INSERT
   TO authenticated
   WITH CHECK (client_id = auth.uid());
 
 CREATE POLICY "Hosts and clients can update their bookings"
   ON bookings
   FOR UPDATE
   TO authenticated
   USING (client_id = auth.uid() OR host_id = auth.uid());
 
 -- Create indexes for better performance
 CREATE INDEX IF NOT EXISTS idx_services_host_id ON services(host_id);
 CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
 CREATE INDEX IF NOT EXISTS idx_services_location ON services(location);
 CREATE INDEX IF NOT EXISTS idx_services_available ON services(available);
 CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
 CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
 CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
 CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);