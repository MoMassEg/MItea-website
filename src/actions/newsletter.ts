'use server';

import { subscribeSchema } from '@/lib/validators/newsletter';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from '@/lib/newsletter-service';

export async function subscribe(email: string, name?: string) {
  try {
    const validated = subscribeSchema.safeParse({ email, name });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Please enter a valid email address',
      };
    }

    const result = await subscribeToNewsletter(validated.data.email, validated.data.name);
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to subscribe to newsletter',
    };
  }
}

export async function unsubscribeAction(token: string) {
  try {
    const result = await unsubscribeFromNewsletter(token);
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to unsubscribe',
    };
  }
}
