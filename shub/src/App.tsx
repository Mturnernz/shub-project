import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/query-client';
import { router } from './routes';
import { useAuthInit } from './features/auth/hooks/useAuthInit';

function AuthInitializer() {
  useAuthInit();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
