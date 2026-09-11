import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { markAllNotificationsAsRead } from '@/lib/notifications';

export async function PUT() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
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
