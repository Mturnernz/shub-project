# Shub - Safety-First Service Directory

A New Zealand-based, safety-first directory and booking coordination platform for consenting adults. Built with trust, privacy, and modern UX in mind.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account and project

### Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your Supabase credentials in `.env`:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Find your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React hooks + custom hooks

### Project Structure
```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── HostProfile/    # Host profile management
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
│   └── supabase.ts     # Supabase client & types
├── pages/              # Full-page components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── data/               # Static data and mock data
```

## 🛡️ Safety & Compliance

### Core Safety Features
- **Age Verification**: 18+ gate before entry
- **Identity Verification**: ID + selfie verification for workers
- **Content Moderation**: Automated filtering of unsafe phrases
- **Safe Sex Policy**: Mandatory condom policy for all listings
- **Reporting System**: User reporting and admin moderation
- **Safe Buddy Links**: One-time safety coordination links

### Compliance
- Privacy Act 2020 (New Zealand) compliant
- Prostitution Reform Act 2003 aligned
- Advertising Standards Authority guidelines

## 🗄️ Database Schema

The application uses Supabase with the following core tables:

- `users` - User accounts and roles
- `worker_profiles` - Worker profile information
- `verification_docs` - ID verification documents
- `bookings` - Booking requests and status
- `messages` - In-app messaging
- `reports` - User reports and moderation
- `safe_buddy_tokens` - Safety coordination tokens
- `admin_audit` - Admin action logging

## 🚦 User Flows

### Worker Onboarding
1. Account creation with email verification
2. Upload ID and selfie for verification
3. Admin verification approval
4. Complete profile (bio, photos, services, rates)
5. Admin publishes profile to directory

### Client Journey
1. Browse directory (guest or authenticated)
2. View worker profiles and services
3. Submit booking request for time slot
4. In-app messaging once booking confirmed
5. Optional Safe Buddy link coordination

### Admin Workflow
1. Review and approve identity verification
2. Publish/unpublish worker profiles
3. Moderate reported content
4. All actions audited in admin_audit table

## 🔧 Development Commands

```bash
# Core Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build           # Production build
npm run preview         # Preview production build
npm run lint            # ESLint code quality check

# Environment Testing
npm run test:connection # Test Supabase connection (planned)
npm run test:db         # Test database schema (planned)
```

## 🌟 Features Status

### ✅ Implemented
- Age verification gate
- User authentication with email verification
- Worker/client role selection
- Basic profile management
- Service browsing and search
- Responsive mobile-first design

### 🚧 In Development
- Booking request system
- In-app messaging
- Content moderation system
- Safe Buddy link generation
- Admin verification dashboard

### 📋 Planned
- Payment integration (post-MVP)
- Advanced search filters
- Review and rating system
- Mobile app (React Native)

## 🤝 Contributing

This is a safety-critical application. All contributions must:

1. Follow the established safety and compliance guidelines
2. Include appropriate tests for new features
3. Maintain TypeScript strict mode compliance
4. Follow the existing code style and patterns

## 📄 Legal

This platform is designed for New Zealand's legal framework where sex work is decriminalized under the Prostitution Reform Act 2003. Users must be 18+ and all services must be provided with appropriate safety measures.

## 🆘 Support

For technical issues or safety concerns:
- Create an issue in this repository
- For urgent safety matters, contact local authorities

---

**Important**: This is an adult platform. Users must verify they are 18+ before accessing any content.