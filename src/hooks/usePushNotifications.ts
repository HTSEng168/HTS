import { useState, useEffect, useCallback } from 'react';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  tag?: string;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [lastNotification, setLastNotification] = useState<PushNotificationPayload | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch {
      return false;
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      // Audio synthesis chime for instant feedback across all browsers
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Ignore if autoplay audio is blocked
    }
  }, []);

  const triggerNotification = useCallback((payload: PushNotificationPayload) => {
    playNotificationSound();
    setLastNotification(payload);

    // If native Notification API is permitted, show it
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/pwa-192x192.png',
          badge: payload.badge || '/icon.svg',
          tag: payload.tag || 'repair-update',
        });
      } catch {
        // Fallback handled by in-app banner
      }
    }

    // Trigger device vibration if supported (Android / mobile)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // Ignore vibration failure
      }
    }
  }, [playNotificationSound]);

  const clearLastNotification = useCallback(() => {
    setLastNotification(null);
  }, []);

  return {
    isSupported,
    permission,
    requestPermission,
    triggerNotification,
    lastNotification,
    clearLastNotification,
  };
}
