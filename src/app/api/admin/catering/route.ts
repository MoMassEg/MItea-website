import { NextResponse } from 'next/server';
import { requireAdmin, AuthError, ForbiddenError } from '@/lib/auth-helpers';
import {
  listAllCateringRequests,
  updateCateringRequestStatus,
  getCateringRequest,
} from '@/lib/catering-service';
import { z } from 'zod';

const updateCateringSchema = z.object({
  id: z.string().min(1, 'Catering request ID is required'),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  adminNotes: z.string().optional(),
});

async function checkAdmin(request: Request) {
  try {
    await requireAdmin(request);
    return null;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function GET(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await listAllCateringRequests({ status, limit, offset });

    return NextResponse.json({
      success: true,
      requests: result.requests,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error: any) {
    console.error('[AdminCatering] Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catering requests', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const parsed = updateCateringSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id, status, adminNotes } = parsed.data;

    const existing = await getCateringRequest(id);
    if (!existing) {
      return NextResponse.json({ error: 'Catering request not found' }, { status: 404 });
    }

    const updated = await updateCateringRequestStatus(id, status, adminNotes);

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error('[AdminCatering] Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update catering request', details: error?.message },
      { status: 500 }
    );
  }
}
