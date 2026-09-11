import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import {
  isSupabaseConfigured,
  deserializeDevSession,
  DEV_SESSION_COOKIE,
} from '@/lib/dev-auth';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export class AuthError extends Error {
  status: number;
  constructor(message = 'Unauthorized: Authentication required', status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export class ForbiddenError extends Error {
  status: number;
  constructor(message = 'Forbidden: Admin privileges required', status = 403) {
    super(message);
    this.name = 'ForbiddenError';
    this.status = status;
  }
}

/**
 * Retrieves the currently authenticated Supabase user or dev session user.
 */
export async function getCurrentUser() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        return user;
      }
    } catch {
      // Fall through to dev session
    }
  }

  // Fallback: dev session cookie — disabled in production to prevent auth bypass
  if (process.env.NODE_ENV !== 'production') {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(DEV_SESSION_COOKIE)?.value;
      if (token) {
        const devUser = deserializeDevSession(token);
        if (devUser) {
          return {
            id: devUser.id,
            email: devUser.email,
            phone: devUser.phone,
            user_metadata: {
              name: devUser.name,
              full_name: devUser.name,
              phone: devUser.phone,
            },
          } as any;
        }
      }
    } catch {
      // Cookie store not available (e.g. static generation)
    }
  }

  return null;
}

/**
 * Retrieves the profile row corresponding to the currently authenticated user.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!userError && user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          return profile;
        }
      }
    } catch {
      // Fall through to dev session
    }
  }

  // Fallback: dev session cookie — disabled in production
  if (process.env.NODE_ENV !== 'production') {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(DEV_SESSION_COOKIE)?.value;
      if (token) {
        const devUser = deserializeDevSession(token);
        if (devUser) {
          return {
            id: devUser.id,
            email: devUser.email,
            name: devUser.name,
            phone: devUser.phone || null,
            avatar_url: null,
            role: devUser.role,
            created_at: devUser.createdAt,
            updated_at: devUser.createdAt,
          };
        }
      }
    } catch {
      // Cookie store not available
    }
  }

  return null;
}

// In production the x-admin-key bypass is only valid if ADMIN_KEY is explicitly set.
// Never fall back to a hardcoded default in production.
const ADMIN_DEV_KEY =
  process.env.NODE_ENV === 'production'
    ? (process.env.ADMIN_KEY ?? null)
    : (process.env.ADMIN_KEY ?? 'dev-admin-secret-key-mitea');

/**
 * Enforces authentication. Throws AuthError (401) if not logged in.
 */
export async function requireAuth(request?: Request) {
  if (request && ADMIN_DEV_KEY) {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey && adminKey === ADMIN_DEV_KEY) {
      return {
        user: { id: 'admin-dev-user', email: 'admin@mitea.com' } as any,
        profile: { id: 'admin-dev-user', email: 'admin@mitea.com', role: 'ADMIN' } as any,
      };
    }
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError();
  }

  const profile = await getCurrentProfile();
  return { user, profile };
}

import { getAdminSession } from '@/lib/admin-auth';

/**
 * Enforces admin role. Throws ForbiddenError (403) if user is not an admin.
 */
export async function requireAdmin(request?: Request) {
  // 1. Check API key — only active if ADMIN_KEY is explicitly set (never uses hardcoded default in prod)
  if (request && ADMIN_DEV_KEY) {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey && adminKey === ADMIN_DEV_KEY) {
      return {
        user: { id: 'master-admin', email: 'admin@mitea.com' } as any,
        profile: { id: 'master-admin', email: 'admin@mitea.com', role: 'ADMIN' } as any,
      };
    }
  }

  // 2. Check dedicated Admin session cookie
  const adminSession = await getAdminSession();
  if (adminSession) {
    return {
      user: { id: 'master-admin', email: adminSession.email } as any,
      profile: { id: 'master-admin', email: adminSession.email, role: 'ADMIN' } as any,
    };
  }

  // 3. Fallback: check regular auth profile
  const { user, profile } = await requireAuth();

  if (!profile || profile.role !== 'ADMIN') {
    throw new ForbiddenError();
  }

  return { user, profile };
}
