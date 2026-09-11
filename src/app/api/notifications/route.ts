import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
} from '@/lib/notifications';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to view notifications' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    const result = await getUserNotifications(user.id, limit, offset);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          'X-Unread-Count': String(result.unreadCount),
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to update notifications' },
        { status: 401 }
      );
    }

    const result = await markAllNotificationsAsRead(user.id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
