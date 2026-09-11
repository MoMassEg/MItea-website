'use server';

import { getCurrentUser } from '@/lib/auth-helpers';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notifications';

export async function getUserNotificationsAction(limit: number = 20, offset: number = 0) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const result = await getUserNotifications(user.id, limit, offset);
    return {
      success: true,
      ...result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch notifications',
    };
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const notification = await markNotificationAsRead(id, user.id);
    if (!notification) {
      return {
        success: false,
        error: 'Notification not found',
      };
    }

    return {
      success: true,
      notification,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to update notification',
    };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const result = await markAllNotificationsAsRead(user.id);
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to mark notifications as read',
    };
  }
}
