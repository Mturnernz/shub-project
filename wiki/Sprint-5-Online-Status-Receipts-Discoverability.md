# Sprint 5 — Online Status, Read Receipts & Profile Discoverability

**Duration:** 1–2 weeks
**Goal:** Complete the Horizon 1 quick-win items and add the two Horizon 2 discoverability features that need no backend infra.

**Prerequisites:** Sprint 4 complete.

---

## 5.1 — Worker Online / Active Status

### Why
A green presence dot next to a worker's name dramatically increases perceived availability and drives click-through. It creates urgency ("they're online now, message them").

### Implementation

**Approach:** Use Supabase Realtime presence (broadcast channel). When a worker has the app open and authenticated, they broadcast their presence. The client subscribes and aggregates who is currently "online."

**Client-side hook:** `src/features/listings/hooks/useOnlineWorkers.ts`

```ts
// Subscribes to 'online-workers' Supabase Realtime presence channel
// Maintains a Set<string> of worker IDs currently online
// Returns: { onlineWorkerIds: Set<string> }
// Cleanup: unsubscribes on unmount
```

**Worker-side broadcast:** In `useWorkerProfile` (or a new `usePresence` hook called from the worker's app shell):

```ts
// When worker is authenticated and active, join the presence channel
// Broadcast: { worker_id: userId, status: 'online' }
// Heartbeat every 30s to maintain presence
// Cleanup: leave channel on unmount
```

**UI changes:**

- `ServiceCard.tsx`: add small green dot `●` beside worker name when `onlineWorkerIds.has(service.workerId)`
- `ClientHome.tsx`: pass `onlineWorkerIds` down; show "Online Now" chip in quick-filter strip
- `ServiceDetail.tsx`: green dot beside worker name in header

---

## 5.2 — Read Receipts in Messages

### Why
"Has my message been read?" is one of the most anxiety-inducing unknowns in marketplace messaging. Read receipts provide closure and reduce repeat-message spam.

### Data Model

New column on `messages` table:

```sql
alter table messages add column read_at timestamptz;
-- When recipient opens the conversation, update read_at for all unread messages from the other party
-- RLS: only recipient can update read_at for messages sent to them
```

### Implementation

**Message update:** In the chat view (`BookingChatPage` or similar), when the component mounts, mark all incoming messages as read:

```ts
await supabase
  .from('messages')
  .update({ read_at: new Date().toISOString() })
  .eq('booking_id', bookingId)
  .neq('sender_id', currentUserId)
  .is('read_at', null);
```

**UI:**

In the message bubble (sender view only), show one of:
- Single tick `✓` — delivered (message exists in DB)
- Double tick `✓✓` (blue) — read (`read_at` is not null)

---

## 5.3 — Payment Method Display

### Why
Currently there is no structured way for workers to communicate their preferred payment methods. Clients ask via message every time. Adding a structured field removes friction and speeds up the post-booking flow.

### Implementation

**Worker profile field:** Add `preferred_payment_methods: string[]` to `worker_profiles` table:

```sql
alter table worker_profiles add column preferred_payment_methods text[] default '{}';
```

Common options: `['Bank Transfer', 'Cash', 'Crypto', 'Afterpay', 'Other']`

**UI in profile editor** (`WorkerProfileManagement.tsx` → new `PaymentMethodEditor.tsx`):

```tsx
// Multi-select toggle chips for common payment methods
// "Other" option reveals free-text input
// Shown only to confirmed clients on ServiceDetail (after booking is confirmed)
```

**Display on ServiceDetail** (shown below booking CTA for confirmed clients):

```tsx
<div className="text-sm text-gray-600">
  <strong>Accepted payments:</strong> Bank Transfer, Cash
</div>
```

---

## 5.4 — Profile Share Link

### Why
Workers can't market themselves externally without a shareable URL. A clean `shub.nz/w/[handle]` link lets workers share on social media, in directories, or via messaging.

### Implementation

**Handle field:** Add `handle text unique` to `worker_profiles`:

```sql
alter table worker_profiles add column handle text unique;
-- Default: generated from display name + random 4-char suffix
-- Worker can customise in profile editor (alphanumeric + hyphens, 3–30 chars)
```

**Route:** `/w/:handle` → public worker profile page (no auth required).

**Public profile page:** `src/routes/pages/WorkerPublicProfilePage.tsx`
- Fetches worker profile by handle
- Shows photos, bio, services, rating, reviews
- "Book Now" CTA → login gate for guests

**Profile editor section** (new section in WorkerProfileManagement):
- Handle input with validation and availability check
- "Copy Link" button → copies `https://shub.nz/w/[handle]` to clipboard + toast
- QR code (optional v2)

**Share button in profile header:** copy link icon → clipboard → "Link copied!" toast.
