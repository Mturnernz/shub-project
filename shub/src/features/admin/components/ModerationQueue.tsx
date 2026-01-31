import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, MessageSquare, Flag, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { getReports, updateReportStatus, type ReportDetails, type ReportCategory } from '../../safety/services/reporting';

interface ModerationQueueProps {
  adminId: string;
}

interface FilterOptions {
  status: 'all' | 'open' | 'in_review' | 'resolved' | 'dismissed';
  category: 'all' | ReportCategory;
  urgency: 'all' | 'low' | 'medium' | 'high' | 'emergency';
}

const ModerationQueue: React.FC<ModerationQueueProps> = ({ adminId }) => {
  const [reports, setReports] = useState<ReportDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDetails | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'open',
    category: 'all',
    urgency: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: reportsError } = await getReports({
        status: filters.status === 'all' ? undefined : filters.status,
        category: filters.category === 'all' ? undefined : filters.category,
        limit: 50
      });

      if (reportsError) throw reportsError;

      setReports(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, status: 'in_review' | 'resolved' | 'dismissed', notes?: string) => {
    try {
      const { success, error } = await updateReportStatus(reportId, status, adminId, notes);

      if (success) {
        // Update local state
        setReports(prev => prev.map(report =>
          report.id === reportId
            ? { ...report, status, updated_at: new Date().toISOString() }
            : report
        ));

        if (selectedReport?.id === reportId) {
          setSelectedReport(prev => prev ? { ...prev, status } : null);
        }
      } else {
        throw new Error(error || 'Failed to update report status');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update report status');
    }
  };

  const getUrgencyBadge = (category: string) => {
    if (['underage_concern', 'threatening_behavior'].includes(category)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          URGENT
        </span>
      );
    }
    if (['unsafe_services', 'harassment'].includes(category)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          HIGH
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        NORMAL
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_review':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Flag className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      unsafe_services: 'Unsafe Services',
      underage_concern: 'Underage Concern',
      harassment: 'Harassment',
      threatening_behavior: 'Threats',
      fake_profile: 'Fake Profile',
      payment_fraud: 'Payment Fraud',
      privacy_violation: 'Privacy Violation',
      spam_scam: 'Spam/Scam',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const urgentReports = reports.filter(r =>
    ['underage_concern', 'threatening_behavior'].includes(r.reason)
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-gray-600">
            {reports.length} reports • {urgentReports.length} urgent
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Urgent Reports Alert */}
      {urgentReports.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-900">
              {urgentReports.length} Urgent Report{urgentReports.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <p className="text-sm text-red-800">
            These reports require immediate attention due to safety concerns.
          </p>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="unsafe_services">Unsafe Services</option>
                <option value="underage_concern">Underage Concern</option>
                <option value="harassment">Harassment</option>
                <option value="threatening_behavior">Threats</option>
                <option value="fake_profile">Fake Profile</option>
                <option value="payment_fraud">Payment Fraud</option>
                <option value="privacy_violation">Privacy Violation</option>
                <option value="spam_scam">Spam/Scam</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.urgency}
                onChange={(e) => setFilters({ ...filters, urgency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Priorities</option>
                <option value="emergency">Emergency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {filters.status === 'open'
                ? 'All caught up! No pending reports to review.'
                : 'No reports match your current filters.'
              }
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className={`
                bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer
                ${['underage_concern', 'threatening_behavior'].includes(report.reason)
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
                }
              `}
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(report.status)}
                    <span className="font-medium text-gray-900">
                      {getCategoryLabel(report.reason)}
                    </span>
                    {getUrgencyBadge(report.reason)}
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>
                        Reported by {report.reporter?.display_name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(report.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {report.status === 'open' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(report.id, 'in_review');
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Review
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(report.id, 'dismissed', 'No action required');
                        }}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Dismiss
                      </button>
                    </>
                  )}

                  {report.status === 'in_review' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(report.id, 'resolved', 'Issue resolved');
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Report Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-medium">{getCategoryLabel(selectedReport.reason)}</span>
                  {getUrgencyBadge(selectedReport.reason)}
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedReport.status)}
                    <span className="capitalize">{selectedReport.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Description:</h4>
                  <p className="text-gray-700">{selectedReport.description}</p>
                </div>
              </div>

              {/* Reporter & Target Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Reporter</h4>
                  <p className="text-blue-800">
                    {selectedReport.reporter?.display_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-blue-600">
                    Role: {selectedReport.reporter?.role || 'Unknown'}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Target</h4>
                  <p className="text-orange-800">
                    {selectedReport.target_user?.display_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-orange-600">
                    Type: {selectedReport.target_type} •
                    Role: {selectedReport.target_user?.role || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Target Content */}
              {selectedReport.target_content && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Reported Content:</h4>
                  <div className="text-sm text-gray-700">
                    {selectedReport.target_type === 'message' && (
                      <p>"{selectedReport.target_content.content}"</p>
                    )}
                    {selectedReport.target_type === 'booking' && (
                      <div>
                        <p>Booking: {selectedReport.target_content.start_time} - {selectedReport.target_content.end_time}</p>
                        <p>Status: {selectedReport.target_content.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedReport.status === 'open' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, 'in_review');
                        setSelectedReport(null);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Review
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, 'dismissed', 'No action required');
                        setSelectedReport(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Dismiss
                    </button>
                  </>
                )}

                {selectedReport.status === 'in_review' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, 'resolved', 'Issue resolved after investigation');
                        setSelectedReport(null);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, 'dismissed', 'No violation found');
                        setSelectedReport(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Dismiss
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;