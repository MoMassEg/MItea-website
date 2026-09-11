/**
 * Fallback In-Memory Authentication for Local Development and Demo Modes.
 * Activated when Supabase is not configured or uses placeholder credentials.
 */

export interface DevUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
}

// Global persistent storage for development session
const globalForDevAuth = globalThis as unknown as {
  inMemoryDevUsers?: Map<string, DevUser>;
};

export const inMemoryDevUsers =
  globalForDevAuth.inMemoryDevUsers ||
  new Map<string, DevUser>([
    [
      'demo@mitea.com',
      {
        id: 'usr_demo_mitea_001',
        email: 'demo@mitea.com',
        password: 'password123',
        name: 'Alex Chen',
        phone: '(555) 234-5678',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      },
    ],
    [
      'admin@mitea.com',
      {
        id: 'usr_admin_mitea_001',
        email: 'admin@mitea.com',
        password: 'adminpassword123',
        name: 'MiTea Admin',
        phone: '(555) 999-0000',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      },
    ],
  ]);

if (process.env.NODE_ENV !== 'production') {
  globalForDevAuth.inMemoryDevUsers = inMemoryDevUsers;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return !!url && !!anon && !url.includes('placeholder');
}

export function findDevUserByEmail(email: string): DevUser | null {
  const normalized = email.toLowerCase().trim();
  for (const user of inMemoryDevUsers.values()) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

export function findDevUserById(id: string): DevUser | null {
  return inMemoryDevUsers.get(id) || null;
}

export function registerDevUser(data: {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  role?: 'CUSTOMER' | 'ADMIN';
}): DevUser {
  const normalizedEmail = data.email.toLowerCase().trim();
  const id = `usr_dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newUser: DevUser = {
    id,
    email: normalizedEmail,
    password: data.password || 'password123',
    name: data.name || normalizedEmail.split('@')[0],
    phone: data.phone || '',
    role: data.role || 'CUSTOMER',
    createdAt: new Date().toISOString(),
  };

  inMemoryDevUsers.set(id, newUser);
  return newUser;
}

export const DEV_SESSION_COOKIE = 'mitea_dev_session';

export function serializeDevSession(user: DevUser): string {
  return Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    })
  ).toString('base64');
}

export function deserializeDevSession(token: string): DevUser | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed?.id || !parsed?.email) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name || parsed.email.split('@')[0],
      phone: parsed.phone || '',
      role: parsed.role || 'CUSTOMER',
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function getAllDevUsers(): DevUser[] {
  return Array.from(inMemoryDevUsers.values());
}

export function updateDevUserRole(id: string, role: 'CUSTOMER' | 'ADMIN'): DevUser | null {
  const user = inMemoryDevUsers.get(id);
  if (!user) return null;
  user.role = role;
  inMemoryDevUsers.set(id, user);
  return user;
}

export function deleteDevUser(id: string): boolean {
  return inMemoryDevUsers.delete(id);
}
