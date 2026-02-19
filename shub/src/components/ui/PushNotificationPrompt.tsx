import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface PushNotificationPromptProps {
  userId: string | null;
}

const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({ userId }) => {
  const { canPrompt, subscribe, subscribing, markDeclined } = usePushNotifications(userId);
  const [dismissed, setDismissed] = useState(false);

  if (!canPrompt || dismissed) return null;

  const handleEnable = async () => {
    await subscribe();
    setDismissed(true);
  };

  const handleDecline = () => {
    markDeclined();
    setDismissed(true);
  };

  return (
    <div className="mx-4 mb-3 bg-trust-50 border border-trust-200 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 bg-trust-600 rounded-full flex items-center justify-center flex-shrink-0">
        <Bell className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-trust-900">Get instant alerts</p>
        <p className="text-xs text-trust-700 mt-0.5">Know the moment clients book or message you.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleEnable}
            disabled={subscribing}
            className="px-3 py-1.5 bg-trust-600 text-white rounded-lg text-xs font-medium hover:bg-trust-700 transition-colors disabled:opacity-50"
          >
            {subscribing ? 'Enabling...' : 'Enable Notifications'}
          </button>
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 text-trust-600 rounded-lg text-xs font-medium hover:bg-trust-100 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
      <button
        onClick={handleDecline}
        aria-label="Dismiss"
        className="text-trust-400 hover:text-trust-600 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PushNotificationPrompt;
