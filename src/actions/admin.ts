'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import {
  getAllOrdersForAdmin,
  getOrderStatsForAdmin,
  updateOrderStatus,
  AdminOrderFilters,
} from '@/lib/order-service';
import {
  createMenuItem,
  updateMenuItem,
  deactivateMenuItem,
} from '@/lib/menu-service';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from '@/lib/validators/admin-menu';
import {
  listAllCateringRequests,
  updateCateringRequestStatus,
} from '@/lib/catering-service';

export async function getAdminOrdersAction(filters?: AdminOrderFilters) {
  try {
    await requireAdmin();
    const result = await getAllOrdersForAdmin(filters);
    return { success: true, ...result };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch admin orders' };
  }
}

export async function getAdminStatsAction() {
  try {
    await requireAdmin();
    const stats = await getOrderStatsForAdmin();
    return { success: true, stats };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch admin stats' };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  paymentStatus?: string
) {
  try {
    await requireAdmin();
    const updated = await updateOrderStatus(orderId, status, paymentStatus);
    if (!updated) {
      return { success: false, error: 'Order not found' };
    }
    return { success: true, order: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update order status' };
  }
}

export async function createMenuItemAction(data: CreateMenuItemInput) {
  try {
    await requireAdmin();
    const parsed = createMenuItemSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid menu item data' };
    }
    const item = await createMenuItem(parsed.data);
    return { success: true, item };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create menu item' };
  }
}

export async function updateMenuItemAction(data: UpdateMenuItemInput) {
  try {
    await requireAdmin();
    const parsed = updateMenuItemSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid update payload' };
    }
    const item = await updateMenuItem(parsed.data);
    if (!item) {
      return { success: false, error: 'Menu item not found' };
    }
    return { success: true, item };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update menu item' };
  }
}

export async function deactivateMenuItemAction(id: string) {
  try {
    await requireAdmin();
    const success = await deactivateMenuItem(id);
    if (!success) {
      return { success: false, error: 'Menu item not found' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to deactivate menu item' };
  }
}

export async function getAdminCateringAction(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    await requireAdmin();
    const result = await listAllCateringRequests(filters);
    return { success: true, ...result };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch catering requests' };
  }
}

export async function updateCateringStatusAction(
  id: string,
  status: string,
  adminNotes?: string
) {
  try {
    await requireAdmin();
    const updated = await updateCateringRequestStatus(id, status, adminNotes);
    if (!updated) {
      return { success: false, error: 'Catering request not found' };
    }
    return { success: true, request: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update catering request' };
  }
}
