import { createAdminClient } from '@/lib/supabase/admin';
import { MENU_DATA } from '@/data/menu-data';
import { SubmitCateringRequestInput } from '@/lib/validators/catering';
import { sendEmail } from '@/lib/email';

// ─── In-memory fallback store ─────────────────────────────────────────────────
const inMemoryRequests = new Map<string, any>();

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
}

function generateRequestNumber(): string {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const suffix = Math.floor(100 + Math.random() * 900);
  return `CAT-${ymd}-${suffix}`;
}

function isDbEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('placeholder');
}

// ─── Calculate estimated total ────────────────────────────────────────────────

function calcEstimatedTotal(input: SubmitCateringRequestInput): {
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  total: number;
} {
  let subtotal = 0;
  let totalDrinks = 0;

  if (input.orderDetails.mode === 'custom') {
    const { drinks, toppings, bakery } = input.orderDetails;

    for (const d of drinks) {
      subtotal += d.unitPrice * d.quantity;
      totalDrinks += d.quantity;
    }
    for (const t of toppings ?? []) {
      subtotal += t.unitPrice * t.quantity;
    }
    for (const b of bakery ?? []) {
      subtotal += b.unitPrice * b.quantity;
    }
  } else {
    for (const p of input.orderDetails.packages) {
      subtotal += p.unitPrice * p.quantity;
    }
  }

  // Volume discount: 10% ≥20 drinks, 15% ≥40 drinks
  const discountPercent = totalDrinks >= 40 ? 15 : totalDrinks >= 20 ? 10 : 0;
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const total = Math.max(0, subtotal - discountAmount);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount,
    discountPercent,
    total: Number(total.toFixed(2)),
  };
}

// ─── Admin notification email ─────────────────────────────────────────────────

async function sendAdminNotification(request: any): Promise<void> {
  const adminEmail = process.env.CATERING_ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || 'orders@mitea.com';

  const mode = request.mode === 'packages' ? 'Package Order' : 'Custom Builder';
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#c8702a">🎉 New Catering Request — ${request.request_number}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;font-weight:600;color:#555;width:140px">Mode</td><td>${mode}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Name</td><td>${request.full_name}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Email</td><td>${request.email}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Phone</td><td>${request.phone || '—'}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Company</td><td>${request.company || '—'}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Event Type</td><td>${request.event_type}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Guest Count</td><td>${request.guest_count}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Event Date</td><td>${request.event_date}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Service Style</td><td>${request.service_style}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Address</td><td>${request.address || '—'}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Notes</td><td>${request.notes || '—'}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#555">Estimated Total</td><td style="color:#c8702a;font-weight:700;font-size:16px">$${request.estimated_total?.toFixed(2)}</td></tr>
      </table>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px;font-size:12px;overflow:auto">${JSON.stringify(request.order_details, null, 2)}</pre>
    </div>
  `;

  // Fire and forget
  sendEmail(adminEmail, `🎉 New Catering Request #${request.request_number} — ${request.full_name}`, html).catch(
    (err) => console.error('[Catering] Admin email error:', err)
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getCateringPackages() {
  // First try DB
  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data } = await db
        .from('menu_items')
        .select('*, category:categories(name, slug)')
        .eq('is_available', true)
        .order('sort_order', { ascending: true });

      if (data) {
        // Filter catering category items
        const packages = data.filter(
          (item: any) => item.category?.slug === 'catering' || item.category?.name?.toLowerCase() === 'catering'
        );
        if (packages.length > 0) return packages;
      }
    } catch {
      // fallthrough to static data
    }
  }

  // Fallback: static MENU_DATA
  return MENU_DATA.items.filter((item) => item.category === 'catering');
}

export async function createCateringRequest(
  input: SubmitCateringRequestInput,
  userId?: string | null
) {
  const { subtotal, discountAmount, discountPercent, total } = calcEstimatedTotal(input);
  const now = new Date().toISOString();
  const id = generateRequestId();
  const requestNumber = generateRequestNumber();

  const record = {
    id,
    request_number: requestNumber,
    user_id: userId || null,
    status: 'PENDING',
    mode: input.orderDetails.mode,
    order_details: input.orderDetails,

    // Event info
    event_type: input.eventType,
    guest_count: input.guestCount,
    event_date: input.eventDate,
    event_time: input.eventTime || null,
    service_style: input.serviceStyle,
    address: input.address || null,
    notes: input.notes || null,

    // Contact
    full_name: input.fullName,
    email: input.email,
    phone: input.phone || null,
    company: input.company || null,

    // Financials
    subtotal,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    estimated_total: total,

    created_at: now,
    updated_at: now,
  };

  // Persist to DB if available
  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const guestNumber = parseInt(input.guestCount.replace(/\D/g, ''), 10) || 20;

      await db.from('catering_requests').insert({
        id,
        user_id: userId || null,
        request_type: input.orderDetails.mode === 'packages' ? 'PACKAGE' : 'CUSTOM',
        event_date: input.eventDate,
        event_time: input.eventTime || '12:00 PM',
        guest_count: guestNumber,
        venue_address: input.address || 'In-Store Pickup',
        contact_name: input.fullName,
        contact_email: input.email,
        contact_phone: input.phone || 'N/A',
        special_instructions: [
          input.notes,
          input.company ? `Company: ${input.company}` : null,
          `Style: ${input.serviceStyle}`,
          `Event: ${input.eventType}`,
          `ReqNo: ${requestNumber}`,
        ]
          .filter(Boolean)
          .join(' | '),
        items: {
          request_number: requestNumber,
          mode: input.orderDetails.mode,
          order_details: input.orderDetails,
          subtotal,
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          estimated_total: total,
          service_style: input.serviceStyle,
          event_type: input.eventType,
          company: input.company,
        } as any,
        total_estimate: total,
        status: 'PENDING',
      });
    } catch (err) {
      console.warn('[Catering] DB insert failed, using in-memory fallback:', err);
    }
  }

  // Always store in-memory (DB may be offline, or no catering_requests table yet)
  inMemoryRequests.set(id, record);
  inMemoryRequests.set(requestNumber, record);

  // Notify admin
  sendAdminNotification(record);

  return record;
}

export function normalizeCateringRecord(row: any) {
  if (!row) return null;
  const items = row.items || {};
  return {
    ...row,
    request_number:
      row.request_number ||
      items.request_number ||
      (row.id ? `CAT-${String(row.id).slice(0, 8).toUpperCase()}` : 'CAT-REQUEST'),
    full_name: row.full_name || row.contact_name || 'Valued Client',
    email: row.email || row.contact_email || '',
    phone: row.phone || row.contact_phone || '',
    company: row.company || items.company || '',
    event_type: row.event_type || items.event_type || row.request_type || 'Catering Event',
    service_style: row.service_style || items.service_style || 'Drop-off Delivery',
    address: row.address || row.venue_address || '',
    notes: row.notes || row.special_instructions || '',
    estimated_total: Number(row.estimated_total ?? row.total_estimate ?? items.estimated_total ?? 0),
    order_details: row.order_details || items.order_details || (items.drinks ? items : null),
  };
}

export async function getCateringRequest(idOrNumber: string) {
  // Memory hit
  if (inMemoryRequests.has(idOrNumber)) {
    return normalizeCateringRecord(inMemoryRequests.get(idOrNumber));
  }

  if (!isDbEnabled()) return null;

  try {
    const db = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);

    if (isUuid) {
      const { data } = await db
        .from('catering_requests')
        .select('*')
        .eq('id', idOrNumber)
        .maybeSingle();
      if (data) return normalizeCateringRecord(data);
    }

    const { data } = await db
      .from('catering_requests')
      .select('*')
      .contains('items', { request_number: idOrNumber })
      .maybeSingle();

    return data ? normalizeCateringRecord(data) : null;
  } catch {
    return null;
  }
}

export async function getUserCateringRequests(userId: string) {
  if (!isDbEnabled()) {
    return Array.from(inMemoryRequests.values())
      .filter((r) => r.user_id === userId)
      .map(normalizeCateringRecord)
      .sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
  }

  try {
    const db = createAdminClient();
    const { data } = await db
      .from('catering_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data ?? []).map(normalizeCateringRecord);
  } catch {
    return [];
  }
}

export async function listAllCateringRequests(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      let query = db.from('catering_requests').select('*', { count: 'exact' });

      if (filters?.status) {
        query = query.eq('status', filters.status as any);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data) {
        return {
          requests: data.map(normalizeCateringRecord),
          total: count ?? data.length,
          limit,
          offset,
        };
      }
    } catch {
      // Fallback
    }
  }

  // In-memory fallback
  let all = Array.from(inMemoryRequests.values()).filter(
    (r, idx, self) => self.findIndex((s) => s.id === r.id) === idx
  );

  if (filters?.status) {
    all = all.filter((r) => r.status?.toUpperCase() === filters.status?.toUpperCase());
  }

  all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const paginated = all.slice(offset, offset + limit).map(normalizeCateringRecord);

  return {
    requests: paginated,
    total: all.length,
    limit,
    offset,
  };
}

export async function updateCateringRequestStatus(
  idOrNumber: string,
  status: string,
  adminNotes?: string
) {
  const req = await getCateringRequest(idOrNumber);
  if (!req) return null;

  req.status = status;
  req.updated_at = new Date().toISOString();
  if (adminNotes !== undefined) {
    req.admin_notes = adminNotes;
  }

  inMemoryRequests.set(req.id, req);
  if (req.request_number) {
    inMemoryRequests.set(req.request_number, req);
  }

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const updateData: Record<string, any> = {
        status,
        updated_at: req.updated_at,
      };
      if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
      }
      await db.from('catering_requests').update(updateData as any).eq('id', req.id);
    } catch (err) {
      console.warn('[Catering] DB update failed:', err);
    }
  }

  // Trigger customer notification if request has a user_id
  if (req.user_id) {
    import('@/lib/notifications')
      .then(({ createNotification }) => {
        createNotification(
          req.user_id,
          'CATERING_UPDATE',
          `Catering Request ${status.charAt(0) + status.slice(1).toLowerCase()} 🧋`,
          `Your catering request #${req.request_number || req.id.slice(0, 8)} status is now ${status}.`,
          { cateringRequestId: req.id, status }
        );
      })
      .catch(() => {});
  }

  return req;
}
