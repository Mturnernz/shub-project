import React, { useState } from 'react';
import { Search, Filter, MapPin, ArrowLeft } from 'lucide-react';
import { categories, locations } from '../../../data/mockData';

interface SearchBarProps {
  onSearch: (query: string, category: string, location: string, availability?: string, minRating?: number, dateCreated?: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onBack, showBackButton = false }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All Locations');
  const [availability, setAvailability] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [dateCreated, setDateCreated] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
    onSearch(query, category, location, availability, minRating, dateFilter);
  };

  return (
    <div className="px-4 py-4 space-y-3">
      {showBackButton && onBack && (
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/70 hover:bg-white transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Search Services</h2>
        </div>
      )}
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
        <div className="space-y-3 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-trust-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500"
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
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500"
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4 Stars & Up</option>
              <option value={3}>3 Stars & Up</option>
              <option value={4.5}>4.5 Stars & Up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Host Profile Created</label>
            <select
              value={dateCreated}
              onChange={(e) => setDateCreated(e.target.value)}
              className="w-full px-4 py-2 border border-trust-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500"
            >
              <option value="">Any Time</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-gradient-to-r from-trust-600 to-warm-600 text-white py-3 rounded-lg font-semibold hover:from-trust-700 hover:to-warm-700 transition-all duration-200"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;