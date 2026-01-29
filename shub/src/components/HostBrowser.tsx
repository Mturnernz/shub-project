import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, Users, Clock } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface HostBrowserProps {
  onHostSelect?: (host: User) => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

interface FilterState {
  location: string;
  services: string[];
  availability: string;
  verified: boolean;
}

const HostBrowser: React.FC<HostBrowserProps> = ({ onHostSelect, showBackButton, onBack }) => {
  const [hosts, setHosts] = useState<User[]>([]);
  const [filteredHosts, setFilteredHosts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: 'All Locations',
    services: [],
    availability: 'All',
    verified: false
  });

  // Mock locations for filtering
  const locations = [
    'All Locations',
    'Auckland',
    'Wellington',
    'Christchurch',
    'Hamilton',
    'Tauranga',
    'Dunedin'
  ];

  // Mock service categories
  const serviceCategories = [
    'Massage Therapy',
    'Personal Training',
    'Beauty Services',
    'Wellness Coaching',
    'Physiotherapy',
    'Mental Health Support'
  ];

  useEffect(() => {
    fetchHosts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [hosts, searchQuery, filters]);

  const fetchHosts = async () => {
    try {
      setLoading(true);

      // Fetch published host profiles
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'host')
        .eq('verified', true)
        .not('bio', 'is', null);

      if (error) {
        console.error('Error fetching hosts:', error);
        // Use mock data if database query fails
        setHosts(getMockHosts());
      } else {
        setHosts(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setHosts(getMockHosts());
    } finally {
      setLoading(false);
    }
  };

  const getMockHosts = (): User[] => [
    {
      id: 'host1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      type: 'host',
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
      id: 'host2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      type: 'host',
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
      id: 'host3',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      type: 'host',
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
    let filtered = hosts;

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(host =>
        host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (host.bio && host.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (host.location && host.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply location filter
    if (filters.location !== 'All Locations') {
      filtered = filtered.filter(host =>
        host.location?.includes(filters.location) ||
        host.primaryLocation?.includes(filters.location)
      );
    }

    // Apply verified filter
    if (filters.verified) {
      filtered = filtered.filter(host => host.verified);
    }

    // Apply availability filter
    if (filters.availability !== 'All') {
      filtered = filtered.filter(host => host.status === filters.availability);
    }

    setFilteredHosts(filtered);
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
      case 'available': return 'text-green-600 bg-green-100';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="mr-3 p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                >
                  ←
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Browse Hosts</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-purple-100 bg-white/90 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="away">Away</option>
                </select>
              </div>

              {/* Verified Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hosts...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredHosts.length} of {hosts.length} hosts
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Host Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHosts.map(host => (
                <div
                  key={host.id}
                  onClick={() => onHostSelect?.(host)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  {/* Host Avatar */}
                  <div className="flex items-center mb-4">
                    <img
                      src={host.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b76ce8c8?w=60&h=60&fit=crop&crop=face'}
                      alt={host.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{host.name}</h3>
                        {host.verified && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {host.location || host.primaryLocation}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {host.bio}
                  </p>

                  {/* Status and Rating */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(host.status)}`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getStatusText(host.status)}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.8</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredHosts.length === 0 && !loading && (
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

export default HostBrowser;