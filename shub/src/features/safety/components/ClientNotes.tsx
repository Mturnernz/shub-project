import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, ShieldAlert, Plus, Tag, Save, ChevronDown, ChevronUp, User } from 'lucide-react';
import {
  createClientNote,
  getClientNotes,
  type ClientNote,
  CLIENT_NOTE_TAGS,
} from '../services/client-notes';
import { useAuthStore } from '../../auth/stores/auth.store';

interface ClientNotesProps {
  clientId: string;
  clientName: string;
  bookingId?: string;
  compact?: boolean;
}

const SAFETY_FLAGS = [
  { value: 'none' as const, label: 'No flag', color: 'bg-gray-100 text-gray-700', icon: null },
  { value: 'caution' as const, label: 'Caution', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  { value: 'avoid' as const, label: 'Avoid', color: 'bg-red-100 text-red-700', icon: ShieldAlert },
];

const ClientNotes: React.FC<ClientNotesProps> = ({ clientId, clientName, bookingId, compact = false }) => {
  const { userProfile } = useAuthStore();
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  // Form state
  const [noteContent, setNoteContent] = useState('');
  const [safetyFlag, setSafetyFlag] = useState<'none' | 'caution' | 'avoid'>('none');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    loadNotes();
  }, [userProfile, clientId]);

  const loadNotes = async () => {
    if (!userProfile) return;
    setLoading(true);
    const { notes: fetchedNotes } = await getClientNotes(userProfile.id, clientId);
    setNotes(fetchedNotes);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!userProfile || !noteContent.trim()) return;

    setSaving(true);
    setError(null);

    const result = await createClientNote(
      userProfile.id,
      clientId,
      noteContent.trim(),
      safetyFlag,
      selectedTags,
      bookingId
    );

    if (result.success && result.note) {
      setNotes([result.note, ...notes]);
      setNoteContent('');
      setSafetyFlag('none');
      setSelectedTags([]);
      setShowForm(false);
    } else {
      setError(result.error || 'Failed to save note');
    }

    setSaving(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Get the highest safety flag across all notes
  const highestFlag = notes.reduce<'none' | 'caution' | 'avoid'>((max, n) => {
    if (n.safety_flag === 'avoid') return 'avoid';
    if (n.safety_flag === 'caution' && max !== 'avoid') return 'caution';
    return max;
  }, 'none');

  const flagConfig = SAFETY_FLAGS.find((f) => f.value === highestFlag) || SAFETY_FLAGS[0];

  if (!userProfile || userProfile.role !== 'worker') return null;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-trust-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-trust-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">
              Private Notes — {clientName}
            </p>
            <p className="text-xs text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
          </div>
          {highestFlag !== 'none' && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${flagConfig.color}`}>
              {flagConfig.label}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Add note button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-trust-300 text-trust-600 rounded-xl text-sm font-medium hover:bg-trust-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          )}

          {/* New note form */}
          {showForm && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write a private note about this client..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:ring-2 focus:ring-trust-500 focus:border-transparent"
              />

              {/* Safety flag selector */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Safety flag:</p>
                <div className="flex gap-2">
                  {SAFETY_FLAGS.map((flag) => (
                    <button
                      key={flag.value}
                      onClick={() => setSafetyFlag(flag.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        safetyFlag === flag.value
                          ? `${flag.color} ring-2 ring-offset-1 ring-gray-400`
                          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {flag.icon && <flag.icon className="w-3 h-3" />}
                      {flag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CLIENT_NOTE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-trust-100 text-trust-700 ring-1 ring-trust-300'
                          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setNoteContent('');
                    setSafetyFlag('none');
                    setSelectedTags([]);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!noteContent.trim() || saving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-trust-600 text-white rounded-lg text-sm font-semibold hover:bg-trust-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {/* Notes list */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-3 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-2">
              {notes.map((note) => {
                const noteFlagConfig = SAFETY_FLAGS.find((f) => f.value === note.safety_flag);
                return (
                  <div key={note.id} className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {note.safety_flag !== 'none' && noteFlagConfig && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${noteFlagConfig.color}`}>
                            {noteFlagConfig.label}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(note.created_at).toLocaleDateString('en-NZ', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-4">
              No notes yet. Add one after your booking.
            </p>
          )}

          <p className="text-xs text-gray-400 text-center">
            Notes are private and only visible to you.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientNotes;
