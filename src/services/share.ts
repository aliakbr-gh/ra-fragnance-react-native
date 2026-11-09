import { captureRef } from 'react-native-view-shot';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import type { Order, OrderLine, Settings } from '../db/repo';
import type { ViewRef } from '../components/Receipt';
import { escapeHtml, formatDate, ml, money, orderNo, toWhatsAppNumber } from '../utils/format';

export function receiptHtml(settings: Settings, order: Order, lines: OrderLine[]) {
  const fmt = (n: number) => escapeHtml(money(n, settings.currency));
  const showProfit = settings.show_profit_on_receipt === '1';
  const contact = [settings.shop_phone && `Phone: ${settings.shop_phone}`, settings.shop_whatsapp && `WhatsApp: ${settings.shop_whatsapp}`]
    .filter(Boolean)
    .map(s => escapeHtml(s as string))
    .join(' &nbsp;·&nbsp; ');

  const rows = lines
    .map(
      (l, i) => `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(l.item_name)}</td>
        <td class="r">${escapeHtml(ml(l.ml))}</td>
        <td class="r b">${fmt(l.amount)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 28px; font-size: 13px; }
  .head { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 14px; margin-bottom: 16px; }
  .head img { width: 80px; height: 80px; object-fit: contain; border-radius: 12px; }
  .head h1 { margin: 6px 0 2px; font-size: 24px; }
  .muted { color: #64748b; font-size: 12px; margin: 2px 0; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .meta h2 { margin: 0 0 4px; font-size: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 11px; color: #475569; text-transform: uppercase; }
  td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
  .r { text-align: right; } .b { font-weight: 700; }
  .totals { margin-left: auto; width: 55%; margin-top: 14px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .grand { border-top: 2px solid #0f172a; margin-top: 4px; padding-top: 8px !important; font-size: 18px; font-weight: 800; }
  .grand span:last-child { color: #6d28d9; }
  .footer { text-align: center; margin-top: 28px; padding-top: 12px; border-top: 2px dashed #cbd5e1; color: #64748b; }
</style></head><body>
  <div class="head">
    ${settings.shop_logo ? `<img src="${settings.shop_logo}"/>` : ''}
    <h1>${escapeHtml(settings.shop_name)}</h1>
    ${settings.shop_address ? `<p class="muted">${escapeHtml(settings.shop_address)}</p>` : ''}
    ${contact ? `<p class="muted">${contact}</p>` : ''}
  </div>
  <div class="meta">
    <div>
      <h2>Bill To</h2>
      <div class="b">${escapeHtml(order.customer_name)}</div>
      ${order.whatsapp ? `<div>WhatsApp: ${escapeHtml(order.whatsapp)}</div>` : ''}
      ${order.address ? `<div>${escapeHtml(order.address)}</div>` : ''}
    </div>
    <div class="r">
      <h2>Order ${orderNo(order.id)}</h2>
      <div>${escapeHtml(formatDate(order.created_at))}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Item</th><th class="r">Qty</th><th class="r">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
    ${order.discount ? `<div><span>Discount</span><span>- ${fmt(order.discount)}</span></div>` : ''}
    <div class="grand"><span>Total</span><span>${fmt(order.total)}</span></div>
    ${showProfit ? `<div><span>Profit</span><span>${fmt(order.profit)}</span></div>` : ''}
  </div>
  ${settings.receipt_footer ? `<div class="footer">${escapeHtml(settings.receipt_footer)}</div>` : ''}
</body></html>`;
}

const fileUrl = (path: string) => (path.startsWith('file://') ? path : `file://${path}`);

export async function captureReceipt(ref: React.RefObject<ViewRef | null>) {
  return captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
}

/**
 * Sends the receipt image straight into the customer's WhatsApp chat.
 * Falls back to WhatsApp Business, then to the normal share sheet.
 */
export async function shareImageToWhatsApp(imageUri: string, whatsapp: string | null, countryCode: string, message: string) {
  const number = toWhatsAppNumber(whatsapp, countryCode);
  const url = fileUrl(imageUri);

  for (const social of [Share.Social.WHATSAPP, Share.Social.WHATSAPPBUSINESS]) {
    const pkg = social === Share.Social.WHATSAPP ? 'com.whatsapp' : 'com.whatsapp.w4b';
    try {
      const { isInstalled } = await Share.isPackageInstalled(pkg);
      if (!isInstalled) {
        continue;
      }
      await Share.shareSingle({
        social,
        url,
        type: 'image/png',
        message,
        ...(number ? { whatsAppNumber: number } : {}),
      } as any);
      return;
    } catch {
      // try the next option
    }
  }
  await Share.open({ url, type: 'image/png', message, failOnCancel: false });
}

export async function createReceiptPdf(settings: Settings, order: Order, lines: OrderLine[]) {
  const res = await generatePDF({
    html: receiptHtml(settings, order, lines),
    fileName: `Order_${order.id}_${Date.now()}`,
    width: 595,
    height: 842,
  });
  return res.filePath;
}

export async function sharePdf(filePath: string, order: Order) {
  await Share.open({
    url: fileUrl(filePath),
    type: 'application/pdf',
    filename: `Order-${order.id}.pdf`,
    title: `Order ${orderNo(order.id)}`,
    failOnCancel: false,
  });
}
