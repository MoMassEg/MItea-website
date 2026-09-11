import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyAdminCredentials,
  createAdminSessionToken,
  ADMIN_COOKIE_NAME,
  getMasterAdminCredentials,
} from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Admin email and password are required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid administrator credentials. Access restricted.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    const master = getMasterAdminCredentials();

    return NextResponse.json({
      success: true,
      message: 'Master Administrator authenticated successfully',
      admin: {
        email: master.email,
        name: 'Master Administrator',
        role: 'ADMIN',
      },
    });
  } catch (error: any) {
    console.error('[AdminLogin] Authentication error:', error);
    return NextResponse.json(
      { error: 'Administrator login failed', details: error?.message },
      { status: 500 }
    );
  }
}
