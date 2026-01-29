-- Add support for host role toggle functionality
-- Hosts can toggle between host view and client view
-- Clients stay as clients, Guests stay as guests

-- Add current_role column to track active view mode for hosts
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_role text
CHECK (current_role IN ('host', 'client'));

-- Set default current_role for existing users
UPDATE users
SET current_role = type
WHERE current_role IS NULL;

-- Create index for efficient role-based queries
CREATE INDEX IF NOT EXISTS idx_users_current_role ON users(current_role);