import React from 'react';
import { Shield, Users, Flag, UserCheck, UserX, LayoutDashboard } from 'lucide-react';
import type { AdminStats as AdminStatsType } from '../services/admin';

interface AdminStatsProps {
  stats: AdminStatsType | null;
  loading?: boolean;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  urgent?: boolean;
}> = ({ icon, label, value, color, urgent }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border ${urgent && Number(value) > 0 ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);

const AdminStats: React.FC<AdminStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
              <div>
                <div className="h-6 w-12 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        icon={<Shield className="w-5 h-5 text-white" />}
        label="Pending Verifications"
        value={stats.pendingVerifications}
        color="bg-amber-500"
        urgent
      />
      <StatCard
        icon={<UserCheck className="w-5 h-5 text-white" />}
        label="Unpublished Profiles"
        value={stats.unpublishedProfiles}
        color="bg-blue-500"
        urgent
      />
      <StatCard
        icon={<Flag className="w-5 h-5 text-white" />}
        label="Open Reports"
        value={stats.openReports}
        color="bg-red-500"
        urgent
      />
      <StatCard
        icon={<Users className="w-5 h-5 text-white" />}
        label="Total Users"
        value={stats.totalUsers}
        color="bg-gray-500"
      />
      <StatCard
        icon={<UserCheck className="w-5 h-5 text-white" />}
        label="Workers"
        value={stats.totalWorkers}
        color="bg-trust-500"
      />
      <StatCard
        icon={<UserX className="w-5 h-5 text-white" />}
        label="Clients"
        value={stats.totalClients}
        color="bg-warm-500"
      />
    </div>
  );
};

export default AdminStats;
