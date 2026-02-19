# Component Library Spec

This page defines the shared primitive components that form the Shub design system. All new UI built in Sprint 3+ uses these components. Existing ad-hoc button/modal code is migrated to these components incrementally.

**Location:** `src/components/ui/`
**Export:** `src/components/ui/index.ts`

---

## `<Button>`

Replaces the 50+ variants of inline Tailwind button classes currently scattered across the codebase.

### API

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;     // left icon
  iconRight?: React.ReactNode; // right icon
  fullWidth?: boolean;
}
```

### Variants

| Variant | Use Case | Styles |
|---------|----------|--------|
| `primary` | Main CTA | `bg-gradient-to-r from-trust-600 to-rose-600 text-white hover:from-trust-700 hover:to-rose-700` |
| `secondary` | Supporting action | `bg-surface-light text-surface-dark border border-surface-muted hover:bg-surface-muted` |
| `danger` | Destructive actions (cancel, delete) | `bg-red-600 text-white hover:bg-red-700` |
| `ghost` | Tertiary / text-adjacent | `text-trust-600 hover:bg-trust-50` |
| `link` | Inline text link | `text-trust-600 underline hover:text-trust-700 p-0` (no padding/bg) |

### Sizes

| Size | Height | Font | Padding |
|------|--------|------|---------|
| `sm` | 32px | text-sm | px-3 py-1.5 |
| `md` | 44px | text-base | px-5 py-2.5 |
| `lg` | 52px | text-lg | px-6 py-3 |

### Loading State

When `loading={true}`:
- Spinner (border-2 border-current border-t-transparent rounded-full animate-spin, 16px) replaces/precedes label
- Button is `disabled` (no double-submit)
- Opacity does not change (avoids flash)

### Active State

All buttons: `active:scale-95 transition-transform duration-75`

### Implementation

```tsx
// src/components/ui/Button.tsx
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-trust-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  const variants = { /* as above */ };
  const sizes = { /* as above */ };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}
```

---

## `<Sheet>`

Bottom sheet with spring-physics animation. Used for: booking flow, section switcher, filters, review submission.

### API

```tsx
interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  snapPoints?: ('25%' | '50%' | '75%' | '90%' | 'full')[]; // default: ['50%', '90%']
  initialSnap?: number;  // index into snapPoints, default 0
}
```

### Behaviour

- Rendered via `ReactDOM.createPortal` into `document.body`
- Backdrop: `fixed inset-0 bg-black/40 backdrop-blur-sm` (tappable to close)
- Sheet: `fixed bottom-0 left-0 right-0 rounded-t-3xl bg-surface-white dark:bg-surface-darkCard`
- Handle: `w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2`
- Swipe-down to close: implemented via `framer-motion` drag constraints
- Snap points: user can drag between defined snap heights

### Spring Config

```tsx
transition={{ type: 'spring', damping: 30, stiffness: 300 }}
```

### Implementation

```tsx
// src/components/ui/Sheet.tsx
import { AnimatePresence, motion, useDragControls } from 'framer-motion';

export function Sheet({ open, onClose, title, children, ...props }: SheetProps) {
  const controls = useDragControls();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-surface-white dark:bg-surface-darkCard shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={controls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />
            {title && (
              <div className="px-5 py-3 border-b border-surface-muted">
                <h2 className="text-lg font-semibold text-surface-dark dark:text-surface-white">{title}</h2>
              </div>
            )}
            <div className="overflow-y-auto max-h-[80vh] px-5 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## `<ConfirmDialog>`

Centre-screen confirmation modal. Used for: booking cancel, account deletion, admin actions.

### API

```tsx
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;      // default: "Confirm"
  cancelLabel?: string;       // default: "Cancel"
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

### Behaviour

- `fixed inset-0` backdrop with `backdrop-blur-sm`
- Centre card: `max-w-sm w-full mx-4 rounded-2xl bg-white dark:bg-surface-darkElev shadow-2xl`
- Two buttons: Cancel (secondary) | Confirm (primary or danger depending on variant)
- Pressing Escape calls `onCancel`
- Focus-trapped within dialog while open

---

## `<Badge>`

Status and verification indicators.

### Variants

```tsx
type BadgeVariant =
  | 'verified'      // blue, shield icon — identity verified
  | 'pending'       // amber, clock icon — awaiting review
  | 'featured'      // gold, star icon — premium featured worker
  | 'live'          // green, radio icon — profile is published
  | 'unpublished'   // gray, eye-off icon — profile not visible
  | 'severity-low'      // blue
  | 'severity-medium'   // amber
  | 'severity-high'     // orange
  | 'severity-critical'; // red

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;  // overrides default label for variant
  size?: 'sm' | 'md';
}
```

### Usage

```tsx
<Badge variant="verified" />                      // "Verified" with shield
<Badge variant="featured" label="Top Worker" />   // Custom label
<Badge variant="severity-critical" />             // "Critical" (report severity)
```

---

## `<PageTransition>`

Wraps page content with fade+slide animation on route change.

```tsx
// Usage: wrap each page's return value
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

---

## `<StarRating>`

Interactive or display-only star rating.

```tsx
interface StarRatingProps {
  value: number;           // 0–5, supports half stars for display
  onChange?: (v: number) => void;  // undefined = read-only
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;     // show numeric value beside stars
}
```

---

## Utility: `cn()` (Class Name Merging)

Install `clsx` + `tailwind-merge`:

```bash
npm install clsx tailwind-merge
```

```ts
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use `cn()` in all components to safely merge conditional Tailwind classes without conflicts.

---

## Export Index

```ts
// src/components/ui/index.ts
export { Button } from './Button';
export { Sheet } from './Sheet';
export { ConfirmDialog } from './ConfirmDialog';
export { Badge } from './Badge';
export { PageTransition } from './PageTransition';
export { StarRating } from './StarRating';
```

---

## Migration Plan

New UI (Sprint 3+): use primitives from the start.

Existing UI: migrate incrementally, file by file, starting with the highest-frequency components:

| Priority | Files to Migrate | Reason |
|----------|-----------------|--------|
| 1 | `BookingCard.tsx` | Confirm/Cancel/Message buttons → `<Button>` |
| 2 | `LoginForm.tsx`, `SignUpForm.tsx` | Submit buttons → `<Button variant="primary" loading>` |
| 3 | `WorkerProfileManagement.tsx` | Publish, Save, Preview buttons |
| 4 | `AgeGate.tsx` | Enter/Exit buttons |
| 5 | All admin components | Action buttons |
| 6 | All remaining | Full coverage |
