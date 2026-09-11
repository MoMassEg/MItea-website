import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'mitea_admin_session';

// ADMIN_SESSION_SECRET must be explicitly set in production — no hardcoded fallback.
const ADMIN_SECRET = (() => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('ADMIN_SESSION_SECRET environment variable must be set in production.');
  }
  return secret || 'mitea-dedicated-master-admin-secret-2026-xyz';
})();

export function getMasterAdminCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (process.env.NODE_ENV === 'production') {
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in production.');
    }
    return { email: email.toLowerCase().trim(), password };
  }

  // Dev fallback — never used in production
  return {
    email: (email || 'admin@mitea.com').toLowerCase().trim(),
    password: password || 'admin123456',
  };
}

export function verifyAdminCredentials(email: string, pass: string): boolean {
  const master = getMasterAdminCredentials();
  const cleanEmail = email.toLowerCase().trim();
  return cleanEmail === master.email && pass === master.password;
}

export function createAdminSessionToken(): string {
  const master = getMasterAdminCredentials();
  const payload = {
    role: 'ADMIN',
    email: master.email,
    name: 'Master Administrator',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

export function verifyAdminSessionToken(token: string): {
  valid: boolean;
  email?: string;
  name?: string;
} {
  try {
    if (!token || !token.includes('.')) return { valid: false };

    const [data, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(data)
      .digest('base64url');

    if (signature !== expectedSig) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));

    if (payload.role !== 'ADMIN' || Date.now() > payload.expiresAt) {
      return { valid: false };
    }

    return { valid: true, email: payload.email, name: payload.name };
  } catch {
    return { valid: false };
  }
}

export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const verified = verifyAdminSessionToken(token);
    if (!verified.valid) return null;

    return {
      email: verified.email || 'admin@mitea.com',
      name: verified.name || 'Master Administrator',
      role: 'ADMIN',
    };
  } catch {
    return null;
  }
}
