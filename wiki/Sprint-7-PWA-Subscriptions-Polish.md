# Sprint 7 — PWA, Subscription Tiers & Platform Maturity

**Duration:** 3–4 weeks
**Goal:** Make Shub feel like a native app on mobile and lay the commercial foundation for a sustainable business model.

**Prerequisites:** Sprints 4–6 complete.

---

## 7.1 — PWA (Progressive Web App)

### Why
The majority of Shub users are on mobile. A PWA that can be installed to the home screen, loads instantly, and shows a native app-like experience dramatically improves engagement and retention. PWAs also unlock camera access (for photo uploads) and background push notifications.

### Implementation

**`public/manifest.json`** (already exists per index.html) — verify it has:

```json
{
  "name": "Shub",
  "short_name": "Shub",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0052A3",
  "background_color": "#FAFAF8",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Install Prompt:**

```ts
// src/hooks/usePWAInstall.ts
// Listen for 'beforeinstallprompt' event
// Store deferredPrompt
// Expose: { canInstall: boolean, install: () => void }
```

Show install banner in `AppShell` or `Header` when `canInstall === true` and user hasn't dismissed:

```tsx
// Soft banner above bottom nav: "Add Shub to home screen"
// "Install" button (primary) | "×" dismiss (stores dismissal in localStorage)
```

**Offline support:** Service worker (already created in Sprint 4 for push) extended with:

```js
// Cache-first strategy for static assets
// Network-first for API calls (graceful degradation)
// Offline page: /offline.html
```

---

## 7.2 — Worker Subscription Tiers

### Why
Shub needs a revenue model. The most natural marketplace model is charging workers for increased visibility, not taking a booking commission (which is hard to enforce when payments are handled directly). Subscriptions also incentivise workers to invest in their profile quality.

### Tier Design

| Tier | Price | Features |
|------|-------|---------|
| **Free** | $0/mo | Listed in browse, max 3 photos, basic analytics |
| **Pro** | $19/mo | Featured placement, max 10 photos, full analytics, profile share link, verified badge |
| **Premium** | $49/mo | Priority placement, "Top Pick" badge, boost events, client insights |

### Phase 1: Feature Flags Only (No Payment Processing)

In Phase 1, subscription tiers are managed manually by admin (set in DB). No payment processing in app.

```sql
alter table worker_profiles add column subscription_tier text default 'free'
  check (subscription_tier in ('free', 'pro', 'premium'));
alter table worker_profiles add column subscription_expires_at timestamptz;
```

**UI changes:**

- Browse page: Pro/Premium workers get a `⭐ Featured` badge, appear first in results
- Worker dashboard: "Your Plan" card showing current tier + upgrade CTA (links to Stripe or contact page)
- Admin: can set tier in ProfilePublisher / admin panel

### Phase 2: Stripe Integration (future)

- Stripe Checkout session created by Supabase Edge Function
- Webhook updates `subscription_tier` and `subscription_expires_at`
- Automatic downgrade on expiry

---

## 7.3 — Dark Mode Polish

Ensure all components have proper `dark:` variants following the design system tokens. Audit priority order:

1. Bottom navigation bar
2. Chat/message thread
3. Booking cards
4. Profile editor sections
5. Landing page (already uses gradient — verify it looks good in dark)

---

## 7.4 — Accessibility Audit & Polish

Final pass ensuring WCAG 2.1 AA compliance:

- Focus ring visibility on all interactive elements
- All images have descriptive `alt` text
- Color contrast ratios ≥ 4.5:1 for body text, ≥ 3:1 for UI components
- Touch targets ≥ 44×44px (already enforced in Sprint 1–3 accessible button work)
- Screen reader testing with VoiceOver (iOS) and TalkBack (Android)
- `aria-live` regions for toast notifications and async state changes
