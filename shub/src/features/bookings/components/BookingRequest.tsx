import React, { useState } from 'react';
import { Calendar, Clock, X, AlertTriangle, DollarSign } from 'lucide-react';
import type { BookingRequest as BookingRequestType } from '../services/bookings';

interface BookingRequestProps {
  workerId: string;
  clientId: string;
  workerName?: string;
  onSubmit: (request: BookingRequestType) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BookingRequest: React.FC<BookingRequestProps> = ({
  workerId,
  clientId,
  workerName,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Minimum 2 hours from now
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !startTime || !endTime) {
      setError('Please fill in all required fields');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);

    // Validation
    if (startDateTime <= new Date()) {
      setError('Booking must be at least 2 hours from now');
      return;
    }

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return;
    }

    const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    if (durationHours < 1) {
      setError('Booking must be at least 1 hour long');
      return;
    }

    if (durationHours > 8) {
      setError('Booking cannot exceed 8 hours');
      return;
    }

    const request: BookingRequestType = {
      worker_id: workerId,
      client_id: clientId,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      message: message.trim() || undefined
    };

    const result = await onSubmit(request);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const formatDuration = () => {
    if (!startTime || !endTime) return '';

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    if (end <= start) return '';

    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Request Booking
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {workerName && (
          <div className="mb-4 p-3 bg-trust-50 rounded-lg">
            <p className="text-sm text-trust-700">
              Booking with <span className="font-medium">{workerName}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Duration Display */}
          {formatDuration() && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              Duration: <span className="font-medium">{formatDuration()}</span>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any specific requests or notes..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          {/* Payment Notice */}
          <div className="p-3 bg-trust-50 border border-trust-200 rounded-lg">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-trust-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-trust-800 font-medium">Payment arranged directly</p>
                <p className="text-xs text-trust-700 mt-0.5">
                  Payment is arranged directly between you and the provider via messaging after your booking is confirmed. Shub does not process payments.
                </p>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Safety Reminder:</strong> All services must follow safe practices.
              Condom use is mandatory for all interactions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-trust-600 text-white rounded-lg hover:bg-trust-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingRequest;