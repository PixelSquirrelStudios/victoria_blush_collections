'use client';

import { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNotificationStore } from '@/app/stores/notificationStore';
import NotificationsDrawer from './Menus/NotificationsDrawer';
import RealtimeUpdates from './Menus/RealtimeUpdates';

interface HeaderClientProps {
  userId: string;
  unreadCount: number; // SSR fallback
  initialNotifications: any[];
}

export default function HeaderClient({
  userId,
  unreadCount: initialUnreadCount,
  initialNotifications,
}: HeaderClientProps) {
  const {
    notifications,
    unreadCount,
    readCount,
    fetchNotifications,
    setInitial,
    markNotificationAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [storeInitialized, setStoreInitialized] = useState(false);

  const pathname = usePathname();
  const searchParamsObj = useSearchParams();
  const searchParams: Record<string, string> = {};
  searchParamsObj.forEach((value, key) => {
    searchParams[key] = value;
  });

  // --- THE FIX: Determine if we are on any notifications page ---
  const isNotificationsPage = pathname.startsWith('/notifications');
  const isReadPage = pathname.startsWith('/notifications/read');

  // Set initial state from SSR
  useEffect(() => {
    setInitial(initialNotifications ?? [], initialUnreadCount ?? 0, isReadPage);
    setStoreInitialized(true);
    // eslint-disable-next-line
  }, []);

  // Dynamic fetch for RealtimeUpdates
  const handleRealtimeFetch = () => {
    if (isReadPage) {
      fetchNotifications(userId, { read: true, searchParams });
    } else {
      fetchNotifications(userId);
    }
  };

  // Optionally, fetch on mount for unread notifications (header badge)
  useEffect(() => {
    if (storeInitialized && !isReadPage) {
      fetchNotifications(userId);
    }
  }, [fetchNotifications, userId, storeInitialized, isReadPage]);

  // --- THE FIX: Dynamically choose the wrapper component ---
  const WrapperComponent = isNotificationsPage ? 'div' : 'button';
  const wrapperProps = isNotificationsPage
    ? {
      // Props for the non-interactive div
      className:
        'flex items-center gap-3 text-2xl font-semibold relative text-white cursor-default',
    }
    : {
      // Props for the interactive button
      className:
        'flex items-center gap-3 text-2xl font-semibold relative text-white cursor-pointer',
      'aria-label': 'Show notifications',
      type: 'button' as 'button',
      onClick: () => setDrawerOpen((o) => !o),
    };

  return (
    <div className="flex flex-row gap-3 items-center cursor-pointer">
      <WrapperComponent {...wrapperProps}>
        <div className="text-2xl text-stone-900">
          <FaBell />
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex h-6 w-[2.6rem] items-center justify-center rounded-[14px] border-2 border-stone-900 bg-yellow-600/70 px-[0.8rem] py-0 text-sm text-stone-900 font-light">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        </div>
      </WrapperComponent>

      {/* This logic is already correct: the drawer won't render on notifications pages */}
      {storeInitialized && !isNotificationsPage && (
        <NotificationsDrawer
          userId={userId}
          notifications={notifications}
          unreadCount={isReadPage ? readCount : unreadCount}
          open={drawerOpen}
          setOpen={setDrawerOpen}
          onNotificationRead={(id) => markNotificationAsRead(id, userId)}
          onNotificationDelete={(id) => deleteNotification(id, userId)}
        />
      )}
      <RealtimeUpdates
        userId={userId}
        onNotificationsChange={handleRealtimeFetch}
      />
    </div>
  );
}