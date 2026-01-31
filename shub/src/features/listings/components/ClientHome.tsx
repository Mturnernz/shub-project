import React from 'react';
import { TrendingUp, Star, MapPin, ArrowLeft, Search, Filter, Zap } from 'lucide-react';
import { Service } from '../../../types';
import ServiceCard from './ServiceCard';
import { categories, locations } from '../../../data/mockData';

const SAVED_SEARCH_KEY = 'shub_saved_search';

interface SavedSearch {
  query: string;
  category: string;
  location: string;
  availability: string;
  minRating: number;
  dateCreated: string;
  featuredOnly: boolean;
  availableNow: boolean;
}

const loadSavedSearch = (): SavedSearch | null => {
  try {
    const saved = localStorage.getItem(SAVED_SEARCH_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveSavedSearch = (search: SavedSearch) => {
  try {
    localStorage.setItem(SAVED_SEARCH_KEY, JSON.stringify(search));
  } catch { /* ignore storage errors */ }
};

const clearSavedSearch = () => {
  try {
    localStorage.removeItem(SAVED_SEARCH_KEY);
  } catch { /* ignore storage errors */ }
};

interface ClientHomeProps {
  services: Service[];
  loading: boolean;
  error: string | null;
  onServiceClick: (service: Service) => void;
  onCategoryClick: (category: string) => void;
  onSearch: (query: string, category: string, location: string, availability?: string, minRating?: number, dateCreated?: string, featuredOnly?: boolean, availableNow?: boolean) => void;
  userType?: 'host' | 'client' | null;
  onBack?: () => void;
  showBackButton?: boolean;
  onSignUpAsClient?: () => void;
  onBecomeHost?: () => void;
  canBecomeHost?: boolean;
}

const ClientHome = ({ services, loading, error, onServiceClick, onCategoryClick, onSearch, userType, onBack, showBackButton = false, onSignUpAsClient, onBecomeHost, canBecomeHost = false }) => {
  const featuredServices = services.slice(0, 6);
  const popularCategories = categories.slice(1, 4);

  // Load saved search on mount
  const saved = React.useMemo(() => loadSavedSearch(), []);

  // Search state
  const [query, setQuery] = React.useState(saved?.query || '');
  const [category, setCategory] = React.useState(saved?.category || 'All');
  const [location, setLocation] = React.useState(saved?.location || 'All Locations');
  const [availability, setAvailability] = React.useState(saved?.availability || 'All');
  const [minRating, setMinRating] = React.useState(saved?.minRating || 0);
  const [dateCreated, setDateCreated] = React.useState(saved?.dateCreated || '');
  const [featuredOnly, setFeaturedOnly] = React.useState(saved?.featuredOnly || false);
  const [availableNow, setAvailableNow] = React.useState(saved?.availableNow || false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [isSearchActive, setIsSearchActive] = React.useState(!!saved);

  const isGuest = userType === null;

  // Apply saved search on mount
  React.useEffect(() => {
    if (saved) {
      const dateFilter = calculateDateFromFilter(saved.dateCreated);
      onSearch(saved.query, saved.category, saved.location, saved.availability, saved.minRating, dateFilter, saved.featuredOnly, saved.availableNow);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateDateFromFilter = (filterValue: string): string => {
    if (!filterValue || filterValue === 'Any Time') return '';

    const now = new Date();
    switch (filterValue) {
      case 'Last 7 Days':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'Last 30 Days':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case 'Last 90 Days':
        return new Date(now.setDate(now.getDate() - 90)).toISOString();
      default:
        return '';
    }
  };

  const handleSearch = () => {
    const dateFilter = calculateDateFromFilter(dateCreated);
    onSearch(query, category, location, availability, minRating, dateFilter, featuredOnly, availableNow);
    setIsSearchActive(true);
    // Persist search preferences
    saveSavedSearch({ query, category, location, availability, minRating, dateCreated, featuredOnly, availableNow });
  };

  const handleAvailableNowToggle = () => {
    const newValue = !availableNow;
    setAvailableNow(newValue);
    const dateFilter = calculateDateFromFilter(dateCreated);
    onSearch(query, category, location, availability, minRating, dateFilter, featuredOnly, newValue);
    setIsSearchActive(true);
    saveSavedSearch({ query, category, location, availability, minRating, dateCreated, featuredOnly, availableNow: newValue });
  };

  const handleCategoryClick = (selectedCategory: string) => {
    setCategory(selectedCategory);
    onSearch('', selectedCategory, 'All Locations', 'All', 0, '', featuredOnly, availableNow);
    setIsSearchActive(true);
  };

  const clearSearch = () => {
    setQuery('');
    setCategory('All');
    setLocation('All Locations');
    setAvailability('All');
    setMinRating(0);
    setDateCreated('');
    setFeaturedOnly(false);
    setAvailableNow(false);
    setIsSearchActive(false);
    clearSavedSearch();
    onSearch('', 'All', 'All Locations', 'All', 0, '', false, false);
  };
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="px-4">
        <div className="bg-gradient-to-r from-trust-500/20 to-warm-500/20 backdrop-blur-sm rounded-2xl p-6 border border-trust-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isGuest ? 'Browse Services' : 'Welcome back!'}
          </h2>
          <p className="text-gray-600">
            {isGuest 
              ? 'Explore amazing services from verified providers' 
              : 'Discover amazing services from verified providers'
            }
          </p>
          {isGuest && (
            <div className="mt-3 p-3 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-700">
                <button
                  onClick={onSignUpAsClient}
                  className="font-bold text-safe-600 hover:text-safe-700 underline hover:no-underline transition-colors"
                >
                  Sign up as a client
                </button>
                {" "}to book amazing services and unlock full features
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white/70 backdrop-blur-sm border border-trust-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
              showFilters ? 'text-trust-600 bg-trust-100' : 'text-gray-400 hover:text-trust-500'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 space-y-3 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-trust-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    // Don't auto-search on filter changes - let user click Apply
                  }}
                  className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    // Don't auto-search on filter changes - let user click Apply
                  }}
                  className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => {
                    setAvailability(e.target.value);
                    // Don't auto-search on filter changes - let user click Apply
                  }}
                  className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
                >
                  <option value="All">All Hosts</option>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Away">Away</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(Number(e.target.value));
                    // Don't auto-search on filter changes - let user click Apply
                  }}
                  className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4 Stars & Up</option>
                  <option value={3}>3 Stars & Up</option>
                  <option value={4.5}>4.5 Stars & Up</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Host Profile Created</label>
                <select
                  value={dateCreated}
                  onChange={(e) => {
                    setDateCreated(e.target.value);
                    // Don't auto-search on filter changes - let user click Apply
                  }}
                  className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
                >
                  <option value="">Any Time</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 90 Days">Last 90 Days</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => {
                      setFeaturedOnly(e.target.checked);
                      // Don't auto-search on filter changes - let user click Apply
                    }}
                    className="w-4 h-4 text-trust-600 bg-gray-100 border-gray-300 rounded focus:ring-trust-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Profiles Only</span>
                  <div className="flex items-center text-trust-600">
                    <span className="text-xs bg-trust-100 px-2 py-1 rounded-full">Verified</span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">Show only verified hosts with premium profiles</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-trust-600 to-warm-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-trust-700 hover:to-warm-700 transition-all duration-200 text-sm"
              >
                Apply Filters
              </button>
              {(isSearchActive || query || category !== 'All' || location !== 'All Locations' || availability !== 'All' || minRating > 0 || dateCreated || featuredOnly || availableNow) && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 border border-trust-200 text-trust-600 rounded-lg hover:bg-trust-50 transition-colors text-sm"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Quick Filters & Categories */}
      <div className="px-4 space-y-3">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {/* Available Now toggle */}
          <button
            onClick={handleAvailableNowToggle}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full border font-medium text-sm transition-all duration-200 ${
              availableNow
                ? 'bg-safe-100 border-safe-300 text-safe-700'
                : 'bg-white/70 border-trust-200 text-gray-600 hover:bg-safe-50 hover:border-safe-200'
            }`}
          >
            <Zap className={`w-4 h-4 ${availableNow ? 'text-safe-600' : 'text-gray-400'}`} />
            Available Now
          </button>

          {/* Category quick-picks */}
          {popularCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="flex-shrink-0 bg-white/70 backdrop-blur-sm px-5 py-2.5 rounded-full border border-trust-200 hover:bg-trust-50 hover:border-trust-300 transition-all duration-200"
            >
              <span className="font-medium text-sm text-gray-700">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {isSearchActive ? 'Search Results' : 'Featured'}
          </h3>
          <TrendingUp className="w-5 h-5 text-trust-500" />
        </div>
        {loading ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-gray-600">Loading services...</p>
          </div>
        ) : error ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-red-600">Error loading services: {error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-gray-600">
              {isSearchActive ? 'No services found matching your criteria' : 'No services available'}
            </p>
            {(isSearchActive || query || category !== 'All' || location !== 'All Locations' || availability !== 'All' || minRating > 0 || dateCreated || featuredOnly || availableNow) && (
              <button
                onClick={clearSearch}
                className="mt-3 px-4 py-2 bg-trust-600 text-white rounded-lg hover:bg-trust-700 transition-colors text-sm"
              >
                Clear all filters to see all services
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(isSearchActive ? services : featuredServices).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => onServiceClick(service)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Become a Host Section */}
      {canBecomeHost && userType === 'client' && !isSearchActive && (
        <div className="px-4">
          <div className="bg-gradient-to-r from-safe-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-safe-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to earn as a Host?</h3>
            <p className="text-gray-600 mb-4">
              Share your skills and start earning by hosting your own services
            </p>
            <button
              onClick={onBecomeHost}
              className="bg-gradient-to-r from-safe-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-safe-700 hover:to-emerald-700 transition-all duration-200 font-semibold"
            >
              Become a Host
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      {!isSearchActive && (
        <div className="px-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-trust-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-trust-600">100+</div>
              <div className="text-sm text-gray-600">Verified Hosts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warm-600">4.8</div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                Average Rating
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-trust-600">5+</div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <MapPin className="w-4 h-4 mr-1" />
                Cities
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ClientHome;