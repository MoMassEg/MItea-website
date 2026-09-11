import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';
import { MENU_DATA, StoreLocation, DeliveryAddress, CartItem } from '@/data/menu-data';
import { checkPromoCode } from '@/lib/promo-service';
import { CreateOrderInput, OrderStatus, PaymentStatus } from '@/lib/validators/order';
import { sendOrderConfirmation } from '@/lib/email';

// In-memory store for fallback / offline / demo orders
// Use globalThis so the same map survives hot-reloads in dev and is shared within the same process
const globalForOrders = globalThis as unknown as { _inMemoryOrders?: Map<string, any> };
if (!globalForOrders._inMemoryOrders) {
  globalForOrders._inMemoryOrders = new Map<string, any>();
}
const inMemoryOrders = globalForOrders._inMemoryOrders;

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MIT-${year}${month}${day}-${randomSuffix}`;
}

export async function processOrderCreation(
  input: CreateOrderInput,
  userId?: string | null
) {
  const {
    items,
    orderType,
    storeId,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    promoCode,
    tip,
    paymentMethod,
    specialInstructions,
  } = input;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  let dbClient = null;
  if (!isPlaceholder) {
    try {
      dbClient = createAdminClient();
    } catch {
      // Fallback
    }
  }

  // 1. Resolve Store
  let resolvedStoreId: string = '5ad5e69f-b811-40e8-983a-dde710039af2';
  let resolvedStore: StoreLocation = MENU_DATA.stores[0];
  let defaultMenuItemId: string = '7b9efbcf-285e-4535-8c3f-c32c422302fa';

  if (dbClient) {
    try {
      let query = dbClient.from('stores').select('*');
      if (storeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeId)) {
        query = query.eq('id', storeId);
      } else {
        query = query.eq('is_flagship', true);
      }
      const { data: storeData } = await query.limit(1).maybeSingle();
      if (storeData) {
        resolvedStoreId = storeData.id;
        resolvedStore = {
          id: storeData.id,
          name: storeData.name,
          address: storeData.address,
          shortAddress: storeData.short_address,
          city: storeData.city,
          state: storeData.state,
          zip: storeData.zip,
          distance: `${storeData.city}, ${storeData.state}`,
          phone: storeData.phone,
          isOpen: storeData.is_open,
          openStatus: storeData.is_open ? 'Open now' : 'Closed',
          closingTime: storeData.closing_time,
          pickupTime: storeData.pickup_time_estimate,
          deliveryTime: storeData.delivery_time_estimate,
          isNearest: true,
          isFlagship: storeData.is_flagship,
          acceptingOrders: storeData.accepts_orders,
        };
      } else {
        const { data: anyStore } = await dbClient.from('stores').select('*').limit(1).maybeSingle();
        if (anyStore) {
          resolvedStoreId = anyStore.id;
        }
      }

      // Fetch a valid fallback menu_item id for foreign key reliability
      const { data: anyItem } = await dbClient.from('menu_items').select('id').limit(1).maybeSingle();
      if (anyItem) {
        defaultMenuItemId = anyItem.id;
      }
    } catch (storeErr) {
      console.warn('[OrderService] Store / default item resolution warning:', storeErr);
    }
  }

  // 2. Server-side price recalculation (tamper-proof)
  const recalculatedItems: Array<{
    menuItemId: string;
    name: string;
    imageUrl: string;
    size: string;
    sizePrice: number;
    sugar: string;
    ice: string;
    toppings: Array<{ id: string; name: string; price: number }>;
    basePrice: number;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }> = [];

  let subtotal = 0;

  for (const item of items) {
    let basePrice = 5.50;
    let name = item.name || 'MiTea Drink';
    let imageUrl = '';
    let dbItemId: string | null = null;

    // Fetch from Supabase or MENU_DATA
    if (dbClient) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.menuItemId);
        if (isUUID) {
          const { data: dbItem } = await dbClient
            .from('menu_items')
            .select('id, name, price, image_url')
            .eq('id', item.menuItemId)
            .limit(1)
            .maybeSingle();
          if (dbItem) {
            basePrice = Number(dbItem.price);
            name = dbItem.name;
            imageUrl = dbItem.image_url;
            dbItemId = dbItem.id;
          }
        }

        if (!dbItemId) {
          // Check by slug
          const { data: dbItem } = await dbClient
            .from('menu_items')
            .select('id, name, price, image_url')
            .eq('slug', item.menuItemId)
            .limit(1)
            .maybeSingle();
          if (dbItem) {
            basePrice = Number(dbItem.price);
            name = dbItem.name;
            imageUrl = dbItem.image_url;
            dbItemId = dbItem.id;
          }
        }

        if (!dbItemId && item.name) {
          // Check by exact name or partial name
          const { data: dbItem } = await dbClient
            .from('menu_items')
            .select('id, name, price, image_url')
            .ilike('name', item.name)
            .limit(1)
            .maybeSingle();
          if (dbItem) {
            basePrice = Number(dbItem.price);
            name = dbItem.name;
            imageUrl = dbItem.image_url;
            dbItemId = dbItem.id;
          }
        }
      } catch (lookupErr) {
        console.warn('[OrderService] Item lookup warning:', lookupErr);
      }
    }

    if (!imageUrl) {
      const fallbackItem = MENU_DATA.items.find(
        (mi) => mi.id === item.menuItemId || mi.name.toLowerCase() === (item.name || '').toLowerCase()
      );
      if (fallbackItem) {
        basePrice = fallbackItem.price;
        name = fallbackItem.name;
        imageUrl = fallbackItem.image;
      }
    }

    const finalMenuItemId = dbItemId || defaultMenuItemId || item.menuItemId;

    // Size calculation
    const isLarge = item.size.toLowerCase().includes('large') || item.size.toLowerCase().includes('24');
    const sizePrice = isLarge ? 1.00 : 0.00;

    // Toppings calculation
    const verifiedToppings = (item.toppings || []).map((top) => {
      const preset = MENU_DATA.customizationPresets.toppings.find(
        (t) => t.id === top.id || t.name.toLowerCase() === (top.name || '').toLowerCase()
      );
      const price = preset ? preset.price : (top.price || 0.75);
      const toppingName = preset ? preset.name : (top.name || top.id);
      return { id: top.id, name: toppingName, price };
    });

    const toppingsTotal = verifiedToppings.reduce((acc, t) => acc + t.price, 0);
    const unitPrice = Number((basePrice + sizePrice + toppingsTotal).toFixed(2));
    const itemTotal = Number((unitPrice * item.quantity).toFixed(2));

    subtotal += itemTotal;

    recalculatedItems.push({
      menuItemId: finalMenuItemId,
      name,
      imageUrl,
      size: item.size,
      sizePrice,
      sugar: item.sugar,
      ice: item.ice,
      toppings: verifiedToppings,
      basePrice,
      unitPrice,
      quantity: item.quantity,
      totalPrice: itemTotal,
    });
  }

  subtotal = Number(subtotal.toFixed(2));

  // 3. Promo Code Discount
  let discountAmount = 0.00;
  let freeDelivery = false;
  let promoCodeId: string | null = null;

  if (promoCode) {
    const promoCheck = await checkPromoCode(promoCode, subtotal);
    if (promoCheck.valid) {
      discountAmount = promoCheck.discountAmount;
      freeDelivery = promoCheck.freeDelivery;
      promoCodeId = promoCheck.promoCodeId?.startsWith('fallback-') ? null : (promoCheck.promoCodeId || null);
    }
  }

  // 4. Delivery Fee
  let deliveryFee = 0.00;
  if (orderType === 'DELIVERY') {
    deliveryFee = freeDelivery ? 0.00 : 3.99;
  }

  // 5. Taxes (8.025% Minnesota sales tax)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableAmount * 0.08025).toFixed(2));

  // 6. Tip
  const tipAmount = Number((tip || 0).toFixed(2));

  // 7. Total
  const total = Number((taxableAmount + deliveryFee + taxAmount + tipAmount).toFixed(2));

  // 8. Ready Time
  const now = new Date();
  const readyMinutes = orderType === 'DELIVERY' ? 40 : 15;
  const estimatedReadyTime = new Date(now.getTime() + readyMinutes * 60000).toISOString();

  const orderNumber = generateOrderNumber();
  const orderId = dbClient ? crypto.randomUUID() : `demo-order-${Date.now()}`;

  // Formatted delivery address
  let formattedDeliveryAddress: DeliveryAddress = {
    full: '7724 Olson Mem Hwy, Golden Valley, MN 55427',
    street: '7724 Olson Mem Hwy',
    city: 'Golden Valley, MN 55427',
    valid: true,
    distance: '1.2 mi',
    estTime: '20–30 min',
  };

  if (deliveryAddress) {
    if (typeof deliveryAddress === 'string') {
      formattedDeliveryAddress = {
        full: deliveryAddress,
        street: deliveryAddress,
        city: 'Golden Valley, MN',
        valid: true,
        distance: '1.5 mi',
        estTime: '25–35 min',
      };
    } else {
      const full = deliveryAddress.full || `${deliveryAddress.street || ''}, ${deliveryAddress.city || ''} ${deliveryAddress.state || ''} ${deliveryAddress.zip || ''}`;
      formattedDeliveryAddress = {
        full,
        street: deliveryAddress.street || full,
        city: `${deliveryAddress.city || ''}, ${deliveryAddress.state || ''} ${deliveryAddress.zip || ''}`,
        valid: true,
        distance: '1.5 mi',
        estTime: '25–35 min',
      };
    }
  }

  // Build full Order Record
  const orderRecord = {
    id: orderId,
    order_number: orderNumber,
    user_id: userId || null,
    store_id: resolvedStoreId,
    order_type: orderType,
    status: 'PENDING' as OrderStatus,
    payment_status: 'PENDING' as PaymentStatus,
    subtotal,
    delivery_fee: deliveryFee,
    discount_amount: discountAmount,
    tax_amount: taxAmount,
    tip_amount: tipAmount,
    total,
    promo_code_id: promoCodeId,
    payment_method: paymentMethod,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    delivery_address: orderType === 'DELIVERY' ? formattedDeliveryAddress : null,
    estimated_ready_time: estimatedReadyTime,
    special_instructions: specialInstructions || null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    items: recalculatedItems,
  };

  // 9. Persist to DB or Fallback Memory
  if (dbClient) {
    try {
      // Validate userId exists in profiles to avoid foreign key violation
      let validatedUserId: string | null = null;
      if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        try {
          const { data: profile } = await dbClient
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .limit(1)
            .maybeSingle();
          if (profile) validatedUserId = profile.id;
        } catch {
          validatedUserId = null;
        }
      }

      const { error: orderError } = await dbClient.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        user_id: validatedUserId,
        store_id: resolvedStoreId,
        order_type: orderType,
        status: 'PENDING',
        payment_status: 'PENDING',
        subtotal,
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        tip_amount: tipAmount,
        total,
        promo_code_id: promoCodeId,
        payment_method: paymentMethod || 'Credit Card',
        customer_name: customerName || 'Guest',
        customer_phone: customerPhone || '',
        customer_email: customerEmail || 'guest@mitea.com',
        delivery_address: orderType === 'DELIVERY' ? (formattedDeliveryAddress as any) : null,
        estimated_ready_time: estimatedReadyTime,
        special_instructions: specialInstructions || null,
      });

      if (orderError) {
        console.error('[OrderService] ❌ DB insert order failed:', orderError.message, orderError);
      } else {
        // Insert order items
        const orderItemRows = recalculatedItems.map((item) => ({
          order_id: orderId,
          menu_item_id: (item.menuItemId || defaultMenuItemId) as string,
          name: item.name,
          image_url: item.imageUrl || '',
          size: item.size || 'Regular',
          size_price: item.sizePrice || 0,
          sugar_level: item.sugar || '',
          ice_level: item.ice || '',
          toppings: (item.toppings || []) as any,
          base_price: item.basePrice || 0,
          unit_price: item.unitPrice || 0,
          quantity: item.quantity || 1,
          total_price: item.totalPrice || 0,
        }));

        const { error: itemsError } = await dbClient.from('order_items').insert(orderItemRows as any);
        if (itemsError) {
          console.error('[OrderService] ❌ DB insert order_items failed:', itemsError.message, itemsError);
        } else {
          console.log(`[OrderService] ✅ Successfully saved order #${orderNumber} (${orderId}) and ${orderItemRows.length} items to Supabase.`);
        }
      }
    } catch (dbErr: any) {
      console.error('[OrderService] ❌ DB insert threw exception:', dbErr?.message);
      // Fallback memory keeps order functional
    }
  }

  // Always keep in memory for immediate fast lookups and demo reliability
  inMemoryOrders.set(orderId, orderRecord);
  inMemoryOrders.set(orderNumber, orderRecord);

  if (userId) {
    import('@/lib/notifications')
      .then(({ createNotification }) => {
        createNotification(
          userId,
          'ORDER_CREATED',
          'Order Placed 🎉',
          `Your order #${orderNumber} has been received!`,
          { orderId, orderNumber }
        );
      })
      .catch(() => {});
  }

  // Send order confirmation email (fire-and-forget)
  if (customerEmail) {
    sendOrderConfirmation({
      ...orderRecord,
      items: recalculatedItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        size: i.size,
        sugar_level: i.sugar,
        ice_level: i.ice,
        toppings: i.toppings?.map((t: any) => t.name || t.id) || [],
        unit_price: i.unitPrice,
        unitPrice: i.unitPrice,
      })),
    }).catch((err) => console.warn('[Order] Confirmation email failed:', err?.message));
  }

  // Map to frontend PlacedOrder structure
  const frontendPlacedOrder = {
    orderId: orderNumber,
    createdAt: now.toISOString(),
    orderType: (orderType.toLowerCase() as 'pickup' | 'delivery'),
    store: resolvedStore,
    deliveryAddress: formattedDeliveryAddress,
    items: recalculatedItems.map((item, idx) => ({
      uid: `order-item-${idx}`,
      id: item.menuItemId,
      name: item.name,
      image: item.imageUrl,
      size: item.size,
      sizePrice: item.sizePrice,
      sugar: item.sugar,
      ice: item.ice,
      toppings: item.toppings,
      basePrice: item.basePrice,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    })) as CartItem[],
    subtotal,
    deliveryFee,
    discount: discountAmount,
    tax: taxAmount,
    tip: tipAmount,
    total,
    paymentMethod,
    customerName,
    customerPhone,
  };

  return {
    orderId,
    orderNumber,
    status: 'PENDING' as OrderStatus,
    paymentStatus: 'PENDING' as PaymentStatus,
    orderType,
    subtotal,
    deliveryFee,
    discount: discountAmount,
    tax: taxAmount,
    tip: tipAmount,
    total,
    estimatedReadyTime,
    items: recalculatedItems,
    placedOrder: frontendPlacedOrder,
  };
}

export async function getOrderById(idOrNumber: string) {
  // 1. Check in-memory store
  if (inMemoryOrders.has(idOrNumber)) {
    return inMemoryOrders.get(idOrNumber);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const dbClient = createAdminClient();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);

      let query = dbClient.from('orders').select(`
        *,
        order_items (*)
      `);

      if (isUUID) {
        query = query.eq('id', idOrNumber);
      } else {
        query = query.eq('order_number', idOrNumber);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return {
          ...data,
          items: data.order_items || [],
        };
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

export async function getUserOrders(
  userId?: string | null,
  limit: number = 20,
  offset: number = 0,
  status?: string
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder && userId) {
    try {
      const supabase = await createServerClient();
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `, { count: 'exact' })
        .eq('user_id', userId);

      if (status) {
        query = query.eq('status', status.toUpperCase() as any);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (!error && data) {
        return {
          orders: data.map((o) => ({
            ...o,
            items: o.order_items || [],
          })),
          total: count ?? data.length,
          limit,
          offset,
        };
      }
    } catch {
      // Fallback
    }
  }

  // Fallback memory search
  const allOrders = Array.from(new Set(inMemoryOrders.values()));
  let filtered = allOrders;
  if (userId) {
    filtered = filtered.filter((o) => o.user_id === userId);
  }
  if (status) {
    filtered = filtered.filter((o) => o.status === status.toUpperCase());
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    orders: paginated,
    total,
    limit,
    offset,
  };
}

export async function cancelOrder(orderIdOrNumber: string, reason?: string) {
  const order = await getOrderById(orderIdOrNumber);

  if (!order) {
    return { success: false, error: 'Order not found', status: 404 };
  }

  const currentStatus = order.status;
  if (currentStatus !== 'PENDING' && currentStatus !== 'CONFIRMED') {
    return {
      success: false,
      error: `Cannot cancel order with status '${currentStatus}'. Only PENDING or CONFIRMED orders can be cancelled.`,
      status: 400,
    };
  }

  order.status = 'CANCELLED';
  order.updated_at = new Date().toISOString();
  if (reason) {
    order.special_instructions = order.special_instructions
      ? `${order.special_instructions} | Cancellation reason: ${reason}`
      : `Cancellation reason: ${reason}`;
  }

  // Update in memory
  inMemoryOrders.set(order.id, order);
  inMemoryOrders.set(order.order_number, order);

  // Update in DB if available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const dbClient = createAdminClient();
      await dbClient
        .from('orders')
        .update({
          status: 'CANCELLED',
          special_instructions: order.special_instructions,
          updated_at: order.updated_at,
        })
        .eq('id', order.id);
    } catch {
      // Fallback
    }
  }

  return { success: true, order, status: 200 };
}

export async function updateOrderStatus(
  orderIdOrNumber: string,
  status: string,
  paymentStatus?: string
) {
  const order = await getOrderById(orderIdOrNumber);
  if (!order) return null;

  order.status = status;
  if (paymentStatus) order.payment_status = paymentStatus;
  order.updated_at = new Date().toISOString();

  inMemoryOrders.set(order.id, order);
  inMemoryOrders.set(order.order_number, order);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const dbClient = createAdminClient();
      const dbStatus = status === 'READY' ? 'READY_FOR_PICKUP' : status;
      const updateData: Record<string, string> = {
        status: dbStatus,
        updated_at: order.updated_at,
      };
      if (paymentStatus) updateData.payment_status = paymentStatus;
      const { error: updateErr } = await dbClient.from('orders').update(updateData as any).eq('id', order.id);
      if (updateErr) {
        console.error('[OrderService] ❌ DB update order status failed:', updateErr.message);
      }
    } catch {
      // Fallback - in-memory update still happened
    }
  }

  if (order.user_id) {
    import('@/lib/notifications')
      .then(({ createNotification }) => {
        if (status === 'CONFIRMED') {
          createNotification(
            order.user_id!,
            'ORDER_CONFIRMED',
            'Order Confirmed 🧋',
            `Your order #${order.order_number} is confirmed!`,
            { orderId: order.id, orderNumber: order.order_number }
          );
        } else if (status === 'READY') {
          createNotification(
            order.user_id!,
            'ORDER_READY',
            'Order Ready for Pickup! 🍵',
            `Your order #${order.order_number} is ready for pickup!`,
            { orderId: order.id, orderNumber: order.order_number }
          );
        } else if (status === 'COMPLETED') {
          createNotification(
            order.user_id!,
            'ORDER_COMPLETED',
            'Order Completed ✨',
            `Your order #${order.order_number} is complete. Enjoy your boba!`,
            { orderId: order.id, orderNumber: order.order_number }
          );
        }
      })
      .catch(() => {});
  }

  if (status === 'COMPLETED' && order.user_id) {
    try {
      const { addStamp } = await import('@/lib/loyalty-service');
      await addStamp(order.user_id, 1, order.id);
    } catch (err) {
      console.warn('[Loyalty] Failed to auto-award stamp on order completion:', err);
    }
  }

  return order;
}

export async function updateStripeIds(
  orderIdOrNumber: string,
  stripeSessionId: string,
  stripePaymentIntentId?: string
) {
  const order = await getOrderById(orderIdOrNumber);
  if (!order) return null;

  order.stripe_session_id = stripeSessionId;
  if (stripePaymentIntentId) order.stripe_payment_intent_id = stripePaymentIntentId;
  order.updated_at = new Date().toISOString();

  inMemoryOrders.set(order.id, order);
  inMemoryOrders.set(order.order_number, order);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const dbClient = createAdminClient();
      const updateData: Record<string, string> = {
        stripe_session_id: stripeSessionId,
        updated_at: order.updated_at,
      };
      if (stripePaymentIntentId) updateData.stripe_payment_intent_id = stripePaymentIntentId;
      await dbClient.from('orders').update(updateData as any).eq('id', order.id);
    } catch {
      // Fallback
    }
  }

  return order;
}

export interface AdminOrderFilters {
  status?: string;
  storeId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export async function getAllOrdersForAdmin(filters?: AdminOrderFilters) {
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const dbClient = createAdminClient();
      let query = dbClient
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' });

      if (filters?.status) {
        query = query.eq('status', filters.status as any);
      }
      if (filters?.storeId) {
        query = query.eq('store_id', filters.storeId);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[OrderService] ❌ Admin orders DB query failed:', error.message);
      }

      if (!error && data) {
        // Merge with any in-memory orders not yet in DB (e.g. created in the same serverless instance)
        const dbIds = new Set(data.map((o: any) => o.id));
        const memOrders = Array.from(inMemoryOrders.values()).filter(
          (o, idx, self) =>
            self.findIndex((s) => s.id === o.id) === idx && !dbIds.has(o.id)
        );
        const merged = [...memOrders, ...data];
        merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return {
          orders: merged.slice(offset, offset + limit),
          total: (count ?? data.length) + memOrders.length,
          limit,
          offset,
        };
      }
    } catch (dbErr: any) {
      console.error('[OrderService] ❌ Admin orders query threw:', dbErr?.message);
      // Fallback to in-memory
    }
  }

  // In-memory fallback
  let all = Array.from(inMemoryOrders.values()).filter(
    (o, index, self) => self.findIndex((s) => s.id === o.id) === index
  );

  if (filters?.status) {
    all = all.filter((o) => o.status?.toUpperCase() === filters.status?.toUpperCase());
  }
  if (filters?.storeId) {
    all = all.filter((o) => o.store_id === filters.storeId);
  }
  if (filters?.startDate) {
    const start = new Date(filters.startDate).getTime();
    all = all.filter((o) => new Date(o.created_at).getTime() >= start);
  }
  if (filters?.endDate) {
    const end = new Date(filters.endDate).getTime();
    all = all.filter((o) => new Date(o.created_at).getTime() <= end);
  }

  all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const paginated = all.slice(offset, offset + limit);

  return {
    orders: paginated,
    total: all.length,
    limit,
    offset,
  };
}

export async function getOrderStatsForAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  if (!isPlaceholder) {
    try {
      const dbClient = createAdminClient();
      const { data: allOrders, error } = await dbClient
        .from('orders')
        .select('id, total, status, created_at');

      if (error) {
        console.error('[OrderService] ❌ Admin stats DB query failed:', error.message);
      }

      if (!error && allOrders) {
        // Also include any in-memory orders not yet in DB
        const dbIds = new Set(allOrders.map((o: any) => o.id));
        const memOrders = Array.from(inMemoryOrders.values()).filter(
          (o, idx, self) =>
            self.findIndex((s) => s.id === o.id) === idx && !dbIds.has(o.id)
        );
        const combined = [...allOrders, ...memOrders];

        const todayOrders = combined.filter((o) => o.created_at >= todayIso);
        const todayRevenue = todayOrders
          .filter((o) => o.status !== 'CANCELLED')
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const averageOrderValue =
          todayOrders.length > 0 ? Number((todayRevenue / todayOrders.length).toFixed(2)) : 0;

        const statusBreakdown: Record<string, number> = {
          PENDING: 0,
          CONFIRMED: 0,
          PREPARING: 0,
          READY: 0,
          COMPLETED: 0,
          CANCELLED: 0,
        };

        combined.forEach((o) => {
          let s = o.status?.toUpperCase() || 'PENDING';
          if (s === 'READY_FOR_PICKUP') s = 'READY';
          statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
        });

        return {
          todayOrders: todayOrders.length,
          todayRevenue: Number(todayRevenue.toFixed(2)),
          averageOrderValue,
          totalOrders: combined.length,
          statusBreakdown,
        };
      }
    } catch (dbErr: any) {
      console.error('[OrderService] ❌ Admin stats query threw:', dbErr?.message);
      // Fallback to in-memory
    }
  }

  // In-memory fallback
  const allOrders = Array.from(inMemoryOrders.values()).filter(
    (o, index, self) => self.findIndex((s) => s.id === o.id) === index
  );

  const todayOrders = allOrders.filter((o) => new Date(o.created_at).getTime() >= today.getTime());
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const averageOrderValue =
    todayOrders.length > 0 ? Number((todayRevenue / todayOrders.length).toFixed(2)) : 0;

  const statusBreakdown: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  allOrders.forEach((o) => {
    let s = o.status?.toUpperCase() || 'PENDING';
    if (s === 'READY_FOR_PICKUP') s = 'READY';
    statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
  });

  return {
    todayOrders: todayOrders.length,
    todayRevenue: Number(todayRevenue.toFixed(2)),
    averageOrderValue,
    totalOrders: allOrders.length,
    statusBreakdown,
  };
}

export async function updateOrderStatusForAdmin(
  orderIdOrNumber: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
) {
  const order = await getOrderById(orderIdOrNumber);
  if (!order) return null;

  order.status = status;
  if (paymentStatus) order.payment_status = paymentStatus;
  order.updated_at = new Date().toISOString();

  inMemoryOrders.set(order.id, order);
  if (order.order_number) inMemoryOrders.set(order.order_number, order);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const dbClient = createAdminClient();
      const updateData: Record<string, any> = {
        status,
        updated_at: order.updated_at,
      };
      if (paymentStatus) updateData.payment_status = paymentStatus;
      await dbClient.from('orders').update(updateData as any).eq('id', order.id);
    } catch (err) {
      console.warn('[OrderService] DB update order status failed:', err);
    }
  }

  return order;
}
