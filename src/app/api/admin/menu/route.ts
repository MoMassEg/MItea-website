import { NextResponse } from 'next/server';
import { requireAdmin, AuthError, ForbiddenError } from '@/lib/auth-helpers';
import {
  createMenuItem,
  updateMenuItem,
  deactivateMenuItem,
  deleteMenuItem,
  getMenuItemById,
} from '@/lib/menu-service';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from '@/lib/validators/admin-menu';

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

export async function POST(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const parsed = createMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid menu item data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const item = await createMenuItem(parsed.data);

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    console.error('[AdminMenu] Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const parsed = updateMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const item = await updateMenuItem(parsed.data);
    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item }, { status: 200 });
  } catch (error: any) {
    console.error('[AdminMenu] Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { id, available, price, popular } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const item = await updateMenuItem({
      id,
      ...(available !== undefined && { available }),
      ...(price !== undefined && { price: Number(price) }),
      ...(popular !== undefined && { popular }),
    });

    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item }, { status: 200 });
  } catch (error: any) {
    console.error('[AdminMenu] Error patching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to patch menu item', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isPermanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: 'Query parameter ?id=... is required' },
        { status: 400 }
      );
    }

    if (isPermanent) {
      const success = await deleteMenuItem(id);
      return NextResponse.json({
        success: true,
        message: 'Menu item permanently deleted',
        deleted: success,
      });
    }

    const success = await deactivateMenuItem(id);
    if (!success) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const updated = await getMenuItemById(id);

    return NextResponse.json({
      success: true,
      message: 'Menu item deactivated successfully',
      item: updated,
    });
  } catch (error: any) {
    console.error('[AdminMenu] Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item', details: error?.message },
      { status: 500 }
    );
  }
}
