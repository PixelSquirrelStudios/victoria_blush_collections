'use client';

import { create } from 'zustand';
import {
  getUserNotificationsAndCount,
  getReadNotificationsByUserId,
  deleteNotification as deleteNotificationAction,
  toggleNotificationReadStatus,
} from '@/lib/actions/notifications.actions';
import { supabaseClient } from '@/lib/supabase/browserClient';

interface Notification {
  id: string;
  is_read: boolean;
}

interface NotificationState {
  notifications: Notification[]; // For header/drawer (e.g., latest 10 unread)
  pageNotifications: Notification[]; // For the current page
  unreadCount: number;
  readCount: number;
  loading: boolean;
  setInitial: (
    notifications: Notification[],
    count: number,
    read?: boolean,
    page?: boolean,
  ) => void;
  fetchNotifications: (
    userId: string,
    opts?: { read?: boolean; searchParams?: any; page?: boolean },
  ) => Promise<void>;
  markNotification: (id: string, marked: boolean) => void;
  markNotificationAsRead: (
    notificationId: string,
    userId: string,
  ) => Promise<void>;
  markNotificationAsUnread: (
    notificationId: string,
    userId: string,
  ) => Promise<void>;
  deleteNotification: (notificationId: string, userId: string) => Promise<void>;
  bulkMarkAsRead: (notificationIds: string[], userId: string) => Promise<void>;
  bulkMarkAsUnread: (
    notificationIds: string[],
    userId: string,
  ) => Promise<void>;
  bulkDelete: (notificationIds: string[], userId: string) => Promise<void>;
  markAllOnPage: (notifications: Notification[], marked: boolean) => void;
  // New methods for immediate UI updates
  immediateRemoveFromPage: (notificationIds: string[]) => void;
  immediateUpdateCounts: (unreadDelta: number, readDelta?: number) => void;
}

//const supabase = createClient();
const supabase = supabaseClient;

// Fast bulk operations - same as in your action components
const fastBulkMarkNotificationsAsRead = async (
  notificationIds: string[],
  userId: string,
  isRead: boolean,
) => {
  if (notificationIds.length === 0) return;

  const { error } = await supabase
    .from('user_notifications')
    .update({ is_read: isRead })
    .in('id', notificationIds)
    .eq('recipient', userId);

  if (error) throw error;
};

const fastBulkDeleteNotifications = async (
  notificationIds: string[],
  userId: string,
) => {
  if (notificationIds.length === 0) return;

  // Delete from join table first
  await supabase
    .from('user_notifications')
    .delete()
    .in('id', notificationIds)
    .eq('user_id', userId);

  // Delete notifications
  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .in('id', notificationIds);

  if (error) throw error;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  pageNotifications: [],
  unreadCount: 0,
  readCount: 0,
  loading: false,

  setInitial: (notifications, count, read = false, page = false) =>
    set((state) =>
      page
        ? read
          ? { pageNotifications: notifications, readCount: count }
          : { pageNotifications: notifications, unreadCount: count }
        : read
          ? { notifications, readCount: count }
          : { notifications, unreadCount: count },
    ),

  fetchNotifications: async (userId, opts = {}) => {
    set({ loading: true });
    try {
      if (opts.page) {
        // Fetch paginated notifications for the page
        if (opts.read) {
          const notificationsData = await getReadNotificationsByUserId({
            ...(opts.searchParams || {}),
            userId,
          });
          set({
            pageNotifications: notificationsData.notifications ?? [],
            readCount: notificationsData.totalNotifications ?? 0,
            loading: false,
          });
        } else {
          const notificationsData = await getUserNotificationsAndCount({
            userId,
            ...(opts.searchParams || {}),
          });
          set({
            pageNotifications: notificationsData.notifications ?? [],
            unreadCount: notificationsData.count ?? 0,
            loading: false,
          });
        }
      } else {
        // Fetch global notifications for the header/drawer
        const { notifications, count } =
          await getUserNotificationsAndCount(userId);
        set({
          notifications: notifications ?? [],
          unreadCount: count ?? 0,
          loading: false,
        });
      }
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch notifications from store:', error);
    }
  },

  markNotification: (id, marked) => {
    set((state) => ({
      pageNotifications: state.pageNotifications.map((n) =>
        n.id === id ? { ...n, is_marked: marked } : n,
      ),
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_marked: marked } : n,
      ),
    }));
  },

  markNotificationAsRead: async (notificationId, userId) => {
    await toggleNotificationReadStatus(notificationId, userId, '/', false);
    // Let RealtimeUpdates do the fetch
  },

  markNotificationAsUnread: async (notificationId, userId) => {
    await toggleNotificationReadStatus(notificationId, userId, '/', false);
    // Let RealtimeUpdates do the fetch
  },

  deleteNotification: async (notificationId, userId) => {
    await deleteNotificationAction(notificationId, userId, '/', false);
    // Let RealtimeUpdates do the fetch
  },

  // OPTIMIZED: Fast bulk operations using single queries
  bulkMarkAsRead: async (notificationIds, userId) => {
    // Immediate UI update - remove from page
    get().immediateRemoveFromPage(notificationIds);
    get().immediateUpdateCounts(-notificationIds.length);

    // Fast background update - single query instead of loop
    try {
      await fastBulkMarkNotificationsAsRead(notificationIds, userId, true);
    } catch (error) {
      console.error('Error in bulk mark as read:', error);
    }
  },

  bulkMarkAsUnread: async (notificationIds, userId) => {
    try {
      // Fast bulk update - single query instead of loop
      await fastBulkMarkNotificationsAsRead(notificationIds, userId, false);
    } catch (error) {
      console.error('Error in bulk mark as unread:', error);
    }
    // Let RealtimeUpdates do the fetch
  },

  bulkDelete: async (notificationIds, userId) => {
    // Immediate UI update - remove from page
    get().immediateRemoveFromPage(notificationIds);
    get().immediateUpdateCounts(-notificationIds.length);

    // Fast background update - single query instead of loop
    try {
      await fastBulkDeleteNotifications(notificationIds, userId);
    } catch (error) {
      console.error('Error in bulk delete:', error);
    }
  },

  markAllOnPage: (pageNotifications, marked) => {
    set((state) => ({
      pageNotifications: state.pageNotifications.map((n) =>
        pageNotifications.some((m) => m.id === n.id)
          ? { ...n, is_marked: marked }
          : n,
      ),
      notifications: state.notifications.map((n) =>
        pageNotifications.some((m) => m.id === n.id)
          ? { ...n, is_marked: marked }
          : n,
      ),
    }));
  },

  // New methods for immediate UI updates
  immediateRemoveFromPage: (notificationIds) => {
    set((state) => ({
      pageNotifications: state.pageNotifications.filter(
        (n) => !notificationIds.includes(n.id),
      ),
      notifications: state.notifications.filter(
        (n) => !notificationIds.includes(n.id),
      ),
    }));
  },

  immediateUpdateCounts: (unreadDelta, readDelta = 0) => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount + unreadDelta),
      readCount: Math.max(0, state.readCount + readDelta),
    }));
  },
}));
