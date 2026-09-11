import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { signInSchema } from '@/lib/validators/auth';
import type { Database } from '@/types/database.types';
import {
  isSupabaseConfigured,
  findDevUserByEmail,
  registerDevUser,
  serializeDevSession,
  DEV_SESSION_COOKIE,
} from '@/lib/dev-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // ─── 1. Real Supabase Flow ───────────────────────────────────────────────
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerClient();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          return NextResponse.json(
            { error: error?.message || 'Invalid email or password' },
            { status: 401 }
          );
        }

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const userProfile = profile as Database['public']['Tables']['profiles']['Row'] | null;

        return NextResponse.json({
          message: 'Logged in successfully',
          user: {
            id: data.user.id,
            email: data.user.email,
            role: userProfile?.role || 'CUSTOMER',
            name: userProfile?.name || '',
          },
        });
      } catch (supabaseErr: any) {
        console.warn('Supabase login failed, using development auth fallback:', supabaseErr?.message);
      }
    }

    // ─── 2. Local Dev Fallback Flow ──────────────────────────────────────────
    let devUser = findDevUserByEmail(email);

    if (devUser) {
      if (devUser.password && devUser.password !== password) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } else {
      // In dev mode, allow auto-creation if logging in with new credentials
      devUser = registerDevUser({ email, password, name: email.split('@')[0] });
    }

    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: devUser.id,
        email: devUser.email,
        role: devUser.role,
        name: devUser.name,
      },
    });

    response.cookies.set(DEV_SESSION_COOKIE, serializeDevSession(devUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
