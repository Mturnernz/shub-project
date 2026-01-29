/*
  # Allow anonymous users to read published host profiles

  1. Security Policy
    - Add policy to allow anonymous (guest) users to read published host profiles
    - Restricts access to only hosts where `type = 'host'` AND `is_published = true`
    - Ensures guests can view host information for services but cannot access unpublished or client profiles

  This policy enables guest users to:
  - View published host profiles when browsing services
  - See host information in service details
  - Access necessary host data for service previews
*/

CREATE POLICY "Allow anon to read published host profiles"
  ON users
  FOR SELECT
  TO anon
  USING (type = 'host' AND is_published = true);