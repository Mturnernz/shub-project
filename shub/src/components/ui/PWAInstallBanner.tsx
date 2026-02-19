import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const PWAInstallBanner: React.FC = () => {
  const { canInstall, install, dismiss } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <div className="mx-4 mb-3 bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 bg-trust-600 rounded-xl flex items-center justify-center flex-shrink-0">
        <Download className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Add Shub to home screen</p>
        <p className="text-xs text-gray-500">Faster access, works offline.</p>
      </div>
      <button
        onClick={install}
        className="px-3 py-1.5 bg-trust-600 text-white rounded-lg text-xs font-medium hover:bg-trust-700 transition-colors flex-shrink-0"
      >
        Install
      </button>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PWAInstallBanner;
