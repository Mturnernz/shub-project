import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Flag, FileText, ArrowRight, LayoutDashboard } from 'lucide-react';
import AdminStats from '../../../features/admin/components/AdminStats';
import { getAdminStats, type AdminStats as AdminStatsType } from '../../../features/admin/services/admin';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await getAdminStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Verification Queue',
      description: 'Review pending ID verifications',
      icon: Shield,
      path: '/admin/verifications',
      count: stats?.pendingVerifications,
      color: 'bg-amber-500',
      urgent: (stats?.pendingVerifications || 0) > 0,
    },
    {
      title: 'Profile Publishing',
      description: 'Publish verified worker profiles',
      icon: Users,
      path: '/admin/profiles',
      count: stats?.unpublishedProfiles,
      color: 'bg-blue-500',
      urgent: (stats?.unpublishedProfiles || 0) > 0,
    },
    {
      title: 'Moderation Queue',
      description: 'Review user reports and flags',
      icon: Flag,
      path: '/admin/reports',
      count: stats?.openReports,
      color: 'bg-red-500',
      urgent: (stats?.openReports || 0) > 0,
    },
    {
      title: 'Audit Log',
      description: 'View all admin actions',
      icon: FileText,
      path: '/admin/audit-log',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-trust-500 to-warm-500 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage verifications, profiles, and reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <AdminStats stats={stats} loading={loading} />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className={`bg-white rounded-xl p-5 border transition-all hover:shadow-md hover:border-trust-300 ${
                  action.urgent ? 'border-amber-300 shadow-sm' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  {action.count !== undefined && action.count > 0 && (
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      action.urgent ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {action.count}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                <div className="flex items-center text-trust-600 text-sm font-medium">
                  Go to {action.title.toLowerCase()}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity placeholder */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600 text-center">
              Recent admin activity will appear here.{' '}
              <Link to="/admin/audit-log" className="text-trust-600 hover:text-trust-700">
                View full audit log
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
