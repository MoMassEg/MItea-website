import { NextResponse } from 'next/server';
import { requireAdmin, AuthError, ForbiddenError } from '@/lib/auth-helpers';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured, getAllDevUsers, updateDevUserRole, deleteDevUser } from '@/lib/dev-auth';

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
    const role = searchParams.get('role');
    const query = searchParams.get('q')?.toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const db = createAdminClient();
        let queryBuilder = db.from('profiles').select('*').order('created_at', { ascending: false });

        if (role) {
          queryBuilder = queryBuilder.eq('role', role as any);
        }

        const { data: profiles, error } = await queryBuilder;

        if (!error && profiles) {
          let results = profiles;
          if (query) {
            results = results.filter(
              (p: any) =>
                p.name?.toLowerCase().includes(query) ||
                p.email?.toLowerCase().includes(query) ||
                p.phone?.toLowerCase().includes(query)
            );
          }
          return NextResponse.json({ success: true, users: results });
        }
      } catch (err) {
        console.warn('[AdminUsers] Supabase query failed, falling back to in-memory:', err);
      }
    }

    // In-memory dev fallback
    let users = getAllDevUsers().map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone || null,
      role: u.role,
      avatar_url: null,
      created_at: u.createdAt,
    }));

    if (role) {
      users = users.filter((u) => u.role === role);
    }
    if (query) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.phone && u.phone.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('[AdminUsers] Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { id, role, name, phone } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        const db = createAdminClient();
        const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (role) updatePayload.role = role;
        if (name !== undefined) updatePayload.name = name;
        if (phone !== undefined) updatePayload.phone = phone;

        const { data, error } = await db
          .from('profiles')
          .update(updatePayload as any)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, user: data });
        }
      } catch (err) {
        console.warn('[AdminUsers] Supabase update failed, fallback to in-memory:', err);
      }
    }

    // In-memory fallback
    if (role) {
      const updated = updateDevUserRole(id, role);
      if (updated) {
        return NextResponse.json({
          success: true,
          user: {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            phone: updated.phone || null,
            role: updated.role,
            created_at: updated.createdAt,
          },
        });
      }
    }

    return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
  } catch (error: any) {
    console.error('[AdminUsers] Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error?.message },
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

    if (!id) {
      return NextResponse.json({ error: 'Query parameter ?id=... is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        const db = createAdminClient();
        await db.from('profiles').delete().eq('id', id);
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
      } catch (err) {
        console.warn('[AdminUsers] Supabase delete failed, fallback to in-memory:', err);
      }
    }

    const deleted = deleteDevUser(id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('[AdminUsers] Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error?.message },
      { status: 500 }
    );
  }
}
