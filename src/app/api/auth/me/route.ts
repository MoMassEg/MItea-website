import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import {
  isSupabaseConfigured,
  deserializeDevSession,
  DEV_SESSION_COOKIE,
} from '@/lib/dev-auth';

export async function GET() {
  try {
    // 1. Try real Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!userError && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          return NextResponse.json({
            user: {
              id: user.id,
              email: user.email,
              phone: user.phone,
            },
            profile: profile || null,
          });
        }
      } catch {
        // Fall through to dev session
      }
    }

    // 2. Check local dev session cookie
    const cookieStore = await cookies();
    const devToken = cookieStore.get(DEV_SESSION_COOKIE)?.value;

    if (devToken) {
      const devUser = deserializeDevSession(devToken);
      if (devUser) {
        return NextResponse.json({
          user: {
            id: devUser.id,
            email: devUser.email,
            phone: devUser.phone,
          },
          profile: {
            id: devUser.id,
            email: devUser.email,
            name: devUser.name,
            phone: devUser.phone,
            role: devUser.role,
          },
        });
      }
    }

    return NextResponse.json({ user: null, profile: null }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
