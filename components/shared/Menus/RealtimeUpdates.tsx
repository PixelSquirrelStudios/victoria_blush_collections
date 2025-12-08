'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAudioContext } from '@/app/providers/AudioProvider';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useDebouncedCallback } from '@/app/hooks/useDebounceCallback';
import { supabaseClient } from '@/lib/supabase/browserClient';

export default function RealtimeUpdates({
  userId,
  relatedUser,
  onNotificationsChange,
}: {
  userId: string;
  relatedUser?: string;
  onNotificationsChange: () => void;
}) {
  // 🧠 use the shared Supabase client across tabs
  const supabase = supabaseClient;

  const router = useRouter();
  const pathname = usePathname();
  const { playNotificationSound, audioEnabled } =
    useAudioContext();

  // Realtime channels
  const notificationsChannelRef = useRef<RealtimeChannel | null>(null);

  // Debounced callbacks
  const debouncedNotificationsChange = useDebouncedCallback(
    onNotificationsChange,
    300
  );
  const debouncedRouterRefresh = useDebouncedCallback(
    () => router.refresh(),
    300
  );

  // --- Notifications / Activity / Achievements ---
  useEffect(() => {
    if (!userId) return;

    const isNotificationsPage = pathname.startsWith('/notifications');

    // Remove any existing channel before creating new
    if (notificationsChannelRef.current) {
      supabase.removeChannel(notificationsChannelRef.current);
    }

    const channel = supabase.channel(
      `realtime-updates:${userId}:${relatedUser || ''}`
    );
    notificationsChannelRef.current = channel;

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: relatedUser
            ? `recipient=in.(${userId},${relatedUser})`
            : `recipient=eq.${userId}`,
        },
        (payload) => {
          console.log('notifications table change received:', payload);
          if (payload.eventType === 'INSERT') {
            console.log('New notification - attempting to play sound', {
              audioEnabled,
            });
            playNotificationSound();
          }
          debouncedNotificationsChange();
          if (isNotificationsPage) debouncedRouterRefresh();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED')
          console.log('[Realtime] Subscribed to notifications/activity.');
        else if (err) console.error('[Realtime] Subscription failed:', err);
      });

    return () => {
      if (notificationsChannelRef.current) {
        supabase.removeChannel(notificationsChannelRef.current);
        notificationsChannelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, relatedUser, audioEnabled]);

  return null;
}