import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  type: 'host' | 'client';
  currentRole?: 'host' | 'client';
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
  currentRole: 'host' | 'client';
  setUser: (user: SupabaseUser | null) => void;
  setUserProfile: (profile: AppUserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentRole: (role: 'host' | 'client') => void;
  clearAuth: () => void;
  getEffectiveUserType: () => 'host' | 'client' | null;
  canToggleRoles: () => boolean;
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
      currentRole: profile?.type === 'host' ? (profile.currentRole || 'host') : 'client',
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
    if (userProfile.type === 'host') return currentRole;
    return userProfile.type;
  },

  canToggleRoles: () => {
    const { userProfile } = get();
    return userProfile?.type === 'host';
  },
}));
