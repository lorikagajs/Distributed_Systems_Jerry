import type { OrderConfirmationEmailJobPayload } from '../email.types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function renderLineItems(
  items: OrderConfirmationEmailJobPayload['items'],
  currency: string,
): string {
  return items
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      const imageCell = item.imageUrl
        ? `<img src="${escapeHtml(item.imageUrl)}" alt="" width="64" height="64" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;" />`
        : `<div style="width:64px;height:64px;background:#f3f4f6;border-radius:8px;border:1px solid #e5e7eb;"></div>`;

      return `
        <tr>
          <td style="padding:16px 12px 16px 0;vertical-align:top;width:72px;">
            ${imageCell}
          </td>
          <td style="padding:16px 8px;vertical-align:top;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111827;">${escapeHtml(item.name)}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">Qty: ${item.quantity} × ${formatMoney(item.price, currency)}</p>
          </td>
          <td style="padding:16px 0 16px 8px;vertical-align:top;text-align:right;white-space:nowrap;">
            <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${formatMoney(lineTotal, currency)}</p>
          </td>
        </tr>`;
    })
    .join('');
}

export function buildOrderConfirmationHtml(
  data: OrderConfirmationEmailJobPayload,
): string {
  const { tenant, customerName, orderId, orderTotal, currency, items } = data;
  const primary = tenant.primaryColor || '#4f46e5';
  const secondary = tenant.secondaryColor || '#7c3aed';
  const storeName = escapeHtml(tenant.storeName);
  const logo = tenant.logoUrl
    ? `<img src="${escapeHtml(tenant.logoUrl)}" alt="${storeName}" height="40" style="display:block;max-height:40px;width:auto;" />`
    : `<span style="font-size:20px;font-weight:700;color:${primary};">${storeName}</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order confirmation #${orderId}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);color:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>${logo}</td>
                </tr>
                <tr>
                  <td style="padding-top:20px;">
                    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;line-height:1.3;">Thank you for your order!</h1>
                    <p style="margin:0;font-size:15px;opacity:0.95;">Hi ${escapeHtml(customerName)}, we've received your order and are getting it ready.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600;">Order number</p>
              <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111827;">#${orderId}</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
                ${renderLineItems(items, currency)}
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                <tr>
                  <td style="font-size:15px;color:#6b7280;">Order total</td>
                  <td style="text-align:right;font-size:20px;font-weight:700;color:#111827;">${formatMoney(orderTotal, currency)}</td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#6b7280;">
                You'll receive another email when your order ships. Questions? Contact us at
                <a href="mailto:${escapeHtml(tenant.supportEmail)}" style="color:${primary};text-decoration:none;font-weight:500;">${escapeHtml(tenant.supportEmail)}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildOrderConfirmationSubject(
  data: OrderConfirmationEmailJobPayload,
): string {
  return `Order confirmed #${data.orderId} — ${data.tenant.storeName}`;
}
