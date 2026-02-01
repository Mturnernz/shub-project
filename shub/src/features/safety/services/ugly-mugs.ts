import { supabase } from '../../../lib/supabase';

export interface UglyMugsAlert {
  id: string;
  reporter_id: string;
  client_description: string;
  incident_type: UglyMugsIncidentType;
  severity: 'warning' | 'danger' | 'critical';
  incident_date: string;
  location_area: string; // General area, not exact address
  description: string;
  physical_description?: string;
  vehicle_description?: string;
  contact_method?: string; // How the client made contact (platform, phone, etc.)
  police_report_filed: boolean;
  police_report_number?: string;
  status: 'active' | 'resolved' | 'retracted';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export type UglyMugsIncidentType =
  | 'violence'
  | 'sexual_assault'
  | 'robbery'
  | 'threatening_behaviour'
  | 'boundary_violation'
  | 'stealthing'
  | 'refusal_to_pay'
  | 'stalking'
  | 'intoxicated_dangerous'
  | 'other';

export const INCIDENT_TYPES: { value: UglyMugsIncidentType; label: string; severity: 'warning' | 'danger' | 'critical' }[] = [
  { value: 'violence', label: 'Violence / Physical assault', severity: 'critical' },
  { value: 'sexual_assault', label: 'Sexual assault', severity: 'critical' },
  { value: 'robbery', label: 'Robbery / Theft', severity: 'danger' },
  { value: 'threatening_behaviour', label: 'Threatening behaviour', severity: 'danger' },
  { value: 'stealthing', label: 'Stealthing (condom removal)', severity: 'critical' },
  { value: 'boundary_violation', label: 'Boundary violation', severity: 'danger' },
  { value: 'stalking', label: 'Stalking / Unwanted contact', severity: 'danger' },
  { value: 'refusal_to_pay', label: 'Refusal to pay', severity: 'warning' },
  { value: 'intoxicated_dangerous', label: 'Dangerously intoxicated', severity: 'warning' },
  { value: 'other', label: 'Other concern', severity: 'warning' },
];

/**
 * Submit an Ugly Mugs alert
 * Shared anonymously with other providers in the area
 */
export const submitUglyMugsAlert = async (
  reporterId: string,
  alert: Omit<UglyMugsAlert, 'id' | 'reporter_id' | 'status' | 'verified' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; alertId?: string; error?: string }> => {
  try {
    const alertId = `ugm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fullAlert: UglyMugsAlert = {
      ...alert,
      id: alertId,
      reporter_id: reporterId,
      status: 'active',
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store as structured audit record
    const { error } = await supabase.from('admin_audit').insert({
      admin_id: reporterId,
      action: 'ugly_mugs_alert_submitted',
      target_type: 'safety_alert',
      target_id: alertId,
      details: {
        alert: fullAlert,
        auto_severity: INCIDENT_TYPES.find((t) => t.value === alert.incident_type)?.severity || 'warning',
      },
    });

    if (error) throw error;

    // Auto-escalate critical incidents
    if (alert.severity === 'critical' || ['violence', 'sexual_assault', 'stealthing'].includes(alert.incident_type)) {
      await supabase.from('admin_audit').insert({
        admin_id: 'system',
        action: 'ugly_mugs_escalated',
        target_type: 'safety_alert',
        target_id: alertId,
        details: {
          reason: 'Critical severity incident auto-escalated',
          incident_type: alert.incident_type,
          escalated_at: new Date().toISOString(),
        },
      });
    }

    return { success: true, alertId };
  } catch (error: any) {
    console.error('Error submitting Ugly Mugs alert:', error);
    return { success: false, error: error.message || 'Failed to submit alert' };
  }
};

/**
 * Get active Ugly Mugs alerts for a region
 * Alerts are anonymised — reporter identity is never exposed
 */
export const getRegionAlerts = async (
  region: string,
  limit: number = 20
): Promise<{ success: boolean; alerts: Omit<UglyMugsAlert, 'reporter_id'>[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('admin_audit')
      .select('details, created_at')
      .eq('action', 'ugly_mugs_alert_submitted')
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Fetch extra to filter by region

    if (error) throw error;

    const alerts: Omit<UglyMugsAlert, 'reporter_id'>[] = (data || [])
      .map((row) => {
        const alert = (row.details as any)?.alert as UglyMugsAlert;
        if (!alert || alert.status !== 'active') return null;
        // Filter by region (case-insensitive partial match)
        if (region && !alert.location_area.toLowerCase().includes(region.toLowerCase())) return null;
        // Remove reporter identity
        const { reporter_id, ...anonymisedAlert } = alert;
        return anonymisedAlert;
      })
      .filter(Boolean)
      .slice(0, limit) as Omit<UglyMugsAlert, 'reporter_id'>[];

    return { success: true, alerts };
  } catch (error: any) {
    console.error('Error fetching region alerts:', error);
    return { success: false, alerts: [], error: error.message };
  }
};

/**
 * Get alert count for a region (for badge display)
 */
export const getRegionAlertCount = async (region: string): Promise<number> => {
  try {
    const result = await getRegionAlerts(region, 100);
    return result.alerts.length;
  } catch {
    return 0;
  }
};

/**
 * Retract an alert (reporter only)
 */
export const retractAlert = async (
  reporterId: string,
  alertId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await supabase.from('admin_audit').insert({
      admin_id: reporterId,
      action: 'ugly_mugs_alert_retracted',
      target_type: 'safety_alert',
      target_id: alertId,
      details: {
        reason,
        retracted_at: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
