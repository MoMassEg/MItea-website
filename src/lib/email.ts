import nodemailer from 'nodemailer';

// ─── Gmail SMTP Transport ─────────────────────────────────────────────────────

type Transporter = ReturnType<typeof nodemailer.createTransport>;

let _transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass || user.includes('placeholder') || pass.includes('placeholder')) return null;

  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // STARTTLS on port 587
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }
  return _transporter;
}

export function isEmailConfigured(): boolean {
  return getTransporter() !== null;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[Email] SMTP not configured — skipping email to ${to} (demo mode)`);
    return false;
  }

  const from = process.env.EMAIL_FROM || `MiTea Orders <${process.env.SMTP_USER}>`;

  try {
    await transporter.sendMail({ from, to, subject, html });
    console.log(`[Email] ✅ Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error('[Email] Failed to send email:', err);
    return false;
  }
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Welcome to MiTea</title></head>
<body style="margin:0;padding:0;background:#FFF6F2;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF6F2;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#F8847F 0%,#f56b65 100%);padding:36px 40px;text-align:center;">
          <div style="font-size:36px;font-weight:900;color:#fff;letter-spacing:-1px;">🧋 MiTea</div>
          <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.8);letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Artisanal Boba &amp; Mochi</div>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#1a1a1a;">Welcome, ${firstName}! 🎉</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            Your MiTea VIP Guild account is ready. Start exploring our handcrafted milk teas, fruit blends, and Japanese mochi donuts — and earn a <strong>free drink</strong> after 10 orders!
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF6F2;border-radius:16px;padding:20px;margin-bottom:28px;">
            <tr><td align="center">
              <div style="font-size:14px;font-weight:700;color:#F8847F;margin-bottom:8px;">Your perks as a VIP member</div>
              <ul style="text-align:left;color:#444;font-size:13px;line-height:2;margin:0 auto;max-width:280px;padding-left:20px;">
                <li>🎁 Earn stamps with every order</li>
                <li>🚀 Fast checkout — your info saved</li>
                <li>📦 Full order history</li>
                <li>🎊 Free drink on your 10th stamp</li>
              </ul>
            </td></tr>
          </table>
          <div style="text-align:center;">
            <a href="${appUrl}" style="display:inline-block;background:#F8847F;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:100px;text-decoration:none;">Start Ordering →</a>
          </div>
        </td></tr>
        <tr><td style="background:#FFF6F2;padding:24px 40px;border-top:1px solid #FFE8E6;text-align:center;">
          <p style="margin:0;font-size:11px;color:#999;">MiTea · Golden Valley, MN · <a href="${appUrl}" style="color:#F8847F;text-decoration:none;">mitea.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await sendEmail(to, `Welcome to MiTea, ${firstName}! 🧋`, html);
}



function formatCurrency(amount: number | string): string {
  return `$${Number(amount).toFixed(2)}`;
}

function buildItemsTable(items: any[]): string {
  if (!items?.length) return '<p style="color:#888">No items found.</p>';

  const rows = items
    .map((item) => {
      const customizations = [
        item.size,
        item.sugar_level ? `Sugar: ${item.sugar_level}` : undefined,
        item.ice_level ? `Ice: ${item.ice_level}` : undefined,
        item.toppings?.length ? `Toppings: ${item.toppings.join(', ')}` : undefined,
        item.special_instructions,
      ]
        .filter(Boolean)
        .join(' · ');

      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8d5;">
            <strong style="color:#2d1b0e">${item.name ?? 'Item'}</strong>
            ${customizations ? `<br><span style="font-size:12px;color:#8B6F47">${customizations}</span>` : ''}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8d5;text-align:center;color:#5c3d1e">×${item.quantity ?? 1}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8d5;text-align:right;color:#2d1b0e;font-weight:600">
            ${formatCurrency((item.unit_price ?? item.unitPrice ?? 0) * (item.quantity ?? 1))}
          </td>
        </tr>`;
    })
    .join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
      <thead>
        <tr>
          <th style="text-align:left;padding-bottom:8px;color:#8B6F47;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Item</th>
          <th style="text-align:center;padding-bottom:8px;color:#8B6F47;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
          <th style="text-align:right;padding-bottom:8px;color:#8B6F47;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildTotalsSection(order: any): string {
  const rows: string[] = [];

  const addRow = (label: string, value: number | string, highlight = false) => {
    const color = highlight ? '#c8702a' : '#5c3d1e';
    const weight = highlight ? '700' : '400';
    rows.push(`
      <tr>
        <td style="padding:4px 0;color:${color};font-weight:${weight}">${label}</td>
        <td style="padding:4px 0;text-align:right;color:${color};font-weight:${weight}">${formatCurrency(value)}</td>
      </tr>`);
  };

  addRow('Subtotal', order.subtotal ?? 0);
  if (Number(order.delivery_fee ?? 0) > 0) addRow('Delivery Fee', order.delivery_fee);
  if (Number(order.discount_amount ?? order.discount ?? 0) > 0)
    addRow('Promo Discount', -(Number(order.discount_amount ?? order.discount)));
  addRow('Tax (8.025%)', order.tax_amount ?? order.tax ?? 0);
  if (Number(order.tip_amount ?? order.tip ?? 0) > 0) addRow('Tip', order.tip_amount ?? order.tip);
  addRow('Total', order.total ?? 0, true);

  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:8px">${rows.join('')}</table>`;
}

function buildOrderConfirmationHtml(order: any): string {
  const orderType: string = order.order_type ?? order.orderType ?? 'PICKUP';
  const isDelivery = orderType === 'DELIVERY';
  const estimatedTime = order.estimated_ready_time
    ? new Date(order.estimated_ready_time).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '25–35 minutes';

  const deliveryAddress = order.delivery_address
    ? typeof order.delivery_address === 'string'
      ? order.delivery_address
      : [
          order.delivery_address.street,
          order.delivery_address.city,
          order.delivery_address.state,
          order.delivery_address.zip,
        ]
          .filter(Boolean)
          .join(', ')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>MiTea Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#fdf8f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;padding:32px 16px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c8702a 0%,#e8923a 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px">🧋 MiTea</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:2px;text-transform:uppercase">Order Confirmed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fff;padding:32px;border-left:1px solid #f0e8d5;border-right:1px solid #f0e8d5">

              <p style="margin:0 0 24px;color:#2d1b0e;font-size:16px">
                Hi <strong>${order.customer_name ?? 'there'}</strong> 👋,<br>
                Your order has been received and confirmed. We can't wait to make your drinks!
              </p>

              <!-- Order Meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px">
                <tr>
                  <td style="color:#8B6F47;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Order Number</td>
                  <td style="text-align:right;color:#c8702a;font-size:18px;font-weight:800">#${order.order_number}</td>
                </tr>
                <tr>
                  <td style="color:#8B6F47;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;padding-top:8px">Order Type</td>
                  <td style="text-align:right;color:#2d1b0e;font-weight:600;padding-top:8px">${isDelivery ? '🚗 Delivery' : '🏪 Pickup'}</td>
                </tr>
                <tr>
                  <td style="color:#8B6F47;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;padding-top:8px">${isDelivery ? 'Estimated Delivery' : 'Ready By'}</td>
                  <td style="text-align:right;color:#2d1b0e;font-weight:600;padding-top:8px">${estimatedTime}</td>
                </tr>
                ${isDelivery && deliveryAddress ? `
                <tr>
                  <td style="color:#8B6F47;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;padding-top:8px">Delivery Address</td>
                  <td style="text-align:right;color:#2d1b0e;font-weight:600;padding-top:8px">${deliveryAddress}</td>
                </tr>` : ''}
              </table>

              <!-- Items -->
              <h2 style="margin:0 0 16px;color:#2d1b0e;font-size:16px;font-weight:700">Your Order</h2>
              ${buildItemsTable(order.items ?? [])}

              <!-- Totals -->
              <div style="margin-top:20px;padding-top:16px;border-top:2px solid #f0e8d5">
                ${buildTotalsSection(order)}
              </div>

              <!-- Special Instructions -->
              ${order.special_instructions ? `
              <div style="margin-top:24px;padding:16px;background:#fff8ee;border-left:3px solid #c8702a;border-radius:0 8px 8px 0">
                <p style="margin:0;font-size:13px;color:#8B6F47;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Special Instructions</p>
                <p style="margin:6px 0 0;color:#2d1b0e;font-size:14px">${order.special_instructions}</p>
              </div>` : ''}

              <p style="margin:32px 0 0;color:#8B6F47;font-size:13px;text-align:center">
                Questions? Reply to this email or call us. We're here to help! 🍵
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fdf8f0;border:1px solid #f0e8d5;border-top:none;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center">
              <p style="margin:0;color:#8B6F47;font-size:12px">
                © ${new Date().getFullYear()} MiTea · Minnesota's favorite boba shop 🧋
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildGiftCardHtml(card: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your MiTea E-Gift Card</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F4EE;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2D1B0E">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F4EE;padding:30px 15px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid #EAE3D2">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #2D5A3D 0%, #1B3C27 100%);padding:36px 30px;text-align:center;color:#ffffff">
              <span style="font-size:32px">🧋✨</span>
              <h1 style="margin:10px 0 4px;font-size:26px;font-weight:800;letter-spacing:-0.5px">You Got Boba!</h1>
              <p style="margin:0;font-size:14px;color:#D3E3D6;font-weight:500">${card.occasion || 'Thinking of You'}</p>
            </td>
          </tr>

          <!-- Card Content -->
          <tr>
            <td style="padding:32px 30px">
              <p style="font-size:16px;line-height:1.5;margin:0 0 16px">
                Hi <strong>${card.recipient_name}</strong>,
              </p>
              <p style="font-size:15px;line-height:1.6;color:#4A3B32;margin:0 0 24px">
                <strong>${card.sender_name}</strong> just sent you a <strong>$${Number(card.amount).toFixed(2)}</strong> MiTea digital gift card!
              </p>

              ${card.message ? `
              <div style="background:#FAF7F2;border-left:4px solid #DF9749;padding:16px 20px;border-radius:0 16px 16px 0;margin-bottom:24px">
                <p style="margin:0;font-style:italic;font-size:14px;color:#5A4A3E;line-height:1.6">
                  “${card.message}”
                </p>
                <p style="margin:8px 0 0;font-size:12px;font-weight:700;color:#DF9749">— ${card.sender_name}</p>
              </div>` : ''}

              <!-- Digital Gift Voucher Box -->
              <div style="background:#1B3C27;border-radius:18px;padding:24px;text-align:center;color:#ffffff;box-shadow:0 6px 20px rgba(27,60,39,0.2);margin-bottom:28px">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#A9C9B2;font-weight:700">Digital Gift Voucher</p>
                <div style="font-size:36px;font-weight:900;color:#F6D365;margin-bottom:12px">$${Number(card.amount).toFixed(2)}</div>
                <div style="display:inline-block;background:#ffffff;color:#1B3C27;font-family:monospace;font-size:18px;font-weight:800;letter-spacing:2px;padding:10px 20px;border-radius:12px;border:2px dashed #DF9749">
                  ${card.code}
                </div>
                <p style="margin:12px 0 0;font-size:11px;color:#D3E3D6">Present this code at checkout online or in-store</p>
              </div>

              <div style="text-align:center">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mitea.com'}" style="display:inline-block;background:#F8847F;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;box-shadow:0 4px 14px rgba(248,132,127,0.4)">
                  Order Online & Redeem →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F2ECE4;padding:20px;text-align:center;font-size:12px;color:#7A6E65">
              MiTea · Handcrafted Artisanal Boba & Teas<br>
              Golden Valley, Minneapolis, MN
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmation(order: any): Promise<void> {
  const email = order.customer_email;
  if (!email) {
    console.warn('[Email] sendOrderConfirmation: no customer_email on order — skipping');
    return;
  }

  const html = buildOrderConfirmationHtml(order);
  const subject = `Order Confirmed — #${order.order_number} 🧋`;

  // Fire-and-forget: errors are logged but never thrown
  sendEmail(email, subject, html).catch((err) =>
    console.error('[Email] sendOrderConfirmation unexpected error:', err)
  );
}

export async function sendGiftCardEmail(card: any): Promise<void> {
  const email = card.recipient_email;
  if (!email) {
    console.warn('[Email] sendGiftCardEmail: no recipient_email on gift card — skipping');
    return;
  }

  const html = buildGiftCardHtml(card);
  const subject = `🎁 ${card.sender_name} sent you a $${Number(card.amount).toFixed(2)} MiTea Gift Card! 🧋`;

  sendEmail(email, subject, html).catch((err) =>
    console.error('[Email] sendGiftCardEmail unexpected error:', err)
  );
}

export function buildNewsletterWelcomeHtml(
  email: string,
  unsubscribeToken: string,
  promoCode: string = 'GUILD10'
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${appUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to The Tea Guild</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F4EE;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2D1B0E">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F4EE;padding:30px 15px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid #EAE3D2">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #DF9749 0%, #B86B1E 100%);padding:36px 30px;text-align:center;color:#ffffff">
              <span style="font-size:32px">🍵✨</span>
              <h1 style="margin:10px 0 4px;font-size:26px;font-weight:800;letter-spacing:-0.5px">Welcome to The Tea Guild</h1>
              <p style="margin:0;font-size:14px;color:#FFF3E0;font-weight:500">A private circle for curious palates</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 30px">
              <p style="font-size:16px;line-height:1.6;margin:0 0 16px;color:#2D1B0E">
                Welcome to our inner circle! You've joined a dedicated community of tea purists and boba enthusiasts across the Twin Cities.
              </p>

              <!-- VIP Promo Box -->
              <div style="background:#FAF7F2;border:2px dashed #DF9749;border-radius:18px;padding:24px;text-align:center;margin:24px 0">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#DF9749;font-weight:800">Your VIP Welcome Gift</p>
                <div style="font-size:30px;font-weight:900;color:#2D1B0E;margin-bottom:8px">10% OFF INAUGURAL ORDER</div>
                <div style="display:inline-block;background:#ffffff;color:#DF9749;font-family:monospace;font-size:20px;font-weight:800;letter-spacing:2px;padding:10px 24px;border-radius:12px;border:1px solid #EAE3D2;box-shadow:0 2px 8px rgba(0,0,0,0.04)">
                  ${promoCode}
                </div>
                <p style="margin:12px 0 0;font-size:12px;color:#7A6E65">Apply this code at checkout on your next order</p>
              </div>

              <div style="background:#F7F4EE;border-radius:16px;padding:20px;margin-bottom:24px">
                <h4 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#8B6F47">Your Member Privileges</h4>
                <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.8;color:#4A3B32">
                  <li>48h early reservation window for seasonal single-origin tea harvests</li>
                  <li>Invitations to exclusive cupping sessions & live tasting flights</li>
                  <li>Monthly secret drink recipes curated by our master brewers</li>
                </ul>
              </div>

              <div style="text-align:center">
                <a href="${appUrl}" style="display:inline-block;background:#DF9749;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;box-shadow:0 4px 14px rgba(223,151,73,0.4)">
                  Explore Our Menu & Order →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F2ECE4;padding:20px;text-align:center;font-size:11px;color:#8B7E74">
              MiTea · Handcrafted Artisanal Boba & Teas<br>
              7724 Olson Memorial Hwy, Golden Valley, MN 55427<br><br>
              You received this email because you subscribed to The Tea Guild.
              <br>
              <a href="${unsubscribeUrl}" style="color:#B86B1E;text-decoration:underline">Unsubscribe from future updates</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendNewsletterWelcomeEmail(
  email: string,
  unsubscribeToken: string,
  promoCode: string = 'GUILD10'
): Promise<void> {
  const html = buildNewsletterWelcomeHtml(email, unsubscribeToken, promoCode);
  const subject = `🍵 Welcome to The Tea Guild — Here is your 10% Off code: ${promoCode}`;

  sendEmail(email, subject, html).catch((err) =>
    console.error('[Email] sendNewsletterWelcomeEmail unexpected error:', err)
  );
}


