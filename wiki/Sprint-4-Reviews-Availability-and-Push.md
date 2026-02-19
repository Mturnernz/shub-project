# Sprint 4 — Reviews, Availability & Push Notifications

**Duration:** 2–3 weeks
**Goal:** Build the three trust-and-engagement features from Horizon 2 that have the highest impact on repeat usage.

**Prerequisites:** Sprint 1, 2, and 3 complete.

---

## 4.1 — Reviews & Ratings System

### Why
Reviews are the primary trust engine in any marketplace. Without them, first-time clients have no signal to distinguish a great worker from an average one. Without reviews, workers cannot build a reputation that compounds over time. This is the single highest-value feature not yet built.

### Data Model

New Supabase table: `reviews`

```sql
create table reviews (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references bookings(id) not null unique,
  reviewer_id   uuid references users(id) not null,
  reviewee_id   uuid references users(id) not null,  -- the worker
  rating        smallint not null check (rating between 1 and 5),
  body          text check (char_length(body) between 10 and 500),
  created_at    timestamptz default now(),
  is_visible    boolean default true  -- admin can hide
);

-- RLS:
-- Reviewer can insert their own review (once per booking, only on completed bookings)
-- Anyone can read visible reviews for a worker
-- Admin can update is_visible
-- No updates by reviewer after submission
```

New column on `worker_profiles`: `avg_rating numeric(3,2)`, `review_count integer`.
Updated via a Postgres trigger on `reviews` insert/update.

### Review Submission Flow

Trigger: A review prompt appears in `BookingCard.tsx` when a booking's status is `completed` and the client has not yet submitted a review for that booking.

```
BookingCard (completed, no review yet)
  → "Leave a Review" button
    → Bottom sheet (Sprint 2 <Sheet> primitive)
      → Star rating (5 stars, tap to select)
      → Optional text (10–500 chars, char count shown)
      → "Submit Review" button
      → Success: "Thank you! Your review has been submitted."
      → Sheet closes; BookingCard shows "Review submitted ✓" state
```

**Worker response:** In the worker's booking history, they can add a one-time response to each review (max 300 chars). Displayed below the review on their public profile.

### Review Display on Profile

On the worker's public profile (and preview), below the bio:

```tsx
// Rating summary block:
// Large number (e.g., "4.8") in display font
// 5-star row with filled stars
// "(47 reviews)" in muted text

// Review list:
// Most recent 5 shown, "See all reviews" link
// Each review: stars | date | reviewer first name | body | optional worker response
// No reviewer last name or photo (privacy)
```

### Content Moderation

Reviews pass through the existing content moderation service before storage. Any review containing blocked phrases is auto-held for admin review (`is_visible = false`, flagged in moderation queue).

### Admin Controls

- Moderation queue receives flagged reviews
- Admin can set `is_visible = false` (hides from profile)
- Admin can add a note on why review was hidden
- All actions logged to audit trail

---

## 4.2 — Worker Availability Calendar

### Why
The current availability system is a simple available/busy/away status toggle. This tells clients nothing about *when* a worker is free. Workers waste time declining requests for times they're unavailable. A proper calendar reduces cancellations and improves client conversion.

### Data Model

New Supabase table: `availability_slots`

```sql
create table availability_slots (
  id          uuid primary key default gen_random_uuid(),
  worker_id   uuid references users(id) not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  is_available boolean default true,  -- false = blocked
  recurring   jsonb,  -- null or { type: 'weekly', days: [1,3,5] }
  created_at  timestamptz default now()
);

-- RLS: worker manages their own; clients can read availability for published workers
```

### Worker-Facing Calendar Editor

In the profile editor's Availability section (replacing the current toggle):

```tsx
// Week-view calendar (7 columns, 24 rows of hours)
// Tap and drag to mark available slots (green)
// Tap a green slot to remove it (grey)
// Recurring toggle: make a weekly pattern from current week's selection
// "Copy last week" shortcut
// View: week | month (month shows only available/unavailable days)
```

### Client-Facing Availability Display

On the worker's public profile, below the bio and above the booking CTA:

```tsx
// Compact week-view showing the next 14 days
// Green slots = available | Grey = unavailable / not set
// Tapping a slot → pre-fills that date/time in the booking flow
// "Fully booked this week" empty state if no availability set
```

### Booking Flow Integration (Sprint 3 update)

In Step 1 (date selection) and Step 2 (time selection) of the booking sheet:
- Unavailable slots are visually greyed out and non-selectable
- Available slots highlighted in `safe-100` green

---

## 4.3 — Web Push Notifications

### Why
Workers need to know immediately when a new booking request arrives. Without push notifications, a worker might not open the app for hours — losing the client to a competitor. Email is too slow and gets lost in spam. SMS costs money per message.

### Technical Architecture

**Web Push API + Supabase Edge Function**

1. On first authenticated load, prompt user to enable push notifications
2. If accepted, register service worker + get VAPID push subscription
3. Store subscription in Supabase: `push_subscriptions(user_id, endpoint, p256dh, auth, created_at)`
4. On events (new booking, booking status change, new message), Supabase Edge Function calls Web Push API to deliver notification

### Notification Types

| Event | Recipient | Title | Body |
|-------|-----------|-------|------|
| New booking request | Worker | "New booking request" | "[Client name] wants to book you for [date]" |
| Booking confirmed | Client | "Booking confirmed!" | "[Worker name] confirmed your booking for [date]" |
| Booking declined | Client | "Booking declined" | "[Worker name] isn't available for that time. Try another?" |
| Booking cancelled | Both | "Booking cancelled" | "Your booking for [date] has been cancelled." |
| New message | Recipient | "New message" | "[Name]: [first 50 chars of message]" |

### Permission Prompt UX

Do not show the browser's native permission prompt on first load — it gets dismissed.

Instead:
1. After a worker's profile is published (high-intent moment), show an in-app prompt:
   - "Get notified instantly when clients book you"
   - "Enable Notifications" (primary) | "Not now" (ghost)
2. If "Enable Notifications" → trigger browser permission request
3. If denied → store `push_declined = true` in localStorage; show a small banner in dashboard with "Enable notifications" link

### Service Worker

Create `public/sw.js`:
```js
self.addEventListener('push', event => {
  const data = event.data?.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: data.url },  // e.g., '/bookings/[id]'
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  clients.openWindow(event.notification.data.url);
});
```

Register in `main.tsx`:
```ts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 4.4 — Saved / Favourite Workers

### Why
Clients who save workers are significantly more likely to return and book. Saves indicate strong purchase intent and give clients a personal shortlist to return to.

### Implementation

**Client-side first (v1):** Store saved worker IDs in `localStorage`. No DB required for MVP.

```ts
// src/features/listings/hooks/useSavedWorkers.ts
// get(): string[] | set(id): void | remove(id): void | toggle(id): void | isSaved(id): boolean
// Persisted to localStorage under key 'shub_saved_workers'
```

**UI changes:**
- Service card: heart icon (top-right, overlaid on photo). Filled if saved.
- Tap heart: toggle save, brief animation (heart fill)
- Browse page: "Saved" filter chip in the filter strip — shows only saved workers
- Client profile page: "Saved Workers" section listing saved cards

**v2 (database-backed):** Migrate to `saved_workers(client_id, worker_id, created_at)` table once retention data confirms value.

---

## Acceptance Criteria

**Reviews:**
- [ ] Review prompt appears on completed bookings where no review exists
- [ ] Review submission bottom sheet: star rating + optional text + submit
- [ ] Reviews display on worker public profile with rating summary
- [ ] Review count and avg rating update in real time
- [ ] Blocked content held for admin review; visible in moderation queue
- [ ] Worker can add one response per review

**Availability Calendar:**
- [ ] Worker can set weekly availability slots via drag-and-drop calendar
- [ ] Client sees next 14 days of availability on worker profile
- [ ] Unavailable slots non-selectable in booking flow

**Push Notifications:**
- [ ] Service worker registered on app load
- [ ] In-app permission prompt shown after profile publish
- [ ] Subscription stored in Supabase
- [ ] Booking request, booking status, new message notifications delivered
- [ ] Notification click navigates to correct page

**Saved Workers:**
- [ ] Heart icon on service cards, toggleable
- [ ] Saved filter chip on browse page
- [ ] Saved workers section on client profile page
