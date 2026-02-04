import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ModerationQueue from '../../../features/admin/components/ModerationQueue';
import { useAuthStore } from '../../../features/auth/stores/auth.store';

const ModerationQueuePage: React.FC = () => {
  const { userProfile } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-trust-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-gray-600 text-sm">Review user reports and flagged content</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <ModerationQueue adminId={userProfile?.id || ''} />
      </div>
    </div>
  );
};

export default ModerationQueuePage;
