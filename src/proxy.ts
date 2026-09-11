import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authRateLimiter } from '@/lib/rate-limit';

/**
 * Next.js 16 Proxy function (replaces deprecated middleware.ts convention)
 * Handles SSR session token refreshing, rate limiting, and route protection.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const pathname = request.nextUrl.pathname;

  // 1. Rate limiting on authentication endpoints (enforced in production)
  if (process.env.NODE_ENV === 'production' && (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register'))) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateCheck = await authRateLimiter.limit(`auth:${ip}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }
  }

  // If Supabase environment variables are missing or using placeholder, proceed gracefully
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return response;
  }

  // 2. Refresh Supabase Auth session via cookies
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Route Protection: Protected Customer APIs
  const isProtectedCustomerRoute =
    pathname.startsWith('/api/loyalty') ||
    pathname.startsWith('/api/gift-cards/sent') ||
    pathname.startsWith('/api/notifications') ||
    (pathname === '/api/orders' && request.method === 'GET');

  if (isProtectedCustomerRoute && !user) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 }
    );
  }

  // 4. Route Protection: Admin APIs
  const isAdminAuthRoute = pathname.startsWith('/api/admin/auth/');
  const isAdminRoute =
    (pathname.startsWith('/api/admin') && !isAdminAuthRoute) ||
    (request.method === 'PATCH' && /^\/api\/orders\/[^/]+\/status/.test(pathname));

  if (isAdminRoute) {
    // A. Check dev API key header (disabled by default in production unless explicitly set)
    const adminKey = request.headers.get('x-admin-key');
    const allowedAdminKey =
      process.env.NODE_ENV === 'production'
        ? (process.env.ADMIN_KEY || null)
        : (process.env.ADMIN_KEY || 'dev-admin-secret-key-mitea');
    if (adminKey && allowedAdminKey && adminKey === allowedAdminKey) {
      return response;
    }

    // B. Check dedicated master admin session cookie with HMAC cryptographic verification
    const adminCookie = request.cookies.get('mitea_admin_session')?.value;
    if (adminCookie && adminCookie.includes('.')) {
      try {
        const [data, sig] = adminCookie.split('.');
        const secret =
          process.env.ADMIN_SESSION_SECRET ||
          (process.env.NODE_ENV !== 'production' ? 'mitea-dedicated-master-admin-secret-2026-xyz' : null);

        if (secret && data && sig) {
          const enc = new TextEncoder();
          const key = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
          );
          const base64Sig = sig.replace(/-/g, '+').replace(/_/g, '/');
          const paddedSig = base64Sig.padEnd(base64Sig.length + (4 - (base64Sig.length % 4)) % 4, '=');
          const sigBinary = Uint8Array.from(atob(paddedSig), (c) => c.charCodeAt(0));

          const isValid = await crypto.subtle.verify('HMAC', key, sigBinary, enc.encode(data));
          if (isValid) {
            const base64Data = data.replace(/-/g, '+').replace(/_/g, '/');
            const paddedData = base64Data.padEnd(base64Data.length + (4 - (base64Data.length % 4)) % 4, '=');
            const decodedJson = atob(paddedData);
            const payload = JSON.parse(decodedJson);

            if (payload.role === 'ADMIN' && Date.now() < payload.expiresAt) {
              return response;
            }
          }
        }
      } catch {
        // Fall through
      }
    }

    // C. Fallback: Check customer profile with ADMIN role
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
