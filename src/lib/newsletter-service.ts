import { createAdminClient } from '@/lib/supabase/admin';
import { sendNewsletterWelcomeEmail } from '@/lib/email';

export interface NewsletterSubscriberRecord {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscribed_at: string;
  unsubscribe_token: string;
}

const inMemorySubscribers = new Map<string, NewsletterSubscriberRecord>();

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

export async function subscribeToNewsletter(email: string, name?: string | null) {
  const cleanEmail = email.trim().toLowerCase();
  const promoCode = 'GUILD10';
  const now = new Date().toISOString();

  // Check DB first
  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data: existing } = await db
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        if (!existing.is_active) {
          // Reactivate subscriber
          await db
            .from('newsletter_subscribers')
            .update({ is_active: true, name: name || existing.name })
            .eq('id', existing.id);

          sendNewsletterWelcomeEmail(cleanEmail, existing.unsubscribe_token, promoCode);
        }

        // Cache in memory
        inMemorySubscribers.set(cleanEmail, {
          ...existing,
          is_active: true,
          name: name || existing.name,
        });

        return {
          success: true,
          isNew: false,
          promoCode,
          message: 'Welcome to the Tea Guild! Your promo code is GUILD10.',
        };
      }

      // New subscriber in DB
      const id = generateId();
      const unsubscribeToken = generateId();

      const record: NewsletterSubscriberRecord = {
        id,
        email: cleanEmail,
        name: name || null,
        is_active: true,
        subscribed_at: now,
        unsubscribe_token: unsubscribeToken,
      };

      await db.from('newsletter_subscribers').insert(record);

      inMemorySubscribers.set(cleanEmail, record);
      inMemorySubscribers.set(unsubscribeToken, record);

      sendNewsletterWelcomeEmail(cleanEmail, unsubscribeToken, promoCode);

      return {
        success: true,
        isNew: true,
        promoCode,
        message: 'Welcome to the Tea Guild! Your promo code is GUILD10.',
      };
    } catch (err) {
      console.warn('[Newsletter] DB subscribe failed, using in-memory store:', err);
    }
  }

  // In-memory fallback
  const existingMemory = inMemorySubscribers.get(cleanEmail);
  if (existingMemory) {
    existingMemory.is_active = true;
    if (name) existingMemory.name = name;

    return {
      success: true,
      isNew: false,
      promoCode,
      message: 'Welcome to the Tea Guild! Your promo code is GUILD10.',
    };
  }

  const id = generateId();
  const unsubscribeToken = generateId();
  const record: NewsletterSubscriberRecord = {
    id,
    email: cleanEmail,
    name: name || null,
    is_active: true,
    subscribed_at: now,
    unsubscribe_token: unsubscribeToken,
  };

  inMemorySubscribers.set(cleanEmail, record);
  inMemorySubscribers.set(unsubscribeToken, record);

  sendNewsletterWelcomeEmail(cleanEmail, unsubscribeToken, promoCode);

  return {
    success: true,
    isNew: true,
    promoCode,
    message: 'Welcome to the Tea Guild! Your promo code is GUILD10.',
  };
}

export async function unsubscribeFromNewsletter(token: string) {
  const cleanToken = token.trim();

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data, error } = await db
        .from('newsletter_subscribers')
        .update({ is_active: false })
        .eq('unsubscribe_token', cleanToken)
        .select('*')
        .maybeSingle();

      if (!error && data) {
        inMemorySubscribers.delete(data.email);
        return {
          success: true,
          email: data.email,
          message: 'You have been successfully unsubscribed from The Tea Guild.',
        };
      }
    } catch {
      // Fallback
    }
  }

  const memoryRecord = inMemorySubscribers.get(cleanToken);
  if (memoryRecord) {
    memoryRecord.is_active = false;
    return {
      success: true,
      email: memoryRecord.email,
      message: 'You have been successfully unsubscribed from The Tea Guild.',
    };
  }

  return {
    success: true,
    message: 'Subscription preference updated.',
  };
}

export async function getNewsletterSubscriber(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data } = await db
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data) return data;
    } catch {
      // Fallback
    }
  }

  return inMemorySubscribers.get(cleanEmail) ?? null;
}
