import React, { useState } from 'react';
import { Link, Copy, Check } from 'lucide-react';
import { showToast } from '../../../utils/toast';
import { supabase } from '../../../lib/supabase';

interface ProfileShareLinkProps {
  workerId: string;
  currentHandle: string | null;
}

const ProfileShareLink: React.FC<ProfileShareLinkProps> = ({ workerId, currentHandle }) => {
  const [handle, setHandle] = useState(currentHandle || '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = handle ? `https://shub.nz/w/${handle}` : null;

  const handleSave = async () => {
    const trimmed = handle.trim().toLowerCase();
    if (!trimmed) { setError('Handle cannot be empty'); return; }
    if (!/^[a-z0-9-]{3,30}$/.test(trimmed)) {
      setError('Handle must be 3–30 characters: letters, numbers, hyphens only');
      return;
    }
    setError(null);
    setSaving(true);
    const { error: dbError } = await supabase
      .from('worker_profiles')
      .update({ handle: trimmed })
      .eq('user_id', workerId);
    setSaving(false);
    if (dbError) {
      if (dbError.code === '23505') {
        setError('This handle is already taken. Try another.');
      } else {
        setError('Failed to save handle.');
      }
    } else {
      showToast.success('Profile link saved');
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Link className="w-5 h-5 text-trust-600" />
        <h3 className="text-lg font-semibold text-gray-900">Your Profile Link</h3>
      </div>
      <p className="text-sm text-gray-500">
        Choose a unique handle so clients can find and share your profile.
      </p>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 font-mono whitespace-nowrap">shub.nz/w/</span>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="your-name"
          maxLength={30}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent text-sm font-mono"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-trust-600 text-white rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {shareUrl && (
        <div className="flex items-center gap-2 bg-trust-50 border border-trust-200 rounded-xl px-4 py-3">
          <span className="text-sm text-trust-700 font-mono flex-1 truncate">{shareUrl}</span>
          <button
            onClick={handleCopy}
            aria-label="Copy link"
            className="p-1.5 hover:bg-trust-100 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-safe-600" />
            ) : (
              <Copy className="w-4 h-4 text-trust-600" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileShareLink;
