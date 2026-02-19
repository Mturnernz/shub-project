import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, Calendar, MessageSquare, BarChart2 } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useWorkerAnalytics } from '../../features/analytics/hooks/useWorkerAnalytics';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { analytics, loading } = useWorkerAnalytics(userProfile?.id || null);

  if (!userProfile) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <BarChart2 className="w-6 h-6 text-trust-600" />
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-500" />
        </div>
      ) : (
        <>
          {/* Profile Views */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-trust-600" />
              <h2 className="font-semibold text-gray-900">Profile Views</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '7 days', value: analytics.views7d },
                { label: '30 days', value: analytics.views30d },
                { label: '90 days', value: analytics.views90d },
              ].map(({ label, value }) => (
                <div key={label} className="bg-trust-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-trust-700">{value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-trust-600" />
              <h2 className="font-semibold text-gray-900">Bookings (Last 30 Days)</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">{analytics.bookingRequests30d}</p>
                <p className="text-xs text-gray-500 mt-0.5">Requests</p>
              </div>
              <div className="bg-safe-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-safe-700">{analytics.confirmedBookings30d}</p>
                <p className="text-xs text-gray-500 mt-0.5">Confirmed</p>
              </div>
              <div className="bg-gold-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gold-700">{analytics.conversionRate}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Conversion</p>
              </div>
            </div>
            {analytics.bookingRequests30d === 0 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                No booking requests yet. Make sure your profile is published and complete.
              </p>
            )}
          </div>

          {/* Traffic Sources */}
          {analytics.topSources.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-trust-600" />
                <h2 className="font-semibold text-gray-900">Traffic Sources</h2>
              </div>
              <div className="space-y-3">
                {analytics.topSources.map(({ source, pct }) => (
                  <div key={source} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 capitalize w-20 flex-shrink-0">{source}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-trust-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-trust-50 border border-trust-200 rounded-2xl p-4 text-sm text-trust-800">
            <p className="font-medium mb-1">Tips to improve your stats</p>
            <ul className="list-disc list-inside space-y-1 text-trust-700 text-xs">
              <li>Add more photos — profiles with 6+ photos get 3× more views</li>
              <li>Keep your availability status up to date</li>
              <li>Share your profile link on social media to drive direct traffic</li>
              <li>Respond to booking requests within 2 hours for higher conversion</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
