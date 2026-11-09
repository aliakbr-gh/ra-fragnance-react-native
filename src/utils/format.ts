export function toNum(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function money(n: number, currency = 'Rs') {
  const fixed = round2(n).toFixed(2).replace(/\.00$/, '');
  const [int, dec] = fixed.split('.');
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency} ${dec ? `${withCommas}.${dec}` : withCommas}`;
}

export function ml(n: number) {
  const v = round2(n);
  if (Math.abs(v) >= 1000) {
    return `${round2(v / 1000)} L`;
  }
  return `${v} ml`;
}

export function todayISO() {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return '';
  }
  const d = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) {
    return value;
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  if (!value.includes(':')) {
    return date;
  }
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${date}, ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

export function orderNo(id: number) {
  return `#${String(id).padStart(5, '0')}`;
}

/** Converts a local number like 0300-1234567 into WhatsApp's international digits-only form. */
export function toWhatsAppNumber(raw: string | null | undefined, countryCode = '92') {
  let digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  const cc = countryCode.replace(/\D/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && cc) {
    digits = cc + digits.slice(1);
  } else if (cc && digits.length <= 10) {
    digits = cc + digits;
  }
  return digits;
}

export function escapeHtml(s: string | null | undefined) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
