# Sprint 6 — Analytics Dashboard & Client Verification

**Duration:** 2–3 weeks
**Goal:** Give workers the data they need to understand their performance, and provide clients with optional verified status to unlock trust-gated features.

**Prerequisites:** Sprint 4 complete. Sprint 5 desirable but not blocking.

---

## 6.1 — Worker Analytics Dashboard

### Why
Workers who understand their data improve their profile and earn more. Knowing that their profile gets 200 views per week but only 3 booking requests (1.5% conversion) is directly actionable: better photos, clearer pricing, sharper bio.

### Data Model

New table: `profile_views`

```sql
create table profile_views (
  id          uuid primary key default gen_random_uuid(),
  worker_id   uuid references users(id) not null,
  viewer_id   uuid references users(id),  -- null for guest views
  viewed_at   timestamptz default now(),
  source      text  -- 'browse', 'share_link', 'direct'
);
-- RLS: worker can read their own view data; insert allowed for any authenticated user
```

**Aggregate view (for performance):**

```sql
create view worker_analytics as
select
  worker_id,
  count(*) filter (where viewed_at > now() - interval '7 days') as views_7d,
  count(*) filter (where viewed_at > now() - interval '30 days') as views_30d,
  count(*) filter (where viewed_at > now() - interval '90 days') as views_90d
from profile_views group by worker_id;
```

**From bookings table:**
- `booking_requests_30d`: count of bookings where `worker_id = me` in last 30 days
- `confirmed_bookings_30d`: count where status = 'confirmed'
- `conversion_rate`: confirmed / requests

### Worker Analytics Page

Route: `/dashboard/analytics`
New tab in the worker dashboard bottom nav (or accessible via Dashboard page card).

```
┌──────────────────────────────────┐
│  Profile Views                   │
│  ┌─────┐  ┌─────┐  ┌─────┐      │
│  │ 7d  │  │ 30d │  │ 90d │      │
│  │ 147 │  │ 523 │  │1.2k │      │
│  └─────┘  └─────┘  └─────┘      │
│                                  │
│  Bookings (Last 30 days)         │
│  Requests: 12  Confirmed: 8      │
│  Conversion: 67%                 │
│                                  │
│  Response Rate                   │
│  ████████░░  82%                 │
│  (responded within 24h / total)  │
│                                  │
│  Top Traffic Sources             │
│  Browse  ████████  74%           │
│  Direct  ████      18%           │
│  Link    ██         8%           │
└──────────────────────────────────┘
```

### Profile View Tracking

When a client/guest views a worker's public profile (`ServiceDetail` or `WorkerPublicProfilePage`), record a view:

```ts
// useProfileView.ts hook
// On mount, fire: supabase.from('profile_views').insert({ worker_id, viewer_id, source })
// Rate-limited: max 1 view per viewer per worker per hour (store timestamp in sessionStorage)
```

---

## 6.2 — Client Verification (Optional)

### Why
Some workers only want to see verified clients — clients who have confirmed their identity. This is a major safety upgrade. Verified clients get a badge, can access verification-gated workers, and build trust for repeat bookings.

### Data Model

New column on `users`:

```sql
alter table users add column client_verified_at timestamptz;
alter table users add column client_verification_method text;  -- 'phone', 'email_plus_selfie'
```

### Verification Flow (Phase 1: Phone Verification)

1. Client visits `/profile` → sees "Get Verified" card
2. Taps "Verify with phone number"
3. Enters mobile number → Supabase sends OTP via `supabase.auth.signInWithOtp({ phone })`
4. Enters OTP → on success, update `client_verified_at = now()` and show verified badge
5. Verified badge `✓ Verified Client` shown on:
   - Client's profile page
   - Booking requests (worker sees badge on incoming request)
   - Chat header

### UI Components

**`ClientVerificationCard.tsx`** — shown in ProfilePage for unverified clients:

```tsx
// "Unlock more: get verified"
// Explains benefits (access to more workers, builds trust)
// "Verify with phone" CTA → opens Sheet with phone OTP flow
```

**`VerifiedBadge.tsx`** — compact badge `✓ Verified` in trust-600 color used across app.

### Worker Filter

In worker profile settings: "Only receive booking requests from verified clients" toggle.
Stored as `verified_clients_only boolean` on `worker_profiles`.
Booking request creation: check this flag and reject if client not verified.
