'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotificationStore } from '@/app/stores/notificationStore';
import NotificationCard from '@/components/cards/NotificationCard';

interface NotificationsDrawerProps {
  userId: string;
  notifications: any[];
  unreadCount: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  onNotificationRead: (id: string) => void;
  onNotificationDelete: (id: string) => void;
}

const NotificationsDrawer = ({
  userId,
  notifications,
  unreadCount,
  open,
  setOpen,
  onNotificationRead,
  onNotificationDelete,
}: NotificationsDrawerProps) => {
  const path = usePathname();
  const isNotificationsPage = path.startsWith('/notifications');
  const drawerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const {
    markNotificationAsUnread,
    markNotificationAsRead,
    fetchNotifications,
  } = useNotificationStore();

  // Only close on click outside the drawer and bell
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        open &&
        drawerRef.current &&
        !drawerRef.current.contains(target) &&
        bellRef.current &&
        !bellRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  const handleToggleStatus = async (id: string, isRead: boolean) => {
    if (isRead) {
      markNotificationAsUnread(id, userId);
      setTimeout(() => {
        fetchNotifications(userId, { read: false });
      }, 300);
    } else {
      markNotificationAsRead(id, userId);
      setTimeout(() => {
        fetchNotifications(userId, { read: true });
      }, 300);
    }
  };

  // This effect is still useful for cases where navigation happens
  // by other means (e.g., browser back/forward buttons).
  const lastPath = useRef(path);
  useEffect(() => {
    if (open && path !== lastPath.current) {
      setOpen(false);
    }
    lastPath.current = path;
  }, [path, open, setOpen]);

  const showNoNotifications = notifications.length === 0;

  return (
    <>
      {!isNotificationsPage && (
        <div
          ref={drawerRef}
          className={`
            fixed top-24 z-12000
            transition-transform duration-300 shadow-xl
            ${open ? 'right-2 translate-x-0' : '-right-2 translate-x-full'}
          `}
          style={{
            height: '100vh',
          }}
        >
          <div className="bg-linear-to-b from-stone-800 via-black to-stone-950 2xl:w-[1000px] 2xl:min-w-[1000px] max-w-[1000px] min-h-[500px] max-h-[500px] flex flex-col rounded-tl-lg rounded-bl-xl">
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4">
              {showNoNotifications ? (
                <div className="flex flex-1 items-center justify-center min-h-[300px]">
                  <div className="text-2xl text-center text-stone-200 font-semibold opacity-80">
                    No notifications
                  </div>
                </div>
              ) : (
                notifications.map((notification: any) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    userId={userId}
                    onRead={onNotificationRead}
                    onDelete={onNotificationDelete}
                    hasCheckbox={false}
                    revalidate={true}
                    onToggleStatus={async () =>
                      handleToggleStatus(notification.id, notification.is_read)
                    }
                  />
                ))
              )}
            </div>
            <div className=" bg-primary-main px-8 py-3.5 rounded-bl-xl">
              {/* THE FIX IS HERE: Add an onClick handler to the Link */}
              <Link
                href="/notifications/unread"
                className="block w-full text-center text-stone-100 font-semibold hover:underline"
                onClick={() => setOpen(false)}
              >
                {unreadCount > 10
                  ? `View All ${unreadCount} Notifications`
                  : 'View Notifications Page'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsDrawer;