import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEV_SESSION_COOKIE } from '@/lib/dev-auth';

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerClient();
        await supabase.auth.signOut();
      } catch {
        // Ignore errors during dev sign out
      }
    }

    const cookieStore = await cookies();
    cookieStore.delete(DEV_SESSION_COOKIE);

    const response = NextResponse.json({ message: 'Signed out successfully' });
    response.cookies.delete(DEV_SESSION_COOKIE);

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
