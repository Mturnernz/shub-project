import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, ChevronDown, ChevronUp, User, Calendar, Filter } from 'lucide-react';
import { getAuditLog, type AuditLogEntry } from '../services/admin';

interface AuditLogViewerProps {
  limit?: number;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ limit = 50 }) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchAuditLog = async () => {
    setLoading(true);
    const { data, count, error } = await getAuditLog({
      action: filters.action || undefined,
      targetType: filters.targetType || undefined,
      limit,
      offset: page * limit,
    });
    if (data) {
      setEntries(data);
      setTotalCount(count);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuditLog();
  }, [page, filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('approved') || action.includes('published')) {
      return 'bg-green-100 text-green-800';
    }
    if (action.includes('rejected') || action.includes('unpublished')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.includes('submitted') || action.includes('created')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const uniqueActions = [...new Set(entries.map((e) => e.action))];
  const uniqueTargetTypes = [...new Set(entries.map((e) => e.target_type).filter(Boolean))];

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-trust-600" />
          <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
            {totalCount} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              showFilters ? 'bg-trust-100 text-trust-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={fetchAuditLog}
            className="p-2 text-gray-600 hover:text-trust-600 hover:bg-trust-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => {
                setFilters({ ...filters, action: e.target.value });
                setPage(0);
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {formatActionName(action)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Target Type</label>
            <select
              value={filters.targetType}
              onChange={(e) => {
                setFilters({ ...filters, targetType: e.target.value });
                setPage(0);
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <option value="">All Types</option>
              {uniqueTargetTypes.map((type) => (
                <option key={type} value={type || ''}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {(filters.action || filters.targetType) && (
            <button
              onClick={() => {
                setFilters({ action: '', targetType: '' });
                setPage(0);
              }}
              className="self-end text-sm text-trust-600 hover:text-trust-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading audit log...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No audit log entries found</p>
        </div>
      )}

      {/* Audit log entries */}
      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(entry.action)}`}>
                    {formatActionName(entry.action)}
                  </span>
                  <div className="text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700">
                        {entry.admin?.display_name || 'Unknown Admin'}
                      </span>
                      {entry.target_type && (
                        <>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-600">{entry.target_type}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(entry.created_at)}
                  </span>
                  {expandedEntry === entry.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {expandedEntry === entry.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Details</h4>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  </div>
                  {entry.target_id && (
                    <div className="mt-2 text-xs text-gray-500">
                      Target ID: <code className="bg-gray-100 px-1 rounded">{entry.target_id}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            Showing {page * limit + 1}-{Math.min((page + 1) * limit, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
