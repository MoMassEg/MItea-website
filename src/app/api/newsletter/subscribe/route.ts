import { NextResponse } from 'next/server';
import { subscribeSchema } from '@/lib/validators/newsletter';
import { subscribeToNewsletter } from '@/lib/newsletter-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Please enter a valid email address',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await subscribeToNewsletter(parsed.data.email, parsed.data.name);

    return NextResponse.json(result, {
      status: result.isNew ? 201 : 200,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}
