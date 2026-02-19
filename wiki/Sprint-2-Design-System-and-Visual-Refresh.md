# Sprint 2 — Design System & Visual Refresh

**Duration:** 1–2 weeks
**Goal:** Establish the shared component primitives, revised colour tokens, typography scale, and dark mode that all subsequent sprints build on. This sprint is infrastructure — it does not change functionality, only the system through which UI is expressed.

**Prerequisite:** Sprint 1 complete.

---

## 2.1 — Revised Colour Tokens

### Why
The current `trust`/`warm`/`safe` palette is functionally correct but the `warm` coral skews orange on many screens, clashing with `trust` blue rather than complementing it. A shift to `rose` (soft pink/mauve) creates a warmer, more distinctly Shub identity.

### Changes to `tailwind.config.js`

```js
// Replace the 'warm' (coral) palette with 'rose' (soft pink/mauve)
// Retain 'trust' (blue) and 'safe' (green) unchanged

colors: {
  trust: {
    50:  '#EBF5FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  safe: {
    50:  '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  // NEW: replace 'warm' with 'rose'
  rose: {
    50:  '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  // Updated surface palette — warmer neutrals
  surface: {
    white:    '#FAFAF8',   // warm white (replaces pure #FFF)
    light:    '#F5F3EE',   // warm stone (secondary surfaces, card backgrounds)
    muted:    '#E8E5DF',   // borders, dividers
    dark:     '#1C1917',   // charcoal text (replaces pure black)
    midnight: '#0D0D12',   // dark mode base
    darkCard: '#1A1A2E',   // dark mode card surface
    darkElev: '#252540',   // dark mode elevated (modals, sheets)
  },
  // Premium/featured accent
  gold: {
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
},
```

### Global Gradient Update

Replace the current header gradient with the richer new palette:

**Before:**
```
from-trust-600 to-warm-600
```

**After:**
```
from-indigo-700 via-trust-600 to-rose-600
```

Update in: `Header.tsx`, `LoginForm.tsx`, `SignUpForm.tsx`, `UserTypeSelection.tsx`, `LandingPage.tsx`.

### Migration

Run a global find-and-replace across all `.tsx` files:

| Find | Replace |
|------|---------|
| `warm-` | `rose-` |
| `bg-white` (cards) | `bg-surface-white` |
| `text-gray-900` (primary text) | `text-surface-dark` |

---

## 2.2 — Typography Scale

### Why
Current typography is entirely Tailwind defaults — no defined scale, no custom font. Introducing a display serif for headings creates an editorial, distinctive identity without affecting legibility.

### Install Fonts

In `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Configure in `tailwind.config.js`

```js
theme: {
  extend: {
    fontFamily: {
      display: ['Fraunces', 'Georgia', 'serif'],  // headings
      body:    ['Inter', 'system-ui', 'sans-serif'], // everything else
    },
    fontSize: {
      // 6-step type scale
      'xs':   ['12px', { lineHeight: '16px', letterSpacing: '0.02em' }],
      'sm':   ['14px', { lineHeight: '20px' }],
      'base': ['16px', { lineHeight: '24px' }],
      'lg':   ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      'xl':   ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      '2xl':  ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
      '3xl':  ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
      '4xl':  ['36px', { lineHeight: '40px', letterSpacing: '-0.03em' }],
      '5xl':  ['48px', { lineHeight: '1', letterSpacing: '-0.03em' }],
    },
  },
},
```

### Usage Convention

| Use | Font | Weight | Class |
|-----|------|--------|-------|
| Page titles, hero headings | `font-display` | Bold | `font-display font-bold tracking-tight` |
| Section headings | `font-display` | Semibold | `font-display font-semibold` |
| Body text, labels, UI | `font-body` | Regular/Medium | (default — no class needed) |
| Price display, stats | `font-body` | Bold | `font-bold tabular-nums` |

---

## 2.3 — Dark Mode Activation

### Why
`ui.store.ts` already has `theme: 'light' | 'dark'` and `toggleTheme()`. The infrastructure is built. This sprint activates it.

### Implementation

**Step 1: Apply theme class to document root**

In `App.tsx`, add a `useEffect` that syncs the Zustand theme to the `<html>` element:

```tsx
import { useUIStore } from './stores/ui.store';

function ThemeSync() {
  const theme = useUIStore(s => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return null;
}
```

**Step 2: Enable dark mode in Tailwind**

In `tailwind.config.js`:

```js
darkMode: 'class',
```

**Step 3: Add dark variants to shared components**

Apply `dark:` prefixes to the primitives built in Sprint 2.5:

| Light | Dark |
|-------|------|
| `bg-surface-white` | `dark:bg-surface-midnight` |
| `bg-surface-light` | `dark:bg-surface-darkCard` |
| `text-surface-dark` | `dark:text-surface-white` |
| `text-gray-600` | `dark:text-gray-400` |
| `border-gray-200` | `dark:border-gray-700` |

**Step 4: Add theme toggle**

Add a sun/moon icon toggle button to `Header.tsx` (right side, before logout). On click, call `toggleTheme()` from `useUIStore`.

**Step 5: Safety Hub dark treatment**

The Safety Hub is proposed to have a dark background even in light mode (signals seriousness). This is achieved with:

```tsx
// SafetyHubPage.tsx — override page background regardless of theme
<div className="min-h-screen bg-[#1A1A2E] text-white">
```

This is intentional — the Safety Hub should always feel calm and serious.

---

## 2.4 — Motion System

### Why
The current app has no transitions between pages or states. Everything appears and disappears instantly. Motion communicates direction, hierarchy, and responsiveness.

### Install

```bash
npm install framer-motion
```

### Page Transition Wrapper

Create `src/components/layout/PageTransition.tsx`:

```tsx
import { motion } from 'framer-motion';

const variants = {
  enter: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

Wrap each page component's return in `<PageTransition>`. Add `<AnimatePresence>` in `AppShell.tsx` around the outlet.

### Bottom Sheet Spring

For modals that slide up from the bottom (see [Sprint 3](Sprint-3-Booking-and-Profile-UX)):

```tsx
const sheetVariants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0,      opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit:    { y: '100%', opacity: 0, transition: { duration: 0.2 } },
};
```

### Micro-interactions

| Interaction | Implementation |
|-------------|---------------|
| Button press | Add `active:scale-95 transition-transform` to shared `<Button>` |
| Profile publish confetti | `canvas-confetti` — 2s burst on publish success |
| Heart/save toggle | SVG path animation via framer-motion `pathLength` |
| Success checkmark | SVG draw animation (pathLength 0 → 1, 400ms) |

---

## 2.5 — Shared Component Primitives

*Full specification in [Component Library Spec](Component-Library-Spec).*

This sprint establishes the primitive layer. These components must be built **before** Sprint 3 and 4, because all new UI will use them:

- `<Button>` — all variants (primary, secondary, danger, ghost)
- `<Sheet>` — bottom sheet with spring physics
- `<ConfirmDialog>` — centre-screen confirmation modal
- `<Badge>` — status and verification badges

The `<Toast>` system is delivered by Sprint 1 via `react-hot-toast`.

---

## Acceptance Criteria

- [ ] `warm-*` Tailwind colour classes replaced by `rose-*` throughout the codebase
- [ ] New header gradient (`from-indigo-700 via-trust-600 to-rose-600`) applied on all auth/header components
- [ ] Fraunces font renders on all `font-display` headings (Landing, Profile name, section titles)
- [ ] Dark mode toggle in header; body class switches correctly
- [ ] All shared primitive components built and exported from `src/components/ui/index.ts`
- [ ] Page transitions play on every route change
- [ ] No regressions — all existing pages render correctly with new tokens
- [ ] `npm run lint` passes
