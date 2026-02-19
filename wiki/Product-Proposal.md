# Product Proposal — Shub Design & Feature Refresh

*Prepared February 2026. This is the source-of-truth proposal that the sprint wiki pages implement.*

---

## 1. Current State & Functionality

### What Shub Is

Shub is a safety-first, New Zealand–focused marketplace connecting adult service workers with clients. It is a single-page React application backed by Supabase, with three distinct user types — **Worker**, **Client**, and **Admin** — each with their own navigation, features, and permissions.

### Feature Inventory

| Domain | Feature | Status |
|--------|---------|--------|
| Authentication | Age-gate (18+), Sign up, Email verification, Login, Password reset | Live |
| Browse & Discovery | Service card grid, search + filters (category/location/availability/rating) | Live |
| Worker Profiles | 8-section profile editor, photo privacy controls (blur/watermark), publish flow with content moderation | Live |
| Bookings | Booking request form, accept/decline, booking list + detail, real-time status updates | Live |
| Messaging | In-app chat, real-time updates, content moderation, unread badge | Live |
| Safety Hub | Emergency contacts, UglyMugs feed, SafeBuddy links, client notes, reporting | Live |
| Identity Verification | ID + selfie upload, admin review workflow, verified badge | Live |
| Admin Tools | Verification queue, profile publishing, moderation queue, audit log | Live |
| Safer-Sex Enforcement | Condom-mandatory checkbox on publish, bio/service content filter, real-time message warnings | Live |

### Strengths

- Genuine harm-reduction philosophy baked into the product
- Per-photo privacy controls (blur/watermark) — most competitors don't offer this
- Comprehensive admin audit trail
- Mobile-first, thumb-friendly navigation (48×48px touch targets)
- Real-time messaging and booking updates

### What's Missing

See [Roadmap Overview](Roadmap-Overview) for the full prioritised list. The top gaps are:
- Reviews & ratings (trust engine)
- Availability calendar (reduces cancellations)
- Push notifications (worker response time)
- Consistent user feedback on all inputs (see [Data Input Feedback Audit](Data-Input-Feedback-Audit))

---

## 2. Current UX/UI/CX Assessment

### Patterns That Work

- Role-based bottom navigation is clear and consistent
- Form validation and error messaging is well-implemented on auth screens
- Profile completion tracker and onboarding checklist give workers a clear path
- Report modal's multi-step flow with explicit confirmation is exemplary
- Photo upload with privacy controls is a genuine differentiator

### Patterns That Need Improvement

**Feedback gaps:** Five profile-editor sections (rates, availability, location, languages, services) save with no visible confirmation. Booking request submission closes silently. See [Data Input Feedback Audit](Data-Input-Feedback-Audit) for the complete audit.

**Interaction style:** The app feels like a web form, not a product. Everything appears and disappears instantly. There is no motion, no spring, no delight. Every UI element looks the same — the same rounded-2xl card, the same gradient header, the same stacked layout.

**Typography:** No custom fonts, no defined type scale. Headings are just "bigger body text."

**Dark mode:** The store infrastructure exists (`ui.store.ts`) but dark mode is not implemented in the UI.

**Landing page:** Three white cards on a gradient. Anonymous — any app could have this landing page.

---

## 3. Design Philosophy: Warm Confidence

**Reference:** Apple's Human Interface Guidelines — minimal chrome, generous whitespace, purposeful motion, content is the UI. Adapted for Shub: this must feel **warm, safe, private, and human** — not a cold productivity tool.

### Three Design Principles

**1. Calm surfaces, confident colour.**
Backgrounds are quiet (warm white, warm stone). Colour appears in moments of action and success — not as wallpaper.

**2. Space is a feature.**
Every element breathes. Padding increases. Cards feel like objects, not list items.

**3. Motion is information.**
Transitions tell the user where they came from and where they're going. Nothing moves without a reason. Nothing appears without entering.

---

## 4. Design Refresh Specifics

### Colour System

See [Sprint 2](Sprint-2-Design-System-and-Visual-Refresh) for implementation.

| Current | Proposed | Reason |
|---------|----------|--------|
| `warm` coral | `rose` soft pink/mauve | Coral skews orange on screens; rose is warmer and more distinctly Shub |
| Pure white `#FFF` surfaces | Warm white `#FAFAF8` | Removes clinical coldness |
| Pure black text | Charcoal `#1C1917` | Easier on eyes; pairs better with warm palette |
| Blue→Coral gradient header | Indigo→Blue→Rose header | Richer; more distinctive |
| No dark mode | Deep midnight `#0D0D12` base | Privacy and discretion |
| No gold/premium | `gold-500` accent | Future premium features |

### Typography

See [Sprint 2](Sprint-2-Design-System-and-Visual-Refresh) for implementation.

- **Display headings:** `Fraunces` variable serif — editorial, warm, trustworthy, distinctly non-tech
- **UI text:** `Inter` — clean, legible, professional
- **6-step type scale** with tighter letter-spacing on large sizes

### Modals & Sheets

Replace all full-screen modal takeovers with two targeted patterns:

| Pattern | When to Use | Component |
|---------|-------------|-----------|
| **Bottom Sheet** | Actions, forms, booking flow, filters | `<Sheet>` with spring physics |
| **Centre Dialog** | Confirmations, single decisions | `<ConfirmDialog>` max-w-sm |

Remove the "gradient background + white card" pattern from the booking request modal. Move to a bottom sheet.

### Motion

- **Page transitions:** Fade + 12px slide up on enter; fade only on exit (200ms)
- **Bottom sheet:** Spring physics — feels physical and native
- **Success states:** SVG draw animation on checkmarks (400ms)
- **Profile publish:** `canvas-confetti` burst (2s, then done)
- **Button press:** `active:scale-95` on all buttons

### Key Screen Redesigns

| Screen | Key Change |
|--------|-----------|
| Landing page | Editorial hero with left-aligned display type; product visible above the fold; two CTAs (no three-card layout) |
| Browse page | 2-column masonry grid (mobile); floating search pill; featured hero card |
| Booking flow | Bottom sheet, step-by-step (date → time → message → summary → success) |
| Worker profile | Full-bleed photo carousel top; sticky "Request Booking" FAB |
| Profile editor | Circular completion ring; inline autosave micro-confirmation; sidebar nav on desktop |
| Safety Hub | Permanent dark background (`#1A1A2E`) regardless of theme — signals seriousness |

---

## 5. Data Input Feedback Audit

Full details: [Data Input Feedback Audit](Data-Input-Feedback-Audit)

**Summary of gaps:**
- 5 critical (❌): booking request, rates, availability, location, client notes — no feedback at all
- 5 partial (⚠️): bio save, photo privacy, message send, SafeBuddy copy, email resend

All addressed in [Sprint 1](Sprint-1-Feedback-and-Toast-System).

---

## 6. Roadmap Summary

| Horizon | Timeframe | Key Features |
|---------|-----------|--------------|
| **1 — Quick Wins** | Weeks 1–4 | Toast system, booking confirmation, email resend, online status, read receipts |
| **2 — Core Growth** | Months 1–3 | Reviews, availability calendar, push notifications, saved workers, payment method display, profile share link |
| **3 — Platform Maturity** | Months 3–6 | Worker subscription tiers, analytics dashboard, client verification, PWA/native app |

Full details: [Roadmap Overview](Roadmap-Overview)
