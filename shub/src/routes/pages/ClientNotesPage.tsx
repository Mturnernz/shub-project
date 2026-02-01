import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, ShieldAlert, AlertTriangle, User, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { getWorkerClientNotes, type ClientNoteSummary } from '../../features/safety/services/client-notes';

const ClientNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const [summaries, setSummaries] = useState<ClientNoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'caution' | 'avoid'>('all');

  useEffect(() => {
    if (!userProfile) return;
    loadNotes();
  }, [userProfile]);

  const loadNotes = async () => {
    if (!userProfile) return;
    setLoading(true);
    const result = await getWorkerClientNotes(userProfile.id);
    if (result.success) {
      setSummaries(result.summaries);
    }
    setLoading(false);
  };

  const filteredSummaries = summaries.filter((s) => {
    if (filter === 'all') return true;
    return s.latest_safety_flag === filter;
  });

  const flagCounts = {
    all: summaries.length,
    caution: summaries.filter((s) => s.latest_safety_flag === 'caution').length,
    avoid: summaries.filter((s) => s.latest_safety_flag === 'avoid').length,
  };

  if (!userProfile || userProfile.type !== 'host') {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">Client notes are only available for providers.</p>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-trust-500 text-white rounded-lg">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/safety')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client Notes</h1>
          <p className="text-sm text-gray-500">
            {summaries.length} client{summaries.length !== 1 ? 's' : ''} with notes
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all' as const, label: 'All', count: flagCounts.all },
          { key: 'caution' as const, label: 'Caution', count: flagCounts.caution, color: 'text-amber-600' },
          { key: 'avoid' as const, label: 'Avoid', count: flagCounts.avoid, color: 'text-red-600' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-trust-100 text-trust-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredSummaries.length > 0 ? (
        <div className="space-y-2">
          {filteredSummaries.map((summary) => (
            <div
              key={summary.client_id}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-trust-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-trust-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{summary.client_name}</p>
                    {summary.latest_safety_flag === 'caution' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Caution
                      </span>
                    )}
                    {summary.latest_safety_flag === 'avoid' && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Avoid
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {summary.note_count} note{summary.note_count !== 1 ? 's' : ''}
                    {summary.latest_note && ` — "${summary.latest_note.substring(0, 50)}${summary.latest_note.length > 50 ? '...' : ''}"`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {filter === 'all'
              ? 'No client notes yet. Notes help you remember details about past clients.'
              : `No clients flagged as "${filter}".`}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        All client notes are private and only visible to you.
      </p>
    </div>
  );
};

export default ClientNotesPage;
