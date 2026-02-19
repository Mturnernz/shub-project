import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export interface WorkerAnalytics {
  views7d: number;
  views30d: number;
  views90d: number;
  bookingRequests30d: number;
  confirmedBookings30d: number;
  conversionRate: number;
  responseRate: number;
  topSources: Array<{ source: string; count: number; pct: number }>;
}

const EMPTY: WorkerAnalytics = {
  views7d: 0, views30d: 0, views90d: 0,
  bookingRequests30d: 0, confirmedBookings30d: 0,
  conversionRate: 0, responseRate: 0, topSources: [],
};

export function useWorkerAnalytics(workerId: string | null) {
  const [analytics, setAnalytics] = useState<WorkerAnalytics>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workerId) return;
    setLoading(true);

    const now = new Date();
    const ago = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

    Promise.all([
      // Profile views
      supabase
        .from('profile_views')
        .select('viewed_at, source')
        .eq('worker_id', workerId),
      // Bookings
      supabase
        .from('bookings')
        .select('status, created_at')
        .eq('worker_id', workerId)
        .gte('created_at', ago(30)),
    ]).then(([viewsRes, bookingsRes]) => {
      const views = viewsRes.data || [];
      const bookings = bookingsRes.data || [];

      const v7 = views.filter(v => v.viewed_at >= ago(7)).length;
      const v30 = views.filter(v => v.viewed_at >= ago(30)).length;
      const v90 = views.filter(v => v.viewed_at >= ago(90)).length;

      const requests = bookings.length;
      const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;

      // Source breakdown
      const sourceCounts: Record<string, number> = {};
      views.forEach(v => {
        const s = v.source || 'direct';
        sourceCounts[s] = (sourceCounts[s] || 0) + 1;
      });
      const totalViews = Object.values(sourceCounts).reduce((a, b) => a + b, 0) || 1;
      const topSources = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count, pct: Math.round((count / totalViews) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      setAnalytics({
        views7d: v7,
        views30d: v30,
        views90d: v90,
        bookingRequests30d: requests,
        confirmedBookings30d: confirmed,
        conversionRate: requests > 0 ? Math.round((confirmed / requests) * 100) : 0,
        responseRate: 0, // Calculated separately (requires messages data)
        topSources,
      });
      setLoading(false);
    });
  }, [workerId]);

  return { analytics, loading };
}

/** Track a profile view (rate-limited to 1/hour per viewer/worker in sessionStorage) */
export function trackProfileView(workerId: string, viewerId: string | null, source: string) {
  const key = `pv_${workerId}_${viewerId || 'guest'}`;
  const last = sessionStorage.getItem(key);
  const now = Date.now();
  if (last && now - parseInt(last) < 3600_000) return; // 1hr rate limit
  sessionStorage.setItem(key, String(now));
  supabase.from('profile_views').insert({ worker_id: workerId, viewer_id: viewerId, source }).then(() => {});
}
