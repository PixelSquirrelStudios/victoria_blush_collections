'use server';

import { createClient } from '../supabase/server';
import {
  CreateNotificationParams,
  DeleteNotificationParams,
  GetUserNotificationsParams,
} from './shared.types';
import { revalidatePath } from 'next/cache';

export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = await createClient();

    const {
      notification_type,
      notification_message,
      notification_url,
      recipient,
      related_user,
      is_read,
      path,
    } = params;

    // Insert the notification and get its ID
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          notification_type,
          notification_message,
          notification_url,
          recipient,
          related_user,
          is_read,
        },
      ])
      .select('id, recipient') // Select only the ID of the inserted notification
      .single(); // Ensure it returns a single object

    if (notificationError) {
      console.error('Error creating notification:', notificationError.message);
      throw new Error('Failed to create notification');
    }

    // Insert into the user_notifications join table
    const { error: joinError } = await supabase
      .from('user_notifications')
      .insert([
        {
          id: notification.id,
          user_id: recipient,
        },
      ]);

    if (joinError) {
      console.error(
        'Error creating user_notification entry:',
        joinError.message
      );
      throw new Error('Failed to create user_notification entry');
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function getUserNotificationsAndCount(userId: string) {
  const [notifications, count] = await Promise.all([
    getTenLatestUnreadNotifications(userId),
    getUnreadUserNotificationsCount(userId),
  ]);
  return { notifications, count };
}

// Helper function to build the filter query to avoid repetition
const buildNotificationQuery = (
  baseQuery: any,
  params: GetUserNotificationsParams
) => {
  const { searchQuery, notification_types } = params;

  if (searchQuery) {
    baseQuery = baseQuery.ilike('notification_message', `%${searchQuery}%`);
  }

  if (notification_types) {
    const typesArray = Array.isArray(notification_types)
      ? notification_types
      : notification_types.split(',');
    const typesToInclude: string[] = [];

    // This logic remains the same as it operates on the notification_type column

    if (typesArray.includes('favourites')) {
      typesToInclude.push(
        'favourite-news-author',
        'favourite-fan-art-author',
        'favourite-cosplay-author',
        'favourite-screenshot-author',
        'favourite-video-author',
        'favourite-audio-author',
        'favourite-thought-author',
        'favourite-comment-author'
      );
    }
    if (typesArray.includes('comments')) {
      typesToInclude.push('comment-author');
    }
    if (typesArray.includes('replies')) {
      typesToInclude.push('reply-author');
    }
    if (typesArray.includes('upvotes')) {
      typesToInclude.push('upvote-theory-author');
    }
    if (typesArray.includes('follows')) {
      typesToInclude.push('followed-user');
    }
    if (typesArray.includes('unlocks')) {
      typesToInclude.push(
        'unlocked-achievement',
        'unlocked-stickers',
        'unlocked-beads'
      );
    }
    if (typesArray.includes('purchases')) {
      typesToInclude.push(
        'purchased-sticker',
        'purchased-sticker-pack',
        'purchased-bead',
        'purchased-bracelet',
        'purchased-custom-bracelet'
      );
    }
    if (typesArray.includes('sales')) {
      typesToInclude.push(
        'sold-sticker',
        'sold-sticker-pack',
        'sold-bead',
        'sold-bracelet',
        'sold-custom-bracelet'
      );
    }
    if (typesArray.includes('points')) {
      typesToInclude.push('weekly-points');
    }

    if (typesToInclude.length > 0) {
      baseQuery = baseQuery.in('notification_type', typesToInclude);
    }
  }

  return baseQuery;
};

export async function getUnreadNotificationsByUserId(
  params: GetUserNotificationsParams
) {
  try {
    const supabase = await createClient();
    const { sort_by, page = 1, page_size = 6, userId } = params;

    const from = (page - 1) * page_size;

    // Start query on the new, clean view
    let query = supabase
      .from('user_notifications')
      .select('*', { count: 'exact' })
      .eq('is_read', false)
      .eq('user_id', userId);

    // Apply common filters
    query = buildNotificationQuery(query, params);

    // Apply sorting and pagination
    query = query.order('received_at', {
      ascending: sort_by === 'oldest',
    });
    query = query.range(from, from + page_size - 1);

    const { data: notifications, error, count } = await query;

    if (error) throw error;

    const totalNotifications = count || 0;

    return {
      notifications: notifications || [],
      totalNotifications,
      isNext: totalNotifications > page * page_size,
      pageCount: Math.ceil(totalNotifications / page_size),
    };
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
}

export async function getReadNotificationsByUserId(
  params: GetUserNotificationsParams
) {
  try {
    const supabase = await createClient();
    const { sort_by, page = 1, page_size = 6, userId } = params;

    const from = (page - 1) * page_size;

    // Start query on the new, clean view
    let query = supabase
      .from('user_notifications')
      .select('*', { count: 'exact' })
      .eq('is_read', true)
      .eq('user_id', userId);

    // Apply common filters
    query = buildNotificationQuery(query, params);

    // Apply sorting and pagination
    query = query.order('received_at', {
      ascending: sort_by === 'oldest',
    });
    query = query.range(from, from + page_size - 1);

    const { data: notifications, error, count } = await query;

    if (error) throw error;

    const totalNotifications = count || 0;

    return {
      notifications: notifications || [],
      totalNotifications,
      isNext: totalNotifications > page * page_size,
      pageCount: Math.ceil(totalNotifications / page_size),
    };
  } catch (error) {
    console.error('Error fetching read notifications:', error);
    throw error;
  }
}

export async function toggleNotificationReadStatus(
  notificationId: string,
  userId: string,
  path: string,
  shouldRevalidatePath: boolean
) {
  try {
    const supabase = await createClient();

    if (!userId || !notificationId) {
      throw new Error('Missing userId or notificationId');
    }

    // Retrieve current notification state
    const { data: currentNotification, error: fetchError } = await supabase
      .from('user_notifications')
      .select('is_read')
      .eq('id', notificationId)
      .single();

    if (fetchError || !currentNotification) {
      throw new Error('Failed to fetch current notification state');
    }

    // Toggle the is_read value
    const newReadStatus = !currentNotification.is_read;

    // Update with the toggled value
    const { data: updatedNotification, error: updateError } = await supabase
      .from('user_notifications')
      .update({ is_read: newReadStatus })
      .eq('id', notificationId)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to update notification');
    }

    if (shouldRevalidatePath) {
      revalidatePath(path);
    }

    return updatedNotification;
  } catch (error) {
    console.error('Error toggling notification read status:', error);
    throw error;
  }
}

export async function toggleMarkAllAsRead(
  notifications: any,
  userId: string,
  path: string
) {
  try {
    const supabase = await createClient();

    const notificationIds = notifications.map(
      (notification: any) => notification.id
    );

    // Fetch current states of the notifications
    const { data: currentNotifications, error: fetchError } = await supabase
      .from('user_notifications')
      .select('id, is_read')
      .in('id', notificationIds)
      .eq('recipient', userId);

    if (fetchError) {
      throw new Error('Failed to fetch notifications');
    }

    // Prepare toggled notifications
    const toggledNotifications = currentNotifications.map(
      (notification: any) => ({
        id: notification.id,
        is_read: !notification.is_read,
      })
    );

    // Batch update notifications with toggled read status
    const { error: updateError } = await supabase
      .from('user_notifications')
      .upsert(toggledNotifications, { onConflict: 'id' });

    if (updateError) {
      console.error(
        'Error toggling notifications read status:',
        updateError.message
      );
      throw new Error('Failed to toggle notifications read status');
    }

    // Revalidate the page
    revalidatePath(path);
  } catch (error) {
    console.error('Error toggling all notifications read status:', error);
  }
}

export async function toggleMarkSelectedAsRead(
  notifications: any,
  userId: string,
  path: string
) {
  try {
    const supabase = await createClient();

    const notificationIds = notifications.map(
      (notification: any) => notification.id
    );

    // Fetch current states of the notifications
    const { data: currentNotifications, error: fetchError } = await supabase
      .from('user_notifications')
      .select('id, is_read')
      .in('id', notificationIds);

    if (fetchError) {
      throw new Error('Failed to fetch current notification states');
    }

    // Prepare the updates by toggling the is_read state
    const updates = currentNotifications.map((notification: any) => ({
      id: notification.id,
      is_read: !notification.is_read,
    }));

    // Perform the batch update
    const { error: updateError } = await supabase
      .from('user_notifications')
      .upsert(updates, { onConflict: 'id' });

    if (updateError) {
      console.error(
        'Error toggling selected notifications read status:',
        updateError.message
      );
      throw new Error('Failed to toggle selected notifications read status');
    }
    // Revalidate the page
    revalidatePath(path);
  } catch (error) {
    console.error('Error toggling selected notifications read status:', error);
  }
}

export async function toggleMarkSelectedAsUnread(
  notifications: any,
  userId: string,
  path: string
) {
  try {
    const supabase = await createClient();

    // Get the authenticated user

    const notificationIds = notifications.map(
      (notification: any) => notification.id
    );

    // Batch update selected notifications to mark as unread
    const { error: updateError } = await supabase
      .from('user_notifications')
      .update({ is_read: false }) // Mark as unread and unmark
      .in('id', notificationIds)
      .eq('recipient', userId);

    if (updateError) {
      console.error(
        'Error marking selected notifications as unread:',
        updateError.message
      );
      throw new Error('Failed to mark selected notifications as unread');
    }

    // Revalidate the page
    revalidatePath(path);
  } catch (error) {
    console.error('Error marking selected notifications as unread:', error);
  }
}

export const getUnreadUserNotificationsCount = async (userId: string) => {
  const supabase = await createClient();

  // 1. Get all notification IDs for this user
  const { data: userNotifs, error: userNotifsError } = await supabase
    .from('user_notifications')
    .select('id')
    .eq('user_id', userId);

  if (userNotifsError) {
    console.error(
      'Error fetching user_notifications:',
      userNotifsError.message
    );
    throw new Error('Failed to get user_notifications');
  }

  const notificationIds = (userNotifs ?? []).map((row: any) => row.id);

  if (notificationIds.length === 0) return 0;

  // 2. Count unread notifications in notifications table
  const { count, error } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .in('id', notificationIds)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread notifications count:', error.message);
    throw new Error('Failed to get unread notifications count');
  }

  return count || 0;
};

export async function deleteNotification(
  notificationId: string,
  userId: string,
  path: string,
  shouldRevalidatePath: boolean
) {
  try {
    const supabase = await createClient();

    // Try to delete from user_notifications (join table)
    const { error: deleteJoinError } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (deleteJoinError) {
      console.error(
        'Error deleting from user_notifications:',
        deleteJoinError.message
      );
      // Don't throw here; still try to delete the notification itself
    }

    // Always attempt to delete the notification itself
    const { error: deleteNotificationError } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId);

    if (deleteNotificationError) {
      console.error(
        'Error deleting notification:',
        deleteNotificationError.message
      );
      throw new Error('Failed to delete notification');
    }

    if (shouldRevalidatePath) {
      revalidatePath(path);
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

export async function deleteNotificationByFields(
  params: DeleteNotificationParams
) {
  const supabase = await createClient();
  let query = supabase.from('user_notifications').delete();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query = query.eq(key, value);
  });

  await query;
}

export const deleteSelectedNotifications = async (
  notifications: any[],
  userId: string,
  path: string
) => {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const notificationIds = notifications.map(
      (notification: any) => notification.id
    );

    // Delete entries from `user_notifications`
    const { error: deleteJoinError } = await supabase
      .from('user_notifications')
      .delete()
      .in('id', notificationIds)
      .eq('user_id', userId);

    if (deleteJoinError) {
      console.error(
        'Error deleting from user_notifications:',
        deleteJoinError.message
      );
      throw new Error('Failed to delete selected notifications');
    }

    // Delete the notifications themselves
    const { error: deleteNotificationsError } = await supabase
      .from('user_notifications')
      .delete()
      .in('id', notificationIds);

    if (deleteNotificationsError) {
      console.error(
        'Error deleting notifications:',
        deleteNotificationsError.message
      );
      throw new Error('Failed to delete notifications');
    }

    revalidatePath(path);
  } catch (error) {
    console.error('Error deleting selected notifications:', error);
  }
};

export async function deleteAllNotifications(path: string, userId: string) {
  try {
    const supabase = await createClient();

    // Get all notification IDs associated with the user
    const { data: userNotifications, error: fetchError } = await supabase
      .from('user_notifications')
      .select('id')
      .eq('user_id', userId);

    if (fetchError || !userNotifications) {
      console.error(
        'Error fetching user_notifications:',
        fetchError?.message || 'No notifications found'
      );
      return;
    }

    const notificationIds = userNotifications.map((item: any) => item.id);

    // Delete the notifications themselves
    const { error: deleteNotificationsError } = await supabase
      .from('user_notifications')
      .delete()
      .in('id', notificationIds);

    if (deleteNotificationsError) {
      console.error(
        'Error deleting notifications:',
        deleteNotificationsError.message
      );
      throw new Error('Failed to delete notifications');
    }

    revalidatePath(path);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
  }
}

export async function getTenLatestUnreadNotifications(userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_notifications')
      .select(
        `
          id,
          user_id,
          notification_type,
          notification_message,
          notification_url,
          is_read,
          received_at,
          recipient:profiles!user_notifications_recipient_fkey ( id, username, role, avatar_url ),
          related_user:profiles!user_notifications_related_user_fkey ( id, username, role, avatar_url )
        `
      )
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('received_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching latest unread notifications:', error);
      throw new Error('Failed to fetch latest unread notifications');
    }

    // Return the rows as-is (don’t collapse to row.id)
    return data ?? [];
  } catch (error) {
    console.error('Error getting latest unread notifications:', error);
    throw error;
  }
}
