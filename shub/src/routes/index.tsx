import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AgeGateGuard } from './guards';
import { AdminGuard } from './guards/AdminGuard';
import AppShell from './AppShell';
import ErrorPage from './pages/ErrorPage';

// Lazy load route components for code splitting
const LandingPage = lazy(() => import('../components/layout/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpFlow = lazy(() => import('./SignUpFlow'));
const EmailVerificationPendingPage = lazy(() => import('./pages/EmailVerificationPendingPage'));
const EmailVerificationSuccessPage = lazy(() => import('./pages/EmailVerificationSuccessPage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfileManagementPage = lazy(() => import('./pages/ProfileManagementPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const MessageThreadPage = lazy(() => import('./pages/MessageThreadPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SafetyHubPage = lazy(() => import('./pages/SafetyHubPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const ClientNotesPage = lazy(() => import('./pages/ClientNotesPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const VerificationQueuePage = lazy(() => import('./pages/admin/VerificationQueuePage'));
const ProfilePublishingPage = lazy(() => import('./pages/admin/ProfilePublishingPage'));
const ModerationQueuePage = lazy(() => import('./pages/admin/ModerationQueuePage'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));

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
    errorElement: <ErrorPage />,
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
            <LoginPage />
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
            <EmailVerificationPendingPage />
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
          {
            path: '/safety',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SafetyHubPage />
              </Suspense>
            ),
          },
          {
            path: '/safety/notes',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ClientNotesPage />
              </Suspense>
            ),
          },
          {
            path: '/verify',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <VerificationPage />
              </Suspense>
            ),
          },
        ],
      },
      // Admin routes (protected by AdminGuard)
      {
        element: <AdminGuard />,
        children: [
          {
            path: '/admin',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/verifications',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <VerificationQueuePage />
              </Suspense>
            ),
          },
          {
            path: '/admin/profiles',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePublishingPage />
              </Suspense>
            ),
          },
          {
            path: '/admin/reports',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ModerationQueuePage />
              </Suspense>
            ),
          },
          {
            path: '/admin/audit-log',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AuditLogPage />
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
