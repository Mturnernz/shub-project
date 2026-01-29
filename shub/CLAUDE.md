# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

### Vision & Positioning
Shub is a New Zealand–based, safety-first directory and booking coordination platform for consenting adults. It's designed for trust, privacy, and modern UX—filling the gap left by legacy NZ directories with verified worker profiles, clear safer-sex policies, and built-in safety tooling.

**Important: The MVP does not handle payments or monetisation.**

### Guiding Principles
- **Safety-by-default**: Verified identities, safer-sex declarations, redaction, reporting, Safe Buddy links
- **Privacy & dignity**: Minimal data, privacy-sensitive profile options (blur, watermark, coarse location)
- **Compliance first**: PRA-aligned (no under-18, no unsafe services), Privacy Act practices, Advertising Standards alignment
- **Clarity & calm**: Accessible, clean UI; transparent safety messaging

### Target Users
- **Independent workers & agencies**: Need verified profiles, reliable booking requests, and protection from abuse/no-shows
- **Clients**: Want trustworthy discovery (verified workers, availability, boundaries) and safer communication
- **Admins/Moderators**: Verify users, publish profiles, and resolve reports quickly and fairly

### MVP Features (No Payments)
- **Accounts & Roles**: Supabase Auth (OTP). Roles: worker, client, admin
- **Worker onboarding & verification**: Upload ID + selfie → admin approval → publishable profile
- **Profiles**: Bio, services, region, availability, hourly-rate text, photo gallery with blur + watermark options; "Condoms mandatory" tickbox required to publish
- **Search & Discovery**: Filter by region, services, availability; full-text search on bio/rate text
- **Booking requests**: Client proposes time window → worker accept/decline → status updates
- **Messaging**: In-app chat on each booking, with unsafe-term redaction before storage
- **Safety tooling**: Report users/content, Safe Buddy links for booking coordination

## Architecture (Bolt + Supabase)

### Frontend (Bolt)
Mobile-first SPA. Pages: Landing (18+), Browse, Profile, Booking, Messaging, Worker Dashboard, Client Dashboard, Admin

### Backend (Supabase)
- **Auth**: email/phone OTP
- **DB**: Postgres (+ RLS). Core tables: users, worker_profiles, verification_docs, bookings, messages, reports, safe_buddy_tokens, admin_audit
- **Storage**: public-profile-photos (public), id-docs (private)
- **Edge Functions**: sanitize-message, generate-safe-buddy-link, resolve-safe-buddy-token
- **Realtime**: subscriptions on messages and bookings
- **Security**: RLS everywhere, private bucket for ID docs, service-role key only in server/edge contexts, audit all admin actions

## Data Model Snapshot
- **users**: role, display_name, is_verified
- **worker_profiles**: bio, services[], region, availability[], hourly_rate_text, photo_album[], condoms_mandatory, published
- **verification_docs**: role, selfie_url, id_front_url, status, reviewer + timestamps
- **bookings**: worker_id, client_id, start_time, end_time, status, timestamps
- **messages**: booking_id, sender_id, content (post-redaction)
- **reports**: reporter_id, target_type, target_id, reason, status
- **safe_buddy_tokens**: booking_id, token, expires_at, used
- **admin_audit**: admin actions & notes

## RLS Rules
- Users see/edit only their own data; only published profiles are publicly visible
- Booking and messaging restricted to participants
- Admin access via service role in admin UI/edge functions

## Core Flows

### Worker Onboarding
1. Create account (OTP) → choose worker
2. Upload ID + selfie → status pending
3. Admin verifies → users.is_verified=true
4. Worker completes profile (must tick condoms mandatory) → submits for publish
5. Admin sets published=true → profile appears in Browse

### Client Journey
1. Create account (OTP) → choose client
2. Browse/filter → open profile → request a time slot
3. Worker accepts → booking becomes confirmed
4. Client and worker can chat (redaction on)
5. Worker may generate Safe Buddy link (one-time)

### Admin Workflow
1. Verify docs, publish/unpublish profiles
2. Review reports, update statuses (open → in_review → resolved/dismissed)
3. All actions audited

## Content & Compliance Guardrails
- **Age gate**: users must confirm 18+ before entry
- **No minors**: Immediate suspension + escalation if suspected
- **Safer-sex policy**: "Condoms mandatory / safe sex only" enforced in UI and content filters. Block unsafe phrases (e.g., "no condom," "bareback/bb")
- **Dignity**: no coercion, degrading language, or illegal content; avoid public-facing explicit media
- **Privacy**: collect only what's needed; explain why; allow access/correction/deletion where lawful

## Safety & Moderation
- **Preventive filters**: UI blocks unsafe phrases in listings; edge function redacts unsafe chat terms server-side
- **Review gates**: new profiles require admin publish; flagged content routed to moderation queue
- **Takedown**: immediate unpublish on suspected minor/unsafe content; preserve evidence; escalate per policy
- **Appeals**: structured, time-bound appeal path for users

## Delivery Plan (6 weeks)
- **Week 1-2**: Supabase schema + RLS; Bolt scaffolding; auth, layouts, nav, landing with 18+
- **Week 3-4**: Worker onboarding + admin verification queue; Profiles (gallery with blur/watermark), Browse + filters
- **Week 5**: Bookings + Realtime updates; messaging with sanitize-message; Safe Buddy link generation + resolve view
- **Week 6**: Reports + moderation + audit log; Accessibility pass; basic analytics; seed test data; UAT; Release MVP to closed beta

## UX Standards
- Calm, readable cards (ample whitespace, readable type, verified badge, last-seen)
- Mobile-first forms with progress indicators for onboarding
- Accessible filters (clear chips, region selector, services, availability)
- Clarity over cleverness: no "code-word" culture; plain labels; safety tips linked in context

## Brand Guidelines
- **Tone**: respectful, clear, non-salacious. Focus on safety, rights, and professionalism
- **Copy**: plain English. No euphemisms that can imply unsafe services
- **Footer**: always include links to Privacy, Terms, Safer-Sex Policy, Verification Policy, Complaints/Takedown, and NZ support resources

## Development Commands

### Core Development
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

### Environment Setup
Requires `.env` file with Supabase configuration:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Architecture

### Core Structure
This is a React + TypeScript service marketplace application using Supabase as the backend. The app connects service hosts (providers) with clients (customers).

### Key Architectural Patterns

**State Management:**
- Uses React hooks for local state management
- Custom hooks in `src/hooks/` handle complex state logic (auth, services, profiles)
- No external state management library - relies on React's built-in state and context

**Authentication Flow:**
- Supabase Auth handles authentication with email verification
- `useAuth` hook manages auth state and user profile synchronization
- Dual data model: Supabase User (auth) + AppUser (profile data in users table)
- Auto-creates user profiles for verified users if they don't exist

**Data Layer:**
- Supabase client in `src/lib/supabase.ts` with typed database schema
- Database types defined inline in supabase.ts file
- Frontend types in `src/types/index.ts` (different from DB schema)
- Transform functions convert between DB and frontend models

**Component Organization:**
- `src/components/Auth/` - Authentication forms and flows
- `src/components/HostProfile/` - Host profile management components
- `src/pages/` - Full-page components
- Main navigation handled by single App.tsx with view state

**User Types & Flows:**
- **Hosts**: Service providers who create profiles with photos, services, availability
- **Clients**: Service seekers who browse and book services
- **Guests**: Unauthenticated users who can browse services

### Critical Implementation Details

**Profile Completion Logic:**
- Host profiles require minimum 3 photos before publishing
- Profile data includes: bio, photos, availability, languages, service areas
- `isPublished` flag controls host visibility in search results

**Search & Service Discovery:**
- Services filtered by category, location, availability
- Real-time search with category and location filters
- Service cards show host info, ratings, and pricing

**View State Management:**
- Single `currentView` state in App.tsx controls entire app navigation
- View types defined in union type: `'landingPage' | 'login' | 'signUp' | ...`
- No routing library - uses programmatic view switching

**Database Schema Notes:**
- Snake_case in DB (created_at, host_id) transforms to camelCase in frontend
- Profile photos stored as string arrays
- Service areas as structured JSON with city/radius
- Languages as objects with proficiency levels

## Development Conventions

**TypeScript:**
- Strict TypeScript configuration with project references
- Separate types for database operations (Insert/Update/Row) and frontend models
- Transform functions bridge the gap between backend and frontend types

**Styling:**
- Tailwind CSS for all styling
- Consistent gradient themes (purple-to-pink)
- Responsive design with mobile-first approach
- Glass morphism effects with backdrop-blur

**Component Patterns:**
- Functional components with hooks
- Props destructuring in component signatures
- Conditional rendering over complex routing
- Event handlers passed down through props