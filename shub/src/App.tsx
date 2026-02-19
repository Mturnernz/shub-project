import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './services/query-client';
import { router } from './routes';
import { useAuthInit } from './features/auth/hooks/useAuthInit';
import { useUIStore } from './stores/ui.store';

function AuthInitializer() {
  useAuthInit();
  return null;
}

function ThemeSync() {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <ThemeSync />
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{ duration: 3000 }}
      />
    </QueryClientProvider>
  );
}

export default App;
