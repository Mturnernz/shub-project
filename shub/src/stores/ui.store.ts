import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  ageVerified: boolean;
  theme: 'light' | 'dark';
  setAgeVerified: (verified: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ageVerified: false,
      theme: 'light',
      setAgeVerified: (verified) => {
        set({ ageVerified: verified });
        // Mirror to sessionStorage for session-level verification
        if (verified) {
          sessionStorage.setItem('shub_session_verified', 'true');
        }
      },
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'shub-ui-storage',
      partialize: (state) => ({
        ageVerified: state.ageVerified,
        theme: state.theme,
      }),
    }
  )
);
