# Sprint 1 — Feedback & Toast System

**Duration:** 1 week
**Goal:** Eliminate every "input with no output" gap. Users must always know when their actions succeed.

This sprint is the **foundation**. Nothing in Sprint 2, 3, or 4 should be built before this is complete, because all subsequent features will need to surface feedback to users.

---

## 1.1 — Global Toast Notification System

### Why
Five critical profile-editor saves (rates, availability, location, languages, client notes) produce no visible confirmation. Message sending and bio edits have only discreet inline feedback that is easy to miss.

### Implementation

**Install:** `react-hot-toast` (2.4kB gzipped, no dependencies, fully typed)

```bash
npm install react-hot-toast
```

**Add to `App.tsx`:**

```tsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1C1917',
            color: '#F0EEF5',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#059669', secondary: '#ECFDF5' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#FEF2F2' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
```

**Helper wrapper** (`src/utils/toast.ts`):

```ts
import toast from 'react-hot-toast';

export const showToast = {
  success: (msg: string) => toast.success(msg),
  error:   (msg: string) => toast.error(msg),
  info:    (msg: string) => toast(msg, { icon: 'ℹ️' }),
  loading: (msg: string) => toast.loading(msg),
};
```

### Where to Add Toast Calls

| Component | Event | Toast Message |
|-----------|-------|---------------|
| `RatesEditor.tsx` | Save success | `"Rates updated"` |
| `AvailabilitySetter.tsx` | Save success | `"Availability updated"` |
| `LocationServiceArea.tsx` | Save success | `"Location saved"` |
| `LanguageQualifications.tsx` | Save success | `"Languages updated"` |
| `ServiceManager.tsx` | Service added/edited/deleted | `"Service saved"` / `"Service deleted"` |
| `PhotoManager.tsx` | Privacy toggle saved | `"Privacy settings saved"` |
| `BioEditor.tsx` | Debounced save success | `"Bio saved"` (replaces discreet timestamp) |
| `ClientNotes.tsx` | Note saved | `"Note saved"` |
| `SafeBuddyGenerator.tsx` | Link copied to clipboard | `"Link copied!"` |
| `MessageInput.tsx` | Message sent | No toast needed — see section 1.3 instead |
| Any component | Network / save error | `"Something went wrong — please try again"` |

---

## 1.2 — Booking Request Confirmation Screen

### Why
The most critical UX gap in the app. When a client submits a booking request, the modal silently closes. There is no confirmation that the request was sent. Users cannot distinguish a successful submission from accidentally closing the modal.

### Current Flow
```
Fill form → "Send Request" → [silent modal close]
```

### New Flow
```
Fill form → "Send Request" → [success screen inside modal] → "View Booking" CTA
```

### Implementation

In `BookingRequest.tsx`, add a `submitted` state with a success screen rendered in place of the form:

```tsx
// State
const [submitted, setSubmitted] = useState(false);
const [submittedWorkerName, setSubmittedWorkerName] = useState('');

// On success (replace onClose() call):
setSubmittedWorkerName(workerName); // pass workerName as prop
setSubmitted(true);

// Success screen JSX (rendered when submitted === true):
if (submitted) {
  return (
    <div className="flex flex-col items-center text-center p-8 gap-4">
      <div className="w-16 h-16 rounded-full bg-safe-100 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-safe-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Request Sent!</h2>
      <p className="text-gray-600 text-sm max-w-xs">
        Your booking request has been sent to{' '}
        <span className="font-semibold">{submittedWorkerName}</span>.
        They'll respond within 24 hours.
      </p>
      <button
        onClick={() => navigate('/bookings')}
        className="w-full bg-trust-600 text-white py-3 rounded-xl font-semibold hover:bg-trust-700 transition-colors"
      >
        View My Bookings
      </button>
      <button
        onClick={onClose}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Close
      </button>
    </div>
  );
}
```

**Props change required:** `BookingRequest` needs a `workerName: string` prop passed from `ServiceDetail.tsx`.

---

## 1.3 — Message Send Micro-Confirmation

### Why
Sending a message clears the textarea and the message appears in the thread — but if the thread is long and the new message scrolls into view slowly, users may not notice it was sent. No explicit signal exists.

### Implementation

Add a brief "sent" indicator on the last sent bubble. In `MessageBubble.tsx`, add a `justSent` prop that triggers a short opacity animation:

```tsx
// In MessageThread.tsx, track the ID of the most recently sent message
const [lastSentId, setLastSentId] = useState<string | null>(null);

// After send success, set lastSentId
// Clear it after 2 seconds

// In MessageBubble.tsx:
{justSent && (
  <span className="text-xs text-safe-500 animate-fade-in">✓ Sent</span>
)}
```

This avoids a toast (which would be distracting in a chat context) while still providing a clear signal.

---

## 1.4 — Resend Verification Email

### Why
The email verification pending screen currently offers no option to resend if the email was lost or went to spam. This is a documented cause of user drop-off during onboarding.

### Implementation

In `EmailVerificationPending.tsx`, add a resend button with a 60-second cooldown:

```tsx
const [cooldown, setCooldown] = useState(0);

const handleResend = async () => {
  await supabase.auth.resend({ type: 'signup', email: userEmail });
  setCooldown(60);
  showToast.success('Verification email resent — check your inbox');
  const interval = setInterval(() => {
    setCooldown(prev => {
      if (prev <= 1) { clearInterval(interval); return 0; }
      return prev - 1;
    });
  }, 1000);
};
```

Button renders as:
- Active: `"Resend email"`
- Cooldown: `"Resend in 54s"` (greyed out, disabled)

**Requires:** `userEmail` passed as state from the signup redirect, stored in `location.state` or `sessionStorage`.

---

## Acceptance Criteria

- [ ] Toast appears at top-centre on all save operations listed in section 1.1
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Toast does not block interaction
- [ ] Booking request shows success screen with worker name on submit
- [ ] "View My Bookings" CTA navigates to `/bookings`
- [ ] Sent message shows "✓ Sent" for 2 seconds
- [ ] Resend email button available on verification pending screen
- [ ] Resend cooldown timer counts down visibly
- [ ] No existing tests broken (run `npm run lint`)
