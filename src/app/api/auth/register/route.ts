import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signUpSchema } from '@/lib/validators/auth';
import { sendWelcomeEmail } from '@/lib/email';
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
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name, phone } = result.data;

    // ─── 1. Real Supabase Flow ───────────────────────────────────────────────
    if (isSupabaseConfigured()) {
      try {
        const admin = createAdminClient();

        // Create user with email_confirm: true to avoid hitting Supabase's strict 3-emails/hr SMTP rate limit
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name || '',
            name: name || '',
            phone: phone || '',
          },
        });

        if (error) {
          const msg = error.message || '';
          if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
            return NextResponse.json(
              { error: 'A user with this email address already exists.' },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: msg },
            { status: 400 }
          );
        }

        // Establish user session via cookies
        try {
          const supabase = await createServerClient();
          await supabase.auth.signInWithPassword({ email, password });
        } catch {
          // Continue if cookie setting is handled on subsequent login
        }

        // Send welcome email (fire-and-forget — never blocks the response)
        const displayName = name || data.user?.email?.split('@')[0] || 'there';
        sendWelcomeEmail(email, displayName).catch((err) =>
          console.warn('[Register] Welcome email failed:', err?.message)
        );

        return NextResponse.json(
          {
            message: 'Account created successfully',
            user: {
              id: data.user?.id,
              email: data.user?.email,
              name: displayName,
              role: 'CUSTOMER',
            },
          },
          { status: 201 }
        );
      } catch (supabaseErr: any) {
        console.warn('Supabase auth failed, using development auth fallback:', supabaseErr?.message);
      }
    }

    // ─── 2. Local Dev Fallback Flow ──────────────────────────────────────────
    const existing = findDevUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 400 }
      );
    }

    const devUser = registerDevUser({ email, password, name, phone });
    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: devUser.id,
          email: devUser.email,
          name: devUser.name,
          role: devUser.role,
        },
      },
      { status: 201 }
    );

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
