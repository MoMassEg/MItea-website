import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: 'Admin session terminated',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to logout admin', details: error?.message },
      { status: 500 }
    );
  }
}
