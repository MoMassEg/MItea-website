import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { markNotificationAsRead } from '@/lib/notifications';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to update notification' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notification = await markNotificationAsRead(id, user.id);

    if (!notification) {
      return NextResponse.json(
        { error: `Notification '${id}' not found or does not belong to you` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
