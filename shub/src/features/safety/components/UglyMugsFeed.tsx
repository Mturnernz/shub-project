import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Calendar, MapPin, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { getRegionAlerts, type UglyMugsAlert, INCIDENT_TYPES } from '../services/ugly-mugs';

interface UglyMugsFeedProps {
  region: string;
  compact?: boolean;
}

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', text: 'text-red-800' },
  danger: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-800' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', text: 'text-yellow-800' },
};

const UglyMugsFeed: React.FC<UglyMugsFeedProps> = ({ region, compact = false }) => {
  const [alerts, setAlerts] = useState<Omit<UglyMugsAlert, 'reporter_id'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAlerts();
  }, [region]);

  const loadAlerts = async () => {
    setLoading(true);
    const result = await getRegionAlerts(region, 20);
    if (result.success) {
      setAlerts(result.alerts);
    }
    setLoading(false);
  };

  const toggleAlertExpand = (alertId: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-60 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-48" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-safe-50 border border-safe-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-safe-600" />
          <div>
            <p className="text-sm font-semibold text-safe-800">Community Safety</p>
            <p className="text-xs text-safe-600">No active safety alerts in your area.</p>
          </div>
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Safety Alerts</p>
            <p className="text-xs text-gray-500">
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''} in {region || 'your area'}
            </p>
          </div>
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold animate-pulse">
              {criticalCount} critical
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
          {alerts.map((alert) => {
            const styles = SEVERITY_STYLES[alert.severity];
            const typeInfo = INCIDENT_TYPES.find((t) => t.value === alert.incident_type);
            const isExpanded = expandedAlerts.has(alert.id);

            return (
              <div key={alert.id} className={`${styles.bg} border ${styles.border} rounded-xl overflow-hidden`}>
                <button
                  onClick={() => toggleAlertExpand(alert.id)}
                  className="w-full flex items-start justify-between p-3 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles.badge}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`text-xs font-medium ${styles.text}`}>
                        {typeInfo?.label || alert.incident_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(alert.incident_date).toLocaleDateString('en-NZ', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {alert.location_area && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location_area}
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-gray-200/50 pt-2">
                    <p className="text-sm text-gray-700">{alert.description}</p>

                    {alert.client_description && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Client description:</p>
                        <p className="text-sm text-gray-700">{alert.client_description}</p>
                      </div>
                    )}

                    {alert.physical_description && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Physical description:</p>
                        <p className="text-sm text-gray-700">{alert.physical_description}</p>
                      </div>
                    )}

                    {alert.vehicle_description && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Vehicle:</p>
                        <p className="text-sm text-gray-700">{alert.vehicle_description}</p>
                      </div>
                    )}

                    {alert.contact_method && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Contact method:</p>
                        <p className="text-sm text-gray-700">{alert.contact_method}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 pt-1">
                      Reported anonymously • {new Date(alert.created_at).toLocaleDateString('en-NZ')}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-xs text-gray-400 text-center pt-1">
            Alerts are anonymous and shared to protect providers.
          </p>
        </div>
      )}
    </div>
  );
};

export default UglyMugsFeed;
