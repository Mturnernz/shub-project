-- =============================================================================
-- BASELINE SCHEMA: Shub 26 — Canonical Table Definitions
-- =============================================================================
-- Purpose:  Version-control every table in the live Shub 26 database so the
--           schema is reproducible from migrations alone (Recommendation 2).
--
-- Naming convention (Shub 26 canonical):
--   users.role          ('worker' | 'client' | 'admin')
--   services.worker_id  (FK → users.id)
--   worker_profiles      (extended worker data, published flag)
--
-- This file is CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- throughout, so it is safe to run against the existing live DB.
-- =============================================================================

-- Helper: auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name  VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  role          VARCHAR(20)  NOT NULL DEFAULT 'client'
                  CHECK (role IN ('worker','client','admin')),
  avatar_url    TEXT,
  is_verified   BOOLEAN      NOT NULL DEFAULT false,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  last_seen_at  TIMESTAMPTZ,
  current_role  VARCHAR(20),
  metadata      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  deleted_at    TIMESTAMPTZ  DEFAULT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email        ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_current_role ON public.users(current_role);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at   ON public.users(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 2. WORKER_PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio                 TEXT,
  tagline             VARCHAR(255),
  services            TEXT[]       DEFAULT '{}',
  region              VARCHAR(100) NOT NULL,
  city                VARCHAR(100),
  availability        TEXT[]       DEFAULT '{}',
  hourly_rate_text    VARCHAR(100),
  min_rate            INTEGER,
  max_rate            INTEGER,
  photo_album         TEXT[]       DEFAULT '{}',
  condoms_mandatory   BOOLEAN      NOT NULL DEFAULT true,
  published           BOOLEAN      NOT NULL DEFAULT false,
  rating              DECIMAL(2,1) NOT NULL DEFAULT 0,
  review_count        INTEGER      NOT NULL DEFAULT 0,
  response_time       VARCHAR(50),
  languages           TEXT[]       DEFAULT '{"English"}',
  age                 INTEGER,
  gender              VARCHAR(50),
  body_type           VARCHAR(50),
  height              VARCHAR(20),
  ethnicity           VARCHAR(50),
  hair_color          VARCHAR(50),
  eye_color           VARCHAR(50),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id   ON public.worker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_region    ON public.worker_profiles(region);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_published ON public.worker_profiles(published);

ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_worker_profiles_updated_at ON public.worker_profiles;
CREATE TRIGGER update_worker_profiles_updated_at
  BEFORE UPDATE ON public.worker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 3. CLIENT_PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  preferences     JSONB   NOT NULL DEFAULT '{}'::jsonb,
  saved_workers   UUID[]  DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON public.client_profiles;
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 4. SERVICES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  price         INTEGER,
  duration      INTEGER,           -- minutes
  category      VARCHAR(100),
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  worker_name   TEXT,               -- denormalised for listing performance
  worker_avatar TEXT,               -- denormalised for listing performance
  images        TEXT[]       DEFAULT '{}',
  tags          TEXT[]       DEFAULT '{}',
  verified      BOOLEAN      NOT NULL DEFAULT false,
  rating        NUMERIC      NOT NULL DEFAULT 0.0,
  review_count  INTEGER      NOT NULL DEFAULT 0,
  available     BOOLEAN      NOT NULL DEFAULT true,
  location      VARCHAR(100),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_worker_id ON public.services(worker_id);
CREATE INDEX IF NOT EXISTS idx_services_category  ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_location  ON public.services(location);
CREATE INDEX IF NOT EXISTS idx_services_available ON public.services(available);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 5. BOOKINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id           UUID NOT NULL REFERENCES public.users(id),
  client_id           UUID NOT NULL REFERENCES public.users(id),
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  location_type       VARCHAR(20),     -- 'incall' | 'outcall'
  location_address    TEXT,
  notes               TEXT,
  cancellation_reason TEXT,
  cancelled_by        UUID REFERENCES public.users(id),
  cancelled_at        TIMESTAMPTZ,
  metadata            JSONB       NOT NULL DEFAULT '{}'::jsonb,
  deleted_at          TIMESTAMPTZ DEFAULT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_booking_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_worker_id  ON public.bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id  ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_end_time   ON public.bookings(end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON public.bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at ON public.bookings(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 6. VERIFICATION_DOCS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.verification_docs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role              VARCHAR(20) NOT NULL CHECK (role IN ('worker','client')),
  selfie_url        TEXT NOT NULL,
  id_front_url      TEXT NOT NULL,
  id_back_url       TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected')),
  reviewer_id       UUID REFERENCES public.users(id),
  reviewed_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_docs_user_id ON public.verification_docs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status  ON public.verification_docs(status);

ALTER TABLE public.verification_docs ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_verification_docs_updated_at ON public.verification_docs;
CREATE TRIGGER update_verification_docs_updated_at
  BEFORE UPDATE ON public.verification_docs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 7. MESSAGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  conversation_id UUID,
  sender_id       UUID NOT NULL REFERENCES public.users(id),
  recipient_id    UUID REFERENCES public.users(id),
  content         TEXT,
  message_type    VARCHAR(20) NOT NULL DEFAULT 'text'
                    CHECK (message_type IN ('text','image','system','booking_request')),
  is_read         BOOLEAN     NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_booking_id      ON public.messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id       ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id    ON public.messages(recipient_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 8. REVIEWS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES public.bookings(id),
  reviewer_id           UUID NOT NULL REFERENCES public.users(id),
  reviewee_id           UUID NOT NULL REFERENCES public.users(id),
  rating                SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  communication_rating  SMALLINT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  accuracy_rating       SMALLINT CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  experience_rating     SMALLINT CHECK (experience_rating >= 1 AND experience_rating <= 5),
  content               TEXT NOT NULL CHECK (char_length(content) >= 20),
  response              TEXT,
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','published','flagged','removed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(booking_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id  ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status      ON public.reviews(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at  ON public.reviews(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 9. FAVORITES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  favorited_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, favorited_user_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id    ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_favorited  ON public.favorites(favorited_user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 10. BLOCKED_USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON public.blocked_users(blocked_id);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 11. REPORTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      UUID NOT NULL REFERENCES public.users(id),
  target_type      VARCHAR(20) NOT NULL
                     CHECK (target_type IN ('user','booking','message','review')),
  target_id        UUID NOT NULL,
  reason           VARCHAR(100) NOT NULL,
  description      TEXT,
  evidence_urls    TEXT[]       DEFAULT '{}',
  status           VARCHAR(20) NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open','in_review','resolved','dismissed')),
  resolution_notes TEXT,
  resolved_by      UUID REFERENCES public.users(id),
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status      ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target      ON public.reports(target_type, target_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 12. SAFE_BUDDY_TOKENS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.safe_buddy_tokens (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.users(id),
  token               VARCHAR(255) NOT NULL UNIQUE,
  buddy_contact       VARCHAR(255),
  buddy_name          VARCHAR(255),
  check_in_interval   INTEGER      NOT NULL DEFAULT 30,     -- minutes
  next_check_in_at    TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ  NOT NULL,
  used                BOOLEAN      NOT NULL DEFAULT false,
  used_at             TIMESTAMPTZ,
  alert_sent          BOOLEAN      NOT NULL DEFAULT false,
  alert_sent_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safe_buddy_tokens_booking_id ON public.safe_buddy_tokens(booking_id);
CREATE INDEX IF NOT EXISTS idx_safe_buddy_tokens_token      ON public.safe_buddy_tokens(token);
CREATE INDEX IF NOT EXISTS idx_safe_buddy_tokens_expires_at ON public.safe_buddy_tokens(expires_at);

ALTER TABLE public.safe_buddy_tokens ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 13. ADMIN_AUDIT
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES public.users(id),
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   UUID,
  details     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id   ON public.admin_audit(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action     ON public.admin_audit(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON public.admin_audit(created_at);

ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 14. AVAILABILITY_SLOTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week     INTEGER,           -- 0-6 (0 = Sunday)
  start_time      TIME,
  end_time        TIME,
  is_available    BOOLEAN     NOT NULL DEFAULT true,
  specific_date   DATE,              -- for one-off overrides
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_slots_worker_id ON public.availability_slots(worker_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day       ON public.availability_slots(day_of_week);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_availability_slots_updated_at ON public.availability_slots;
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- RLS POLICIES  (canonical — worker/role naming)
-- =============================================================================

-- USERS
DROP POLICY IF EXISTS "Users can read own record"                            ON public.users;
DROP POLICY IF EXISTS "Users can insert own record"                          ON public.users;
DROP POLICY IF EXISTS "Users can update own record"                          ON public.users;
DROP POLICY IF EXISTS "Anon can read published worker profiles"              ON public.users;
DROP POLICY IF EXISTS "Authenticated can read published worker profiles"     ON public.users;

CREATE POLICY "Users can read own record"
  ON public.users FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anon can read published worker profiles"
  ON public.users FOR SELECT TO anon
  USING (
    role = 'worker'
    AND EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.user_id = users.id AND wp.published = true
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Authenticated can read published worker profiles"
  ON public.users FOR SELECT TO authenticated
  USING (
    role = 'worker'
    AND EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.user_id = users.id AND wp.published = true
    )
    AND deleted_at IS NULL
  );

-- WORKER_PROFILES
DROP POLICY IF EXISTS "Published worker profiles are viewable"  ON public.worker_profiles;
DROP POLICY IF EXISTS "Workers can update own profile"          ON public.worker_profiles;
DROP POLICY IF EXISTS "Workers can insert own profile"          ON public.worker_profiles;

CREATE POLICY "Published worker profiles are viewable"
  ON public.worker_profiles FOR SELECT
  USING (published = true OR user_id = auth.uid());

CREATE POLICY "Workers can update own profile"
  ON public.worker_profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Workers can insert own profile"
  ON public.worker_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- SERVICES
DROP POLICY IF EXISTS "Anyone can read available services"  ON public.services;
DROP POLICY IF EXISTS "Workers can manage own services"     ON public.services;

CREATE POLICY "Anyone can read available services"
  ON public.services FOR SELECT TO anon, authenticated
  USING (available = true);

CREATE POLICY "Workers can manage own services"
  ON public.services FOR ALL USING (worker_id = auth.uid());

-- BOOKINGS
DROP POLICY IF EXISTS "Users can view own bookings"         ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings"           ON public.bookings;
DROP POLICY IF EXISTS "Participants can update bookings"    ON public.bookings;

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (worker_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Participants can update bookings"
  ON public.bookings FOR UPDATE
  USING (worker_id = auth.uid() OR client_id = auth.uid());

-- MESSAGES
DROP POLICY IF EXISTS "Users can view own messages"  ON public.messages;
DROP POLICY IF EXISTS "Users can send messages"      ON public.messages;

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- REVIEWS
DROP POLICY IF EXISTS "Users can read published reviews"   ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews"           ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

CREATE POLICY "Users can read published reviews"
  ON public.reviews FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

-- FAVORITES
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;

CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL USING (user_id = auth.uid());

-- BLOCKED_USERS
DROP POLICY IF EXISTS "Users can view own blocks"   ON public.blocked_users;
DROP POLICY IF EXISTS "Users can manage own blocks"  ON public.blocked_users;

CREATE POLICY "Users can view own blocks"
  ON public.blocked_users FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY "Users can manage own blocks"
  ON public.blocked_users FOR ALL USING (blocker_id = auth.uid());

-- REPORTS
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- SAFE_BUDDY_TOKENS
DROP POLICY IF EXISTS "Users can manage own tokens" ON public.safe_buddy_tokens;

CREATE POLICY "Users can manage own tokens"
  ON public.safe_buddy_tokens FOR ALL USING (user_id = auth.uid());

-- ADMIN_AUDIT  (admin-only read)
DROP POLICY IF EXISTS "Admins can read audit log" ON public.admin_audit;

CREATE POLICY "Admins can read audit log"
  ON public.admin_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- AVAILABILITY_SLOTS
DROP POLICY IF EXISTS "Availability is viewable"            ON public.availability_slots;
DROP POLICY IF EXISTS "Workers can manage own availability" ON public.availability_slots;

CREATE POLICY "Availability is viewable"
  ON public.availability_slots FOR SELECT USING (true);

CREATE POLICY "Workers can manage own availability"
  ON public.availability_slots FOR ALL USING (worker_id = auth.uid());

-- =============================================================================
-- STORAGE BUCKETS  (idempotent — Supabase ignores if they already exist)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('qualification-docs', 'qualification-docs', false)
ON CONFLICT (id) DO NOTHING;
