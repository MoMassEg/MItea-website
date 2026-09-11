import { createAdminClient } from '@/lib/supabase/admin';

export interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  data: any | null;
  created_at: string;
}

// ─── In-Memory Fallback Store ─────────────────────────────────────────────────

const inMemoryNotifications = new Map<string, NotificationRecord[]>();

function isDbEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('placeholder');
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
}

// ─── Public Notification Helper Functions ────────────────────────────────────

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: any
): Promise<NotificationRecord> {
  const id = generateId();
  const now = new Date().toISOString();

  const record: NotificationRecord = {
    id,
    user_id: userId,
    type,
    title,
    body,
    is_read: false,
    data: data ?? null,
    created_at: now,
  };

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      await db.from('notifications').insert(record);
    } catch (err) {
      console.warn('[Notification] DB insert failed, using in-memory fallback:', err);
    }
  }

  // In-memory store
  const list = inMemoryNotifications.get(userId) || [];
  list.unshift(record);
  inMemoryNotifications.set(userId, list);

  return record;
}

export async function getUserNotifications(
  userId: string,
  limitOrOptions?: number | { limit?: number; offset?: number },
  offsetArg?: number
): Promise<{
  notifications: NotificationRecord[];
  total: number;
  unreadCount: number;
}> {
  let limit = 20;
  let offset = 0;

  if (typeof limitOrOptions === 'object' && limitOrOptions !== null) {
    if (typeof limitOrOptions.limit === 'number') limit = limitOrOptions.limit;
    if (typeof limitOrOptions.offset === 'number') offset = limitOrOptions.offset;
  } else if (typeof limitOrOptions === 'number') {
    limit = limitOrOptions;
    if (typeof offsetArg === 'number') offset = offsetArg;
  }
  if (isDbEnabled()) {
    try {
      const db = createAdminClient();

      const [itemsRes, unreadRes] = await Promise.all([
        db
          .from('notifications')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1),
        db
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false),
      ]);

      if (!itemsRes.error && itemsRes.data) {
        return {
          notifications: itemsRes.data as NotificationRecord[],
          total: itemsRes.count ?? itemsRes.data.length,
          unreadCount: unreadRes.count ?? 0,
        };
      }
    } catch {
      // Fallback
    }
  }

  const list = inMemoryNotifications.get(userId) || [];
  const unreadCount = list.filter((n) => !n.is_read).length;
  const paginated = list.slice(offset, offset + limit);

  return {
    notifications: paginated,
    total: list.length,
    unreadCount,
  };
}

export async function markNotificationAsRead(
  id: string,
  userId: string
): Promise<NotificationRecord | null> {
  const now = new Date().toISOString();

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data, error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();

      if (!error && data) {
        // Update in-memory if present
        const list = inMemoryNotifications.get(userId) || [];
        const item = list.find((n) => n.id === id);
        if (item) item.is_read = true;

        return data as NotificationRecord;
      }
    } catch {
      // Fallback
    }
  }

  const list = inMemoryNotifications.get(userId) || [];
  const item = list.find((n) => n.id === id);
  if (item) {
    item.is_read = true;
    return item;
  }

  return null;
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean; count: number }> {
  let count = 0;

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data, error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id');

      if (!error && data) {
        count = data.length;
      }
    } catch {
      // Fallback
    }
  }

  const list = inMemoryNotifications.get(userId) || [];
  list.forEach((n) => {
    if (!n.is_read) {
      n.is_read = true;
      count++;
    }
  });

  return { success: true, count };
}
