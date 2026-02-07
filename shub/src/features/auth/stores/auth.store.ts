import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'worker' | 'client' | 'admin';
  currentRole?: 'worker' | 'client' | 'admin';
  avatar?: string;
  location?: string;
  verified?: boolean;
  isPublished?: boolean;
  bio?: string;
  profilePhotos?: string[];
  status?: 'available' | 'busy' | 'away';
  statusMessage?: string;
  primaryLocation?: string;
  serviceAreas?: Array<{ city: string; radius: number }>;
  languages?: Array<{ language: string; proficiency: string }>;
  qualificationDocuments?: string[];
}

interface AuthState {
  user: SupabaseUser | null;
  userProfile: AppUserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  currentRole: 'worker' | 'client' | 'admin';
  setUser: (user: SupabaseUser | null) => void;
  setUserProfile: (profile: AppUserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentRole: (role: 'worker' | 'client' | 'admin') => void;
  clearAuth: () => void;
  getEffectiveUserType: () => 'worker' | 'client' | 'admin' | null;
  canToggleRoles: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  isAuthenticated: false,
  loading: true,
  currentRole: 'client',

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setUserProfile: (profile) =>
    set({
      userProfile: profile,
      currentRole: profile?.role === 'admin'
        ? 'admin'
        : profile?.role === 'worker'
          ? (profile.currentRole || 'worker')
          : 'client',
    }),

  setLoading: (loading) => set({ loading }),

  setCurrentRole: (role) => set({ currentRole: role }),

  clearAuth: () =>
    set({
      user: null,
      userProfile: null,
      isAuthenticated: false,
      currentRole: 'client',
    }),

  getEffectiveUserType: () => {
    const { userProfile, currentRole } = get();
    if (!userProfile) return null;
    if (userProfile.role === 'admin') return 'admin';
    if (userProfile.role === 'worker') return currentRole;
    return userProfile.role;
  },

  canToggleRoles: () => {
    const { userProfile } = get();
    return userProfile?.role === 'worker';
  },

  isAdmin: () => {
    const { userProfile } = get();
    return userProfile?.role === 'admin';
  },
}));
