import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, findDevUserByEmail } from '@/lib/dev-auth';
import { devResetTokens } from '@/app/api/auth/forgot-password/route';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // ─── 1. Supabase flow: token comes as access_token from the email magic link ──
    // Supabase handles its own token verification via the session exchange in /auth/callback.
    // When using PKCE flow, the reset page receives an access_token in the URL hash (client side).
    // We handle that path on the client; here we handle the dev-token path.

    // ─── 2. Dev token flow ─────────────────────────────────────────────────────
    if (!token) {
      // If no token supplied, and Supabase is configured, the client-side Supabase
      // session update is used (handled in the reset-password page client component).
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }

    const record = devResetTokens.get(token);
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
      devResetTokens.delete(token);
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const { email } = record;

    // Update password in Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerClient();
        // Use admin to update by email
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const admin = createAdminClient();

        // Find user by email
        const { data: users } = await admin.auth.admin.listUsers();
        const user = users?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

        if (user) {
          await admin.auth.admin.updateUserById(user.id, { password });
        }
      } catch (err: any) {
        console.warn('[ResetPassword] Supabase update failed:', err?.message);
      }
    }

    // Update in dev in-memory store
    const devUser = findDevUserByEmail(email);
    if (devUser) {
      devUser.password = password;
    }

    devResetTokens.delete(token);

    return NextResponse.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
