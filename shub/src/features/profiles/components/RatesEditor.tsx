import React, { useState } from 'react';
import { DollarSign, Info } from 'lucide-react';

interface RatesEditorProps {
  hourlyRateText: string;
  onRateUpdate: (hourlyRateText: string) => void;
}

const RatesEditor: React.FC<RatesEditorProps> = ({ hourlyRateText, onRateUpdate }) => {
  const [rateText, setRateText] = useState(hourlyRateText);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (rateText.trim() === hourlyRateText) return;
    setSaving(true);
    try {
      await onRateUpdate(rateText.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = rateText.trim() !== hourlyRateText;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Rate Information</h3>
        <p className="text-sm text-gray-500">
          Describe your rates in plain text. Shub does not process payments — this is for information only.
        </p>
      </div>

      <div className="bg-trust-50 border border-trust-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-trust-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-trust-800">
          <p className="font-medium mb-1">Writing your rates</p>
          <ul className="list-disc list-inside space-y-0.5 text-trust-700">
            <li>Use plain language — e.g. "$200/hr, $350/2hrs"</li>
            <li>You can mention outcall vs incall pricing</li>
            <li>Avoid references to specific sexual acts or unsafe practices</li>
            <li>Clients contact you directly to discuss bookings</li>
          </ul>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rate description
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <textarea
            value={rateText}
            onChange={(e) => setRateText(e.target.value)}
            placeholder="e.g. $200/hr, $350 for 2 hrs. Incall and outcall available. Contact me to discuss."
            rows={4}
            maxLength={300}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{rateText.length}/300 characters</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className="w-full bg-gradient-to-r from-trust-600 to-warm-600 text-white py-3 rounded-xl hover:from-trust-700 hover:to-warm-700 transition-all duration-200 disabled:opacity-50 font-semibold"
      >
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Rate Information'}
      </button>
    </div>
  );
};

export default RatesEditor;
