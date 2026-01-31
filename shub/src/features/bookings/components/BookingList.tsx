import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown } from 'lucide-react';
import BookingCard from './BookingCard';
import type { BookingWithProfiles } from '../services/bookings';

interface BookingListProps {
  bookings: BookingWithProfiles[];
  userRole: 'worker' | 'client';
  loading?: boolean;
  title?: string;
  emptyMessage?: string;
  showFilters?: boolean;
  onUpdateStatus?: (bookingId: string, status: 'confirmed' | 'cancelled') => void;
  onViewDetails?: (booking: BookingWithProfiles) => void;
  onOpenChat?: (booking: BookingWithProfiles) => void;
}

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const BookingList: React.FC<BookingListProps> = ({
  bookings,
  userRole,
  loading = false,
  title = 'Bookings',
  emptyMessage = 'No bookings found',
  showFilters = true,
  onUpdateStatus,
  onViewDetails,
  onOpenChat
}) => {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  const getStatusCounts = () => {
    const counts = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    bookings.forEach(booking => {
      counts[booking.status as keyof typeof counts]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const filterOptions: Array<{ value: FilterStatus; label: string; count: number }> = [
    { value: 'all', label: 'All Bookings', count: statusCounts.all },
    { value: 'pending', label: 'Pending', count: statusCounts.pending },
    { value: 'confirmed', label: userRole === 'client' ? 'Accepted' : 'Confirmed', count: statusCounts.confirmed },
    { value: 'completed', label: 'Completed', count: statusCounts.completed },
    { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-40"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

        {showFilters && bookings.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              {filterOptions.find(opt => opt.value === statusFilter)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showFiltersDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowFiltersDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      statusFilter === option.value ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-xs text-gray-500">({option.count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'all' ? emptyMessage : `No ${statusFilter} bookings`}
          </h3>
          <p className="text-gray-600">
            {statusFilter === 'all'
              ? userRole === 'client'
                ? 'Start browsing worker profiles to make your first booking!'
                : 'Bookings will appear here when clients request your services.'
              : `You don't have any ${statusFilter} bookings at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              userRole={userRole}
              onUpdateStatus={onUpdateStatus}
              onViewDetails={onViewDetails}
              onOpenChat={onOpenChat}
            />
          ))}
        </div>
      )}

      {/* Load More Button (placeholder for pagination) */}
      {filteredBookings.length > 0 && filteredBookings.length % 10 === 0 && (
        <div className="text-center pt-4">
          <button className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors">
            Load More Bookings
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingList;