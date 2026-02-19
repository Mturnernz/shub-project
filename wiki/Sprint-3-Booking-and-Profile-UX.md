# Sprint 3 — Booking & Profile UX

**Duration:** 1–2 weeks
**Goal:** Redesign the two highest-frequency user journeys — booking a worker and editing a worker profile — using the component primitives built in Sprint 2.

**Prerequisites:** Sprint 1 and Sprint 2 complete.

---

## 3.1 — Booking Flow Redesign (Bottom Sheet)

### Why
The current booking flow is a fixed-position modal with a flat form. It appears instantly, disappears silently, and gives no spatial context for where the user is in the process. The new design uses a bottom sheet (feels native/app-like), a step-by-step guide, and an explicit confirmation screen.

### New Flow Architecture

```
ServiceDetail page
  → "Request Booking" button (sticky FAB)
    → Bottom Sheet slides up
      → Step 1: Date (calendar)
      → Step 2: Time (pickers + live duration)
      → Step 3: Message (optional)
      → Step 4: Summary (review + submit)
      → Step 5: Success state (replaces form)
```

### Step 1 — Date Selection

```tsx
// Large calendar grid, swipe between months
// Min date: today + 2 hours (as enforced by current validation)
// Selected date highlighted with trust-600 circle
// Currently selected: shown in header "Wed 25 Feb"
```

### Step 2 — Time Selection

```tsx
// Two scrollable time pickers (Start / End) — iOS wheel-picker style
// Duration displayed live: "3 hours · approx. $XXX" (if hourly rate available)
// Validation: end must be after start, 1–8h duration, start ≥ 2h from now
// Error inline if invalid
```

### Step 3 — Optional Message

```tsx
// Simple textarea, max 500 chars, character counter
// Placeholder: "Anything helpful to share? E.g., your name, what you're looking for…"
// Skip button → goes to Step 4
```

### Step 4 — Summary

```tsx
// Card showing: Worker name + avatar | Date | Time range | Duration | Message snippet
// "Edit" links on each row return to that step
// Primary CTA: "Send Booking Request" (full-width, trust gradient)
// Secondary: "Cancel" (ghost)
// Safety reminder: "Condom use is mandatory for all in-person services" (small text)
// Payment note: "Payment arranged directly — Shub does not process payments"
```

### Step 5 — Success State (within sheet)

```tsx
// Sheet remains open but transitions to success screen
// Animated checkmark (SVG draw animation)
// "Request sent to [Worker Name]"
// "They'll respond within 24 hours"
// Two buttons:
//   Primary: "View My Bookings" → navigate('/bookings')
//   Ghost: "Close"
```

### Component Structure

```
src/features/bookings/components/
  BookingSheet.tsx          ← new: replaces BookingRequest modal
  BookingSheet/
    DateStep.tsx
    TimeStep.tsx
    MessageStep.tsx
    SummaryStep.tsx
    SuccessStep.tsx
```

### Sticky FAB on ServiceDetail

Replace the current inline "Request Booking" button with a sticky floating action button:

```tsx
// Fixed bottom-right, above bottom nav
// Pill shape: "Request Booking" + CalendarPlus icon
// bg-gradient-to-r from-trust-600 to-rose-600 text-white
// z-index above content but below sheet overlay
// Hides when user has active confirmed booking with this worker
```

---

## 3.2 — Profile Editor Autosave Improvements

### Why
The profile editor has 8 sections. Currently, only the bio has a visible (but discreet) "Saved [timestamp]" indicator. Other sections save silently. The new pattern shows an inline micro-confirmation on each field that was saved, without interrupting the editing flow.

### Autosave Micro-Confirmation Pattern

For every auto-saving field, add an inline `✓ Saved` indicator that appears briefly then fades:

```tsx
// Shared hook: useSavedIndicator(delay = 2000)
// Returns: { showSaved, triggerSaved }
// Usage:
const { showSaved, triggerSaved } = useSavedIndicator();
// After save success: triggerSaved()
// In JSX: {showSaved && <span className="text-safe-600 text-xs animate-fade-in">✓ Saved</span>}
```

Apply this pattern to: `BioEditor`, `RatesEditor`, `AvailabilitySetter`, `LocationServiceArea`, `LanguageQualifications`.

### Profile Completion Ring

Replace the linear progress bar with a circular progress ring in the profile overview section:

```tsx
// SVG circle with stroke-dashoffset animation
// Shows percentage inside: "72%"
// Colour: red <60%, amber 60–79%, green ≥80%
// Animates on mount and on every update
// Size: 80×80px on mobile, 96×96px on desktop
```

### Section Navigation Improvements

Replace the current tab strip with a **sidebar on desktop / bottom sheet section-switcher on mobile**:

**Mobile (≤ 768px):**
- Current section title shown in header with a chevron-down icon
- Tap header → bottom sheet slides up showing all 8 sections as a list
- Each section shows its completion chip (green check or amber dot)
- Tap a section → sheet closes, section content slides in

**Desktop (> 768px):**
- Left sidebar: vertical list of 8 sections, each with icon + label + completion chip
- Content area: right side, full-height, scrollable

---

## 3.3 — Browse Page Layout Refresh

### Why
The current browse page stacks service cards vertically in a single column on mobile. Two columns of cards (masonry layout) increases content density, reduces scroll distance, and better matches the visual language of modern discovery apps.

### New Layout

```tsx
// Mobile: 2-column masonry grid (react-masonry-css or CSS columns)
// Tablet: 3-column grid
// Desktop: 4-column grid

// Featured worker: hero card at top, full-width, 16:9 aspect ratio
// Worker's primary photo as background, gradient overlay
// Name, location, headline rate overlaid
// "View Profile" button bottom-right of card

// Service cards (new compact variant):
// Photo top (4:3 aspect), rounded-xl
// Below: name + verified badge | rate | location
// No description text on card — moves to profile
// Tap card → navigate to profile
```

### Floating Search Pill

Replace the full-width search bar with a compact floating pill:

```tsx
// Default: compact pill showing current search or placeholder "Search Shub…"
// On tap: expands to full-width search input (animated)
// Filter chips appear as a single horizontal scroll strip below
// No modal for basic filters — all visible inline
// Advanced filters (availability date, rating) behind "More filters" chevron
```

---

## 3.4 — Landing Page Redesign

### Why
The current landing page shows three white cards on a gradient background. It's functional but anonymous — any app could have this landing page. The new design is editorial and product-forward.

### New Layout

**Above the fold:**
```
Full-bleed gradient background (from-indigo-700 via-trust-600 to-rose-600)

Left-aligned content (max-w-xl, centred on mobile):
  [Subtext: "New Zealand's safety-first worker marketplace"]
  [Display heading: "Your safety. Your terms. Your city."]  ← font-display, text-5xl, white
  [Two CTAs side by side]:
    Primary (white filled pill): "Find a Worker"
    Secondary (white outline pill): "List Your Services"

Right side (desktop only): Worker profile card preview
  — blurred/frosted if age not verified
  — real worker card from browse to show the product
```

**Below the fold:**
```
Section 1: How it works (3 steps, horizontal on desktop)
  1. Browse verified workers → 2. Request a booking → 3. Stay safe with built-in tools

Section 2: Featured workers horizontal scroll strip
  — 4 worker cards visible, swipeable on mobile

Section 3: Safety commitment (dark background section)
  — "Built for safety" headline
  — 3 bullet points: verified identities, content moderation, 24/7 reporting
  — Link to safety policy

Footer: Privacy | Terms | Safer-Sex Policy | Verification Policy | NZPC Resources
```

---

## Acceptance Criteria

- [ ] Booking sheet slides up from bottom with spring animation
- [ ] Booking flow has 4 steps (date, time, message, summary) + success state
- [ ] Success state shows worker name and "View My Bookings" CTA
- [ ] Sticky FAB visible on ServiceDetail (above bottom nav)
- [ ] Autosave micro-confirmation appears on bio, rates, availability, location, language sections
- [ ] Profile completion shown as animated circular ring
- [ ] Browse page uses 2-column masonry on mobile
- [ ] Floating search pill collapses/expands with animation
- [ ] Landing page shows editorial hero layout
- [ ] `npm run lint` passes; no TypeScript errors
