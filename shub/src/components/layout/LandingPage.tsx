import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Calendar, CheckCircle, Eye } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';

interface LandingPageProps {
  onBrowseAsGuest?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToSignUpSelection?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onBrowseAsGuest,
  onNavigateToLogin,
  onNavigateToSignUpSelection,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, getEffectiveUserType } = useAuthStore();

  if (!loading && isAuthenticated) {
    const userType = getEffectiveUserType();
    navigate(userType === 'worker' ? '/dashboard' : '/browse', { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-trust-600 to-rose-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const handleBrowseAsGuest = onBrowseAsGuest || (() => navigate('/browse'));
  const handleNavigateToLogin = onNavigateToLogin || (() => navigate('/login'));
  const handleNavigateToSignUp = onNavigateToSignUpSelection || (() => navigate('/signup'));

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── ABOVE THE FOLD ── */}
      <div className="bg-gradient-to-br from-indigo-700 via-trust-600 to-rose-600 px-6 pt-16 pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-12">

          {/* Left: editorial copy + CTAs */}
          <div className="flex-1 max-w-xl mx-auto md:mx-0 text-center md:text-left">
            <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-4">
              New Zealand's safety-first host marketplace
            </p>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Your safety.<br />
              Your terms.<br />
              Your city.
            </h1>
            <p className="text-trust-100 text-lg mb-10 max-w-md mx-auto md:mx-0">
              Connect with verified, independent hosts in a platform built for dignity, discretion, and safety.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-6">
              <button
                onClick={handleBrowseAsGuest}
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5 text-trust-600" />
                Find a Host
              </button>
              <button
                onClick={() => navigate('/signup?type=worker')}
                className="px-8 py-4 bg-white/15 backdrop-blur-sm border-2 border-white/50 text-white rounded-full font-semibold text-base hover:bg-white/25 transition-all duration-200 flex items-center justify-center gap-2"
              >
                List Your Services
              </button>
            </div>

            {/* Secondary: Log in link */}
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <button
                onClick={handleNavigateToLogin}
                className="text-white/90 underline hover:text-white transition-colors font-medium"
              >
                Log in
              </button>
            </p>
          </div>

          {/* Right: frosted preview card — desktop only */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-center">
            <div className="relative w-72 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
              {/* Simulated profile card */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 blur-sm overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-rose-300 to-trust-300" />
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-white/40 rounded-full w-24 mb-2" />
                  <div className="h-2 bg-white/25 rounded-full w-16" />
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-safe-300" />
                  <span className="text-xs text-safe-200 font-medium">Verified</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-2 bg-white/25 rounded-full w-full" />
                <div className="h-2 bg-white/20 rounded-full w-3/4" />
                <div className="h-2 bg-white/15 rounded-full w-5/6" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 bg-white/20 rounded-full px-3 flex items-center">
                  <div className="h-2 bg-white/40 rounded-full w-12" />
                </div>
                <div className="h-7 bg-white/20 rounded-full px-3 flex items-center">
                  <div className="h-2 bg-white/40 rounded-full w-10" />
                </div>
              </div>
              {/* Age-gate blur overlay */}
              <div className="absolute inset-0 rounded-3xl bg-white/5 backdrop-blur-[2px] flex items-end justify-center pb-5">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Eye className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">Profiles visible after 18+ confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="bg-white px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-gray-900 text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-7 h-7 text-trust-600" />,
                step: '01',
                title: 'Browse verified hosts',
                description: 'Filter by location, availability, and services. Every host is identity-verified before appearing in search.',
              },
              {
                icon: <Calendar className="w-7 h-7 text-rose-500" />,
                step: '02',
                title: 'Request a booking',
                description: 'Propose a time that works. Hosts accept or decline — no pressure, no guessing.',
              },
              {
                icon: <Shield className="w-7 h-7 text-safe-600" />,
                step: '03',
                title: 'Stay safe with built-in tools',
                description: 'Use Safe Buddy links, in-app messaging with safety filters, and clear safer-sex policies.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-gray-300 tracking-widest mb-2">{item.step}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SAFETY COMMITMENT ── */}
      <div className="bg-[#1A1A2E] px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-safe-400" />
            <span className="text-safe-400 text-sm font-semibold tracking-wider uppercase">Built for safety</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Safety isn't optional. It's the foundation.
          </h2>
          <p className="text-gray-400 text-base mb-10 max-w-xl mx-auto">
            Shub is designed from the ground up for the safety, rights, and dignity of everyone on the platform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { title: 'Verified identities', body: 'Every host is ID-verified by our moderation team before their profile goes live.' },
              { title: 'Content moderation', body: 'Unsafe phrases are blocked at the point of entry. Flagged content is reviewed within 24 hours.' },
              { title: 'Safer-sex policy', body: "Condom use is mandatory for all in-person services. No exceptions, no opt-outs." },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-safe-400 flex-shrink-0" />
                  <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleBrowseAsGuest}
            className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-200 text-sm font-medium"
          >
            Read our safety policy
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-white text-lg">Shub</span>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {['Privacy', 'Terms', 'Safer-Sex Policy', 'Verification Policy', 'NZPC Resources'].map((link) => (
              <a key={link} href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                {link}
              </a>
            ))}
          </nav>
          <p className="text-gray-600 text-xs">© 2025 Shub NZ</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
