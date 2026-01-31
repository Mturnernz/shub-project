-- Schema alignment migration: align database with foundational document requirements
-- Adds soft deletes, extended booking states, reviews, favorites, and JSONB metadata

-- =============================================================================
-- 1. Soft deletes: Add deleted_at to key tables
-- =============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add deleted_at filter to existing RLS policies
-- Users: filter out soft-deleted records on read
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
CREATE POLICY "Users can read their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Allow anon to read published host profiles" ON public.users;
CREATE POLICY "Allow anon to read published host profiles"
  ON public.users FOR SELECT TO anon
  USING (type = 'host' AND is_published = true AND deleted_at IS NULL);

-- =============================================================================
-- 2. JSONB metadata fields for extensibility
-- =============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- =============================================================================
-- 3. Reviews table (two-way: buyer_to_seller and seller_to_buyer)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  reviewer_id UUID NOT NULL REFERENCES public.users(id),
  reviewee_id UUID NOT NULL REFERENCES public.users(id),

  -- Rating breakdown (1-5 scale)
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  communication_rating SMALLINT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  accuracy_rating SMALLINT CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  experience_rating SMALLINT CHECK (experience_rating >= 1 AND experience_rating <= 5),

  -- Review content
  content TEXT NOT NULL CHECK (char_length(content) >= 20), -- Minimum to prevent drive-by ratings
  response TEXT, -- Reviewee can respond

  -- Status state machine
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'flagged', 'removed')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  -- Ensure one review per direction per booking
  UNIQUE(booking_id, reviewer_id)
);

-- RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read published reviews"
  ON public.reviews FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Users can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status) WHERE deleted_at IS NULL;

-- =============================================================================
-- 4. Favorites table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  favorited_user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, favorited_user_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_favorited ON public.favorites(favorited_user_id);

-- =============================================================================
-- 5. Indexes on deleted_at for soft delete queries
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at ON public.bookings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON public.reviews(deleted_at) WHERE deleted_at IS NULL;

-- =============================================================================
-- 6. Auto-update trigger for updated_at on reviews
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
