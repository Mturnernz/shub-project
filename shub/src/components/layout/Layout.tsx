import React, { ReactNode } from 'react';
import { Home, Search, MessageSquare, User, Heart, Calendar } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userType?: 'host' | 'client' | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab = 'home', onTabChange, userType }) => {
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const clientTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const hostTabs = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const guestTabs = [
    { id: 'home', icon: Home, label: 'Browse' }
  ];

  const tabs = userType === 'host' ? hostTabs : userType === 'client' ? clientTabs : guestTabs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-warm-50">
      <main className="pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-trust-100 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-trust-600 bg-trust-100' 
                    : 'text-gray-500 hover:text-trust-500 hover:bg-trust-50'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;