import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const CHANNEL = 'online-workers';

/**
 * Subscribe to worker presence and return the set of online worker IDs.
 * Workers broadcast their presence when they have the app open.
 */
export function useOnlineWorkers(): Set<string> {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase.channel(CHANNEL);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ worker_id: string }>();
        const ids = new Set(
          Object.values(state)
            .flat()
            .map((p) => p.worker_id)
            .filter(Boolean)
        );
        setOnlineIds(ids);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return onlineIds;
}

/**
 * Broadcast this worker's presence while the app is open.
 */
export function useWorkerPresence(workerId: string | null) {
  useEffect(() => {
    if (!workerId) return;

    const channel = supabase.channel(CHANNEL);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ worker_id: workerId });
      }
    });

    // Heartbeat every 25s to maintain presence
    const heartbeat = setInterval(() => {
      channel.track({ worker_id: workerId });
    }, 25_000);

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [workerId]);
}
