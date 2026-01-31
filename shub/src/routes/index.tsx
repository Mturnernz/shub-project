import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AgeGateGuard } from './guards';
import AppShell from './AppShell';

// Lazy load route components for code splitting
const LandingPage = lazy(() => import('../components/layout/LandingPage'));
const LoginForm = lazy(() => import('../features/auth/components/LoginForm'));
const SignUpFlow = lazy(() => import('./SignUpFlow'));
const EmailVerificationPending = lazy(() => import('../features/auth/components/EmailVerificationPending'));
const EmailVerificationSuccessPage = lazy(() => import('../features/auth/components/EmailVerificationSuccessPage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfileManagementPage = lazy(() => import('./pages/ProfileManagementPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const MessageThreadPage = lazy(() => import('./pages/MessageThreadPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-trust-50 to-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    element: <AgeGateGuard />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginForm />
          </Suspense>
        ),
      },
      {
        path: '/signup',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SignUpFlow />
          </Suspense>
        ),
      },
      {
        path: '/verify-email',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <EmailVerificationPending />
          </Suspense>
        ),
      },
      {
        path: '/verify-success',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <EmailVerificationSuccessPage />
          </Suspense>
        ),
      },
      {
        element: <AppShell />,
        children: [
          {
            path: '/browse',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <BrowsePage />
              </Suspense>
            ),
          },
          {
            path: '/listings/:id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ServiceDetailPage />
              </Suspense>
            ),
          },
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/dashboard/profile',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProfileManagementPage />
              </Suspense>
            ),
          },
          {
            path: '/bookings',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <BookingsPage />
              </Suspense>
            ),
          },
          {
            path: '/bookings/:id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <BookingDetailPage />
              </Suspense>
            ),
          },
          {
            path: '/messages',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <MessagesPage />
              </Suspense>
            ),
          },
          {
            path: '/bookings/:id/chat',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <MessageThreadPage />
              </Suspense>
            ),
          },
          {
            path: '/profile',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
