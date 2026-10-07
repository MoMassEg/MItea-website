import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, AuthError, ForbiddenError } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

async function checkAdmin(request: Request) {
  try {
    await requireAdmin(request);
    return null;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
}

// GET: Fetch all customization presets for admin dashboard
export async function GET(request: Request) {
  try {
    const authError = await checkAdmin(request);
    if (authError) return authError;

    const supabase = createAdminClient();
    const { data: presets, error } = await supabase
      .from('customization_presets')
      .select('*')
      .order('type', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) throw error;

    const formattedPresets = (presets || []).map((p) => {
      if (p.type === 'topping' && p.value.startsWith('addon-')) {
        return { ...p, type: 'addon' };
      }
      return p;
    });

    return NextResponse.json({ success: true, items: formattedPresets });
  } catch (error: any) {
    console.error('Admin Fetch Customizations Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Create a new customization preset
export async function POST(request: Request) {
  try {
    const authError = await checkAdmin(request);
    if (authError) return authError;

    const data = await request.json();
    const supabase = createAdminClient();

    // Check if value already exists for this type
    const isAddon = data.type === 'addon';
    const dbType = isAddon ? 'topping' : data.type;
    let dbValue = data.value;
    
    if (isAddon && !dbValue.startsWith('addon-')) {
      dbValue = `addon-${dbValue}`;
    }

    const { data: existing } = await supabase
      .from('customization_presets')
      .select('id')
      .eq('type', dbType)
      .eq('value', dbValue)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, message: 'Value ID already exists for this type' }, { status: 400 });
    }

    const { data: newItem, error } = await supabase
      .from('customization_presets')
      .insert([{
        type: dbType,
        name: data.name,
        label: data.label || data.name,
        value: dbValue,
        price_delta: data.price_delta || 0,
        is_default: data.is_default !== undefined ? data.is_default : true,
        display_order: data.display_order || 0
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('Admin Create Customization Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Full update of a customization preset
export async function PUT(request: Request) {
  try {
    const authError = await checkAdmin(request);
    if (authError) return authError;

    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ success: false, message: 'Customization ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const isAddon = data.type === 'addon';
    const dbType = isAddon ? 'topping' : data.type;
    let dbValue = data.value;
    
    if (isAddon && !dbValue.startsWith('addon-')) {
      dbValue = `addon-${dbValue}`;
    }

    const { data: updatedItem, error } = await supabase
      .from('customization_presets')
      .update({
        type: dbType,
        name: data.name,
        label: data.label || data.name,
        value: dbValue,
        price_delta: data.price_delta || 0,
        is_default: data.is_default !== undefined ? data.is_default : true,
        display_order: data.display_order || 0
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error('Admin Update Customization Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH: Partial update (e.g., toggle is_default / available state)
export async function PATCH(request: Request) {
  try {
    const authError = await checkAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: updatedItem, error } = await supabase
      .from('customization_presets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error('Admin Patch Customization Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete a customization preset
export async function DELETE(request: Request) {
  try {
    const authError = await checkAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('customization_presets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Customization deleted successfully' });
  } catch (error: any) {
    console.error('Admin Delete Customization Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
