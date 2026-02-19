import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, Users, Clock, User as UserIcon } from 'lucide-react';
import { User } from '../../../types';
import { supabase } from '../../../lib/supabase';

interface WorkerBrowserProps {
  onWorkerSelect?: (worker: User) => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

interface FilterState {
  location: string;
  services: string[];
  availability: string;
  verified: boolean;
}

const WorkerBrowser: React.FC<WorkerBrowserProps> = ({ onWorkerSelect, showBackButton, onBack }) => {
  const [workers, setWorkers] = useState<User[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: 'All Locations',
    services: [],
    availability: 'All',
    verified: false
  });

  const locations = [
    'All Locations',
    'Auckland',
    'Wellington',
    'Christchurch',
    'Hamilton',
    'Tauranga',
    'Dunedin'
  ];

  const serviceCategories = [
    'Massage Therapy',
    'Personal Training',
    'Beauty Services',
    'Wellness Coaching',
    'Physiotherapy',
    'Mental Health Support'
  ];

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workers, searchQuery, filters]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);

      // Fetch published host profiles — join user data for display info
      const { data, error } = await supabase
        .from('worker_profiles')
        .select('*, user:user_id(id, email, name, display_name, avatar_url, is_verified, status)')
        .eq('is_published', true);

      if (error) {
        console.error('Error fetching hosts:', error);
        setWorkers(getMockWorkers());
      } else {
        const transformed = (data || []).map((d: any) => ({
          id: d.user_id,
          name: d.display_name || d.user?.display_name || d.user?.name || 'Host',
          email: d.user?.email || '',
          role: 'worker' as const,
          avatar: d.profile_photos?.[0] || d.user?.avatar_url,
          location: d.primary_location || d.location,
          verified: d.is_verified || d.user?.is_verified,
          bio: d.bio,
          profilePhotos: d.profile_photos || [],
          status: d.status || d.user?.status || 'available',
          primaryLocation: d.primary_location,
        }));
        setWorkers(transformed);
      }
    } catch (err) {
      console.error('Error:', err);
      setWorkers(getMockWorkers());
    } finally {
      setLoading(false);
    }
  };

  const getMockWorkers = (): User[] => [
    {
      id: 'worker1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'worker',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b76ce8c8?w=150&h=150&fit=crop&crop=face',
      location: 'Auckland',
      verified: true,
      bio: 'Certified massage therapist with 8+ years experience. Specializing in deep tissue and sports massage.',
      profilePhotos: [
        'https://images.unsplash.com/photo-1594736797933-d0401ba19ab7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
      ],
      status: 'available',
      primaryLocation: 'Auckland CBD'
    },
    {
      id: 'worker2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'worker',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      location: 'Wellington',
      verified: true,
      bio: 'Personal trainer and fitness coach. Helping clients achieve their health and fitness goals.',
      profilePhotos: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
      ],
      status: 'busy',
      primaryLocation: 'Wellington Central'
    },
    {
      id: 'worker3',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      role: 'worker',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      location: 'Christchurch',
      verified: true,
      bio: 'Licensed aesthetician providing professional beauty and wellness services.',
      profilePhotos: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop'
      ],
      status: 'available',
      primaryLocation: 'Christchurch'
    }
  ];

  const applyFilters = () => {
    let filtered = workers;

    if (searchQuery.trim()) {
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (worker.bio && worker.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (worker.location && worker.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filters.location !== 'All Locations') {
      filtered = filtered.filter(worker =>
        worker.location?.includes(filters.location) ||
        worker.primaryLocation?.includes(filters.location)
      );
    }

    if (filters.verified) {
      filtered = filtered.filter(worker => worker.verified);
    }

    if (filters.availability !== 'All') {
      filtered = filtered.filter(worker => worker.status === filters.availability);
    }

    setFilteredWorkers(filtered);
  };

  const toggleServiceFilter = (service: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available': return 'text-safe-600 bg-safe-100';
      case 'busy': return 'text-orange-600 bg-orange-100';
      case 'away': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'away': return 'Away';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-warm-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-trust-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="mr-3 p-2 text-trust-600 hover:bg-trust-100 rounded-full transition-colors"
                >
                  ←
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Browse Hosts</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-trust-600 text-white rounded-lg hover:bg-trust-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search hosts by name, location, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-trust-100 bg-white/90 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trust-500"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trust-500"
                >
                  <option value="All">All</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="away">Away</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                  className="rounded border-gray-300 text-trust-600 focus:ring-trust-500"
                />
                <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
                  Verified hosts only
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-trust-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hosts...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredWorkers.length} of {workers.length} hosts
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map(worker => (
                <div
                  key={worker.id}
                  onClick={() => onWorkerSelect?.(worker)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center mb-4">
                    {worker.avatar ? (
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full mr-4 bg-trust-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-8 h-8 text-trust-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                        {worker.verified && (
                          <div className="w-5 h-5 bg-safe-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {worker.location || worker.primaryLocation}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {worker.bio}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getStatusText(worker.status)}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.8</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredWorkers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hosts found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters to find more hosts.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerBrowser;
