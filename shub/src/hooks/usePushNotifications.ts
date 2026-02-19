import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const PUSH_DECLINED_KEY = 'shub_push_declined';

export function usePushNotifications(userId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [subscribing, setSubscribing] = useState(false);

  const isDeclined = () => localStorage.getItem(PUSH_DECLINED_KEY) === 'true';
  const markDeclined = () => localStorage.setItem(PUSH_DECLINED_KEY, 'true');

  const isSupported = typeof Notification !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !userId) return false;
    setSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        markDeclined();
        setSubscribing(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // In production, use the real VAPID public key from env
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY ||
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        ),
      });

      const { endpoint, keys } = subscription.toJSON() as any;
      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      }, { onConflict: 'user_id,endpoint' });

      return true;
    } catch {
      return false;
    } finally {
      setSubscribing(false);
    }
  }, [userId, isSupported]);

  return {
    isSupported,
    permission,
    subscribing,
    isDeclined,
    markDeclined,
    subscribe,
    canPrompt: isSupported && permission === 'default' && !isDeclined(),
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
