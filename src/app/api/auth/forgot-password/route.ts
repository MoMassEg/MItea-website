import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/dev-auth';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

// In-memory store for dev-mode reset tokens { token -> { email, expiresAt } }
const globalForReset = globalThis as unknown as {
  devResetTokens?: Map<string, { email: string; expiresAt: number }>;
};
export const devResetTokens =
  globalForReset.devResetTokens ?? new Map<string, { email: string; expiresAt: number }>();
if (process.env.NODE_ENV !== 'production') {
  globalForReset.devResetTokens = devResetTokens;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // ─── 1. Supabase flow ──────────────────────────────────────────────────────
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${appUrl}/reset-password`,
        });

        if (error) {
          console.warn('[ForgotPassword] Supabase error:', error.message);
          // Fall through to dev flow below
        } else {
          // Always return success to avoid email enumeration
          return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
        }
      } catch (err: any) {
        console.warn('[ForgotPassword] Supabase threw:', err?.message);
      }
    }

    // ─── 2. Dev / SMTP fallback ────────────────────────────────────────────────
    const token = crypto.randomBytes(32).toString('hex');
    devResetTokens.set(token, { email: email.toLowerCase(), expiresAt: Date.now() + 60 * 60 * 1000 }); // 1 hour

    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);

    // Always respond with success (don't reveal whether the email exists)
    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
