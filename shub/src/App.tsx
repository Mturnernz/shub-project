import React, { useState } from 'react';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from './lib/supabase';
import AgeGate from './components/AgeGate';
import LandingPage from './components/LandingPage';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout';
import Header from './components/Header';
import UserTypeSelection from './components/UserTypeSelection';
import SignUpForm from './components/Auth/SignUpForm';
import EmailVerificationPending from './components/Auth/EmailVerificationPending';
import ClientHome from './components/ClientHome';
import SearchBar from './components/SearchBar';
import ServiceCard from './components/ServiceCard';
import ServiceDetail from './components/ServiceDetail';
import HostProfileManagement from './pages/HostProfileManagement';
import HostDashboard from './components/HostDashboard';
import EmailVerificationSuccessPage from './components/Auth/EmailVerificationSuccessPage';
import { useServices } from './hooks/useServices';
import { useAuth } from './hooks/useAuth';
import { useRole } from './hooks/useRole';
import { useBookings } from './hooks/useBookings';
import { Service } from './types';
import BookingList from './components/Booking/BookingList';
import MessageThread from './components/Messaging/MessageThread';
import type { BookingWithProfiles } from './lib/bookings';

type UserType = 'host' | 'client' | null;
type View = 'landingPage' | 'login' | 'userSelection' | 'signUp' | 'emailVerification' | 'emailVerificationSuccess' | 'home' | 'search' | 'bookings' | 'messages' | 'messageThread' | 'profile' | 'serviceDetail' | 'hostProfileManagement';

function App() {
  const [currentView, setCurrentView] = useState<View>('landingPage');
  const [ageVerified, setAgeVerified] = useState(false);
  const [signUpUserType, setSignUpUserType] = useState<UserType>(null);
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithProfiles | null>(null);
  const { services, loading, error, searchServices } = useServices();
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const { currentRole, canToggleRoles, isToggling, switchRole, getEffectiveUserType } = useRole();

  // Get bookings data for current user
  const {
    bookings,
    activeBookings,
    loading: bookingsLoading,
    updateStatus,
    cancelUserBooking
  } = useBookings(userProfile?.id || null, getEffectiveUserType() === 'host' ? 'worker' : getEffectiveUserType());

  // Derive user type and ID from auth
  const userType = getEffectiveUserType();
  const currentUserId = userProfile?.id || null;

  // Check age verification on app initialization
  useEffect(() => {
    const ageVerified = localStorage.getItem('shub_age_verified');
    const sessionVerified = sessionStorage.getItem('shub_session_verified');
    
    if (ageVerified === 'true' && sessionVerified === 'true') {
      setAgeVerified(true);
    }
  }, []);

  // Check for email verification success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true' && user && userProfile) {
      setCurrentView('emailVerificationSuccess');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, userProfile]);

  // Handle landing page actions
  const handleBrowseAsGuest = () => {
    setCurrentView('home');
  };

  const handleNavigateToLogin = () => {
    setCurrentView('login');
  };

  const handleNavigateToSignUpSelection = () => {
    setCurrentView('userSelection');
  };

  const handleBackToLanding = () => {
    setCurrentView('landingPage');
  };

  // Handle login success
  const handleLoginSuccess = (userId: string, type: 'host' | 'client') => {
    // Clear any signup state when logging in directly
    setSignUpUserType(null);
    setSignUpEmail('');

    // Both hosts and clients go to 'home' view
    // The content is differentiated in renderContent() based on userType
    setCurrentView('home');
  };

  const handleUserTypeSelect = (type: UserType) => {
    setSignUpUserType(type);
    setCurrentView('signUp');
  };

  const handleSignUpSuccess = (type: UserType, userId: string) => {
    setSignUpEmail(userId); // userId is actually email now
    setCurrentView('emailVerification');
  };

  const handleEmailVerificationSuccess = () => {
    // Both hosts and clients go to 'home' view after email verification
    // The content is differentiated in renderContent() based on userType
    setCurrentView('home');
  };

  const handleBackToUserSelection = () => {
    setSignUpUserType(null);
    setCurrentView('userSelection');
  };

  const handleBackFromSignUp = () => {
    setSignUpUserType(null);
    setSignUpEmail('');
    setCurrentView('landingPage');
  };

  const handleTabChange = (tab: string) => {
    setCurrentView(tab as View);
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setCurrentView('serviceDetail');
  };

  const handleSearch = (query: string, category: string, location: string) => {
    searchServices(query, category, location);
  };

  const handleAdvancedSearch = (
    query: string, 
    category: string, 
    location: string, 
    availability?: string, 
    minRating?: number, 
    dateCreated?: string,
    featuredOnly?: boolean
  ) => {
    searchServices(query, category, location, availability, minRating, dateCreated, featuredOnly);
  };

  const handleCategoryClick = (category: string) => {
    handleAdvancedSearch('', category, 'All Locations');
  };

  const handleAgeVerified = () => {
    setAgeVerified(true);
  };

  // Handle role switching (only for hosts)
  const handleRoleChange = async (newRole: 'host' | 'client') => {
    if (canToggleRoles) {
      const success = await switchRole(newRole);
      if (success) {
        // Both host and client views use 'home', content differs based on role
        setCurrentView('home');
      }
    }
  };

  // Booking and messaging handlers
  const handleBookingStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    return await updateStatus(bookingId, status);
  };

  const handleCancelBooking = async (bookingId: string) => {
    return await cancelUserBooking(bookingId);
  };

  const handleOpenChat = (booking: BookingWithProfiles) => {
    setSelectedBooking(booking);
    setCurrentView('messageThread');
  };

  const handleViewBookingDetails = (booking: BookingWithProfiles) => {
    setSelectedBooking(booking);
    // Could navigate to a detailed booking view
    console.log('View booking details:', booking);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      // Reset state and redirect to landing page
      setCurrentView('landingPage');
      setSelectedService(null);
      setSelectedBooking(null);
      setSignUpUserType(null);
      setSignUpEmail('');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show age gate before any other content
  if (!ageVerified) {
    return <AgeGate onVerified={handleAgeVerified} />;
  }

  if (currentView === 'landingPage') {
    return (
      <LandingPage
        onBrowseAsGuest={handleBrowseAsGuest}
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateToSignUpSelection={handleNavigateToSignUpSelection}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onBack={handleBackToLanding}
      />
    );
  }

  if (currentView === 'userSelection') {
    return (
      <UserTypeSelection
        onSelect={handleUserTypeSelect}
        onBack={handleBackToLanding}
      />
    );
  }

  if (currentView === 'signUp' && signUpUserType) {
    return (
      <SignUpForm
        userType={signUpUserType}
        onBack={handleBackToUserSelection}
        onSignUpSuccess={handleSignUpSuccess}
      />
    );
  }

  if (currentView === 'emailVerification' && signUpUserType && signUpEmail) {
    return (
      <EmailVerificationPending
        email={signUpEmail}
        userType={signUpUserType}
        onBack={handleBackFromSignUp}
      />
    );
  }

  if (currentView === 'emailVerificationSuccess' && userType) {
    return (
      <EmailVerificationSuccessPage
        userType={userType}
        onProceed={handleEmailVerificationSuccess}
      />
    );
  }

  if (currentView === 'serviceDetail' && selectedService) {
    return (
      <ServiceDetail
        service={selectedService}
        onBack={() => setCurrentView('home')}
        userType={userType}
       onSignUpAsClient={() => handleUserTypeSelect('client')}
        onBook={() => {
          // Handle booking logic here
          console.log('Booking service:', selectedService);
        }}
      />
    );
  }

  if (currentView === 'hostProfileManagement') {
    return (
      <HostProfileManagement
        onBack={() => setCurrentView('home')}
        userId={currentUserId || ''}
      />
    );
  }

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'home':
        return userType === 'host' ? 'Dashboard' : 'Shub';
      case 'search':
        return userType === null ? 'Browse Services' : 'Search Services';
      case 'bookings':
        return 'My Bookings';
      case 'messages':
        return 'Messages';
      case 'messageThread':
        return 'Chat';
      case 'profile':
        return 'Profile';
      default:
        return 'Shub';
    }
  };

  const getBackHandler = () => {
    switch (currentView) {
      case 'bookings':
      case 'messages':
      case 'profile':
        return () => setCurrentView('home');
      case 'messageThread':
        return () => setCurrentView('bookings');
      case 'home':
        return userType === null ? () => setCurrentView('landingPage') : undefined;
      default:
        return undefined;
    }
  };

  const shouldShowBackButton = () => {
    return currentView !== 'landingPage' && getBackHandler() !== undefined;
  };
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        if (userType === 'client') {
          return (
            <ClientHome
              services={services}
              loading={loading}
              error={error}
              onServiceClick={handleServiceClick}
              onCategoryClick={handleCategoryClick}
              onSearch={handleAdvancedSearch}
              userType={userType}
              onSignUpAsClient={() => handleUserTypeSelect('client')}
              canBecomeHost={false}
            />
          );
        }
        // Handle guest users
        if (userType === null) {
          return (
            <ClientHome
              services={services}
              loading={loading}
              error={error}
              onServiceClick={handleServiceClick}
              onCategoryClick={handleCategoryClick}
              onSearch={handleAdvancedSearch}
              userType={userType}
              onBack={() => setCurrentView('landingPage')}
              showBackButton={true}
              onSignUpAsClient={() => handleUserTypeSelect('client')}
              canBecomeHost={false}
            />
          );
        }
        return (
          <HostDashboard
            userProfile={userProfile}
            onManageProfile={() => setCurrentView('hostProfileManagement')}
          />
        );

      case 'bookings':
        return (
          <div className="px-4 py-8">
            <BookingList
              bookings={bookings}
              userRole={userType === 'host' ? 'worker' : 'client'}
              loading={bookingsLoading}
              title="Your Bookings"
              emptyMessage={userType === 'client' ? 'No bookings yet' : 'No booking requests yet'}
              onUpdateStatus={handleBookingStatusUpdate}
              onViewDetails={handleViewBookingDetails}
              onOpenChat={handleOpenChat}
            />
          </div>
        );

      case 'messages':
        return (
          <div className="px-4 py-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
              <p className="text-gray-600 text-center">
                Messages are available for confirmed bookings. Select a booking to start chatting.
              </p>
            </div>
          </div>
        );

      case 'messageThread':
        if (!selectedBooking || !currentUserId) {
          return (
            <div className="px-4 py-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-gray-600">Please select a booking to view messages.</p>
                <button
                  onClick={() => setCurrentView('bookings')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Bookings
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="h-full">
            <MessageThread
              booking={selectedBooking}
              currentUserId={currentUserId}
              onBack={() => setCurrentView('bookings')}
            />
          </div>
        );

      case 'profile':
        return (
          <div className="px-4 py-8">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center mb-6 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile</h2>
              <p className="text-gray-600">Profile settings coming soon</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout 
      activeTab={currentView} 
      onTabChange={handleTabChange}
      userType={userType}
    >
      <Header
        title={getHeaderTitle()}
        onBack={getBackHandler()}
        showBackButton={shouldShowBackButton()}
        showRoleToggle={canToggleRoles}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        isRoleToggling={isToggling}
        showLogout={!!userProfile}
        onLogout={handleLogout}
      />
      {renderContent()}
    </Layout>
  );
}

export default App;