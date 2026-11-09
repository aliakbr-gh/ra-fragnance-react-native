import { all, first, run, transaction } from './index';
import { round2, toWhatsAppNumber } from '../utils/format';

export type Item = {
  id: number;
  name: string;
  brand: string | null;
  price_per_liter: number;
  stock_ml: number;
  notes: string | null;
  created_at: string;
};

export type Vendor = {
  id: number;
  name: string;
  address: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type Purchase = {
  id: number;
  vendor_id: number | null;
  vendor_name: string | null;
  date: string;
  total: number;
  notes: string | null;
  created_at: string;
  item_count?: number;
  total_ml?: number;
};

export type PurchaseLine = {
  id?: number;
  item_id: number;
  item_name: string;
  ml: number;
  price_per_liter: number;
  amount: number;
};

export type Adjustment = {
  id: number;
  item_id: number;
  item_name?: string;
  ml: number;
  reason: string;
  created_at: string;
};

export type Customer = {
  id: number;
  name: string;
  whatsapp: string | null;
  address: string | null;
  created_at: string;
  order_count?: number;
  total_spent?: number;
};

export type Order = {
  id: number;
  customer_id: number | null;
  customer_name: string;
  whatsapp: string | null;
  address: string | null;
  subtotal: number;
  discount: number;
  total: number;
  profit: number;
  notes: string | null;
  created_at: string;
  item_count?: number;
};

export type OrderLine = {
  id?: number;
  item_id: number;
  item_name: string;
  ml: number;
  price_per_liter: number;
  base_amount: number;
  margin_percent: number;
  margin_amount: number;
  amount: number;
};

const blank = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

// ---------- Settings ----------

export type Settings = {
  shop_name: string;
  shop_address: string;
  shop_whatsapp: string;
  shop_phone: string;
  shop_logo: string;
  currency: string;
  country_code: string;
  default_margin: string;
  low_stock_ml: string;
  receipt_footer: string;
  show_profit_on_receipt: string;
};

export const DEFAULT_SETTINGS: Settings = {
  shop_name: 'RA Fragrance',
  shop_address: '',
  shop_whatsapp: '',
  shop_phone: '',
  shop_logo: '',
  currency: 'Rs',
  country_code: '92',
  default_margin: '0',
  low_stock_ml: '100',
  receipt_footer: 'Thank you for your order!',
  show_profit_on_receipt: '0',
};

export async function getSettings(): Promise<Settings> {
  const rows = await all<{ key: string; value: string | null }>('SELECT key, value FROM settings');
  const s: Settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.key in s && r.value !== null) {
      (s as Record<string, string>)[r.key] = r.value;
    }
  }
  return s;
}

export async function saveSettings(values: Partial<Settings>) {
  await transaction(async tx => {
    for (const [key, value] of Object.entries(values)) {
      await tx.execute(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, value ?? ''],
      );
    }
  });
}

// ---------- Items ----------

export function listItems(search = '') {
  const q = `%${search.trim()}%`;
  return all<Item>(
    'SELECT * FROM items WHERE name LIKE ? OR IFNULL(brand, \'\') LIKE ? ORDER BY name COLLATE NOCASE',
    [q, q],
  );
}

export function getItem(id: number) {
  return first<Item>('SELECT * FROM items WHERE id = ?', [id]);
}

export async function saveItem(data: { id?: number; name: string; brand?: string; price_per_liter: number; notes?: string }) {
  if (data.id) {
    await run('UPDATE items SET name = ?, brand = ?, price_per_liter = ?, notes = ? WHERE id = ?', [
      data.name.trim(),
      blank(data.brand),
      data.price_per_liter,
      blank(data.notes),
      data.id,
    ]);
    return data.id;
  }
  const res = await run('INSERT INTO items (name, brand, price_per_liter, notes) VALUES (?, ?, ?, ?)', [
    data.name.trim(),
    blank(data.brand),
    data.price_per_liter,
    blank(data.notes),
  ]);
  return res.insertId!;
}

export function deleteItem(id: number) {
  return run('DELETE FROM items WHERE id = ?', [id]);
}

export type StockMovement = { kind: 'purchase' | 'order' | 'adjustment'; ref_id: number; ml: number; note: string; created_at: string };

export function itemMovements(itemId: number) {
  return all<StockMovement>(
    `SELECT 'purchase' AS kind, p.id AS ref_id, pi.ml AS ml, IFNULL(p.vendor_name, '') AS note, p.created_at
       FROM purchase_items pi JOIN purchases p ON p.id = pi.purchase_id WHERE pi.item_id = ?
     UNION ALL
     SELECT 'order', o.id, -oi.ml, o.customer_name, o.created_at
       FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.item_id = ?
     UNION ALL
     SELECT 'adjustment', a.id, a.ml, a.reason, a.created_at FROM stock_adjustments a WHERE a.item_id = ?
     ORDER BY created_at DESC LIMIT 200`,
    [itemId, itemId, itemId],
  );
}

// ---------- Vendors ----------

export function listVendors(search = '') {
  const q = `%${search.trim()}%`;
  return all<Vendor>(
    "SELECT * FROM vendors WHERE name LIKE ? OR IFNULL(whatsapp,'') LIKE ? OR IFNULL(phone,'') LIKE ? ORDER BY name COLLATE NOCASE",
    [q, q, q],
  );
}

export function getVendor(id: number) {
  return first<Vendor>('SELECT * FROM vendors WHERE id = ?', [id]);
}

export async function saveVendor(v: Omit<Vendor, 'id' | 'created_at'> & { id?: number }) {
  const values = [v.name.trim(), blank(v.address), blank(v.whatsapp), blank(v.phone), blank(v.email), blank(v.notes)];
  if (v.id) {
    await run('UPDATE vendors SET name = ?, address = ?, whatsapp = ?, phone = ?, email = ?, notes = ? WHERE id = ?', [
      ...values,
      v.id,
    ]);
    return v.id;
  }
  const res = await run(
    'INSERT INTO vendors (name, address, whatsapp, phone, email, notes) VALUES (?, ?, ?, ?, ?, ?)',
    values,
  );
  return res.insertId!;
}

export function deleteVendor(id: number) {
  return run('DELETE FROM vendors WHERE id = ?', [id]);
}

// ---------- Purchases ----------

export function listPurchases(search = '') {
  const q = `%${search.trim()}%`;
  return all<Purchase>(
    `SELECT p.*, COUNT(pi.id) AS item_count, IFNULL(SUM(pi.ml), 0) AS total_ml
       FROM purchases p LEFT JOIN purchase_items pi ON pi.purchase_id = p.id
      WHERE IFNULL(p.vendor_name, '') LIKE ? OR p.date LIKE ?
      GROUP BY p.id ORDER BY p.date DESC, p.id DESC`,
    [q, q],
  );
}

export async function getPurchase(id: number) {
  const purchase = await first<Purchase>('SELECT * FROM purchases WHERE id = ?', [id]);
  const lines = await all<PurchaseLine>('SELECT * FROM purchase_items WHERE purchase_id = ? ORDER BY id', [id]);
  return purchase ? { purchase, lines } : null;
}

export async function createPurchase(data: {
  vendor_id: number | null;
  vendor_name: string | null;
  date: string;
  notes?: string;
  lines: PurchaseLine[];
  updateItemPrices?: boolean;
}) {
  const total = round2(data.lines.reduce((s, l) => s + l.amount, 0));
  let purchaseId = 0;
  await transaction(async tx => {
    const res = await tx.execute(
      'INSERT INTO purchases (vendor_id, vendor_name, date, total, notes) VALUES (?, ?, ?, ?, ?)',
      [data.vendor_id, data.vendor_name, data.date, total, blank(data.notes)],
    );
    purchaseId = res.insertId!;
    for (const l of data.lines) {
      await tx.execute(
        'INSERT INTO purchase_items (purchase_id, item_id, item_name, ml, price_per_liter, amount) VALUES (?, ?, ?, ?, ?, ?)',
        [purchaseId, l.item_id, l.item_name, l.ml, l.price_per_liter, l.amount],
      );
      await tx.execute('UPDATE items SET stock_ml = stock_ml + ? WHERE id = ?', [l.ml, l.item_id]);
      if (data.updateItemPrices) {
        await tx.execute('UPDATE items SET price_per_liter = ? WHERE id = ?', [l.price_per_liter, l.item_id]);
      }
    }
  });
  return purchaseId;
}

export async function deletePurchase(id: number) {
  await transaction(async tx => {
    const lines = (await tx.execute('SELECT item_id, ml FROM purchase_items WHERE purchase_id = ?', [id])).rows;
    for (const l of lines) {
      await tx.execute('UPDATE items SET stock_ml = stock_ml - ? WHERE id = ?', [l.ml, l.item_id]);
    }
    await tx.execute('DELETE FROM purchase_items WHERE purchase_id = ?', [id]);
    await tx.execute('DELETE FROM purchases WHERE id = ?', [id]);
  });
}

// ---------- Stock adjustments ----------

export function listAdjustments() {
  return all<Adjustment>(
    `SELECT a.*, i.name AS item_name FROM stock_adjustments a
       LEFT JOIN items i ON i.id = a.item_id ORDER BY a.id DESC`,
  );
}

export async function createAdjustment(itemId: number, signedMl: number, reason: string) {
  await transaction(async tx => {
    await tx.execute('INSERT INTO stock_adjustments (item_id, ml, reason) VALUES (?, ?, ?)', [itemId, signedMl, reason.trim()]);
    await tx.execute('UPDATE items SET stock_ml = stock_ml + ? WHERE id = ?', [signedMl, itemId]);
  });
}

export async function deleteAdjustment(id: number) {
  await transaction(async tx => {
    const row = (await tx.execute('SELECT item_id, ml FROM stock_adjustments WHERE id = ?', [id])).rows[0];
    if (row) {
      await tx.execute('UPDATE items SET stock_ml = stock_ml - ? WHERE id = ?', [row.ml, row.item_id]);
      await tx.execute('DELETE FROM stock_adjustments WHERE id = ?', [id]);
    }
  });
}

// ---------- Customers ----------

export function listCustomers(search = '') {
  const q = `%${search.trim()}%`;
  return all<Customer>(
    `SELECT c.*, COUNT(o.id) AS order_count, IFNULL(SUM(o.total), 0) AS total_spent
       FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
      WHERE c.name LIKE ? OR IFNULL(c.whatsapp, '') LIKE ?
      GROUP BY c.id ORDER BY c.name COLLATE NOCASE`,
    [q, q],
  );
}

export function getCustomer(id: number) {
  return first<Customer>('SELECT * FROM customers WHERE id = ?', [id]);
}

export async function saveCustomer(c: { id?: number; name: string; whatsapp?: string | null; address?: string | null }) {
  if (c.id) {
    await run('UPDATE customers SET name = ?, whatsapp = ?, address = ? WHERE id = ?', [
      c.name.trim(),
      blank(c.whatsapp),
      blank(c.address),
      c.id,
    ]);
    return c.id;
  }
  const res = await run('INSERT INTO customers (name, whatsapp, address) VALUES (?, ?, ?)', [
    c.name.trim(),
    blank(c.whatsapp),
    blank(c.address),
  ]);
  return res.insertId!;
}

export function deleteCustomer(id: number) {
  return run('DELETE FROM customers WHERE id = ?', [id]);
}

// ---------- Orders ----------

export function listOrders(search = '', customerId?: number) {
  const q = `%${search.trim()}%`;
  const params: (string | number)[] = [q, q, q];
  let where = "(o.customer_name LIKE ? OR IFNULL(o.whatsapp, '') LIKE ? OR CAST(o.id AS TEXT) LIKE ?)";
  if (customerId) {
    where += ' AND o.customer_id = ?';
    params.push(customerId);
  }
  return all<Order>(
    `SELECT o.*, COUNT(oi.id) AS item_count FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE ${where} GROUP BY o.id ORDER BY o.id DESC`,
    params,
  );
}

export async function getOrder(id: number) {
  const order = await first<Order>('SELECT * FROM orders WHERE id = ?', [id]);
  const lines = await all<OrderLine>('SELECT * FROM order_items WHERE order_id = ? ORDER BY id', [id]);
  return order ? { order, lines } : null;
}

export async function createOrder(data: {
  customer_id: number | null;
  customer_name: string;
  whatsapp: string;
  address: string;
  discount: number;
  notes?: string;
  lines: OrderLine[];
  countryCode: string;
}) {
  const subtotal = round2(data.lines.reduce((s, l) => s + l.amount, 0));
  const marginTotal = data.lines.reduce((s, l) => s + l.margin_amount, 0);
  const total = round2(subtotal - data.discount);
  const profit = round2(marginTotal - data.discount);
  const name = data.customer_name.trim();
  const whatsapp = blank(data.whatsapp);
  const address = blank(data.address);

  let orderId = 0;
  await transaction(async tx => {
    let customerId = data.customer_id;
    if (!customerId && whatsapp) {
      const target = toWhatsAppNumber(whatsapp, data.countryCode);
      const candidates = (await tx.execute('SELECT id, whatsapp FROM customers WHERE whatsapp IS NOT NULL')).rows;
      const match = candidates.find(c => toWhatsAppNumber(String(c.whatsapp), data.countryCode) === target);
      customerId = match ? Number(match.id) : null;
    }
    if (customerId) {
      await tx.execute('UPDATE customers SET name = ?, whatsapp = ?, address = ? WHERE id = ?', [
        name,
        whatsapp,
        address,
        customerId,
      ]);
    } else {
      const res = await tx.execute('INSERT INTO customers (name, whatsapp, address) VALUES (?, ?, ?)', [
        name,
        whatsapp,
        address,
      ]);
      customerId = res.insertId!;
    }

    const res = await tx.execute(
      `INSERT INTO orders (customer_id, customer_name, whatsapp, address, subtotal, discount, total, profit, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, name, whatsapp, address, subtotal, data.discount, total, profit, blank(data.notes)],
    );
    orderId = res.insertId!;
    for (const l of data.lines) {
      await tx.execute(
        `INSERT INTO order_items (order_id, item_id, item_name, ml, price_per_liter, base_amount, margin_percent, margin_amount, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, l.item_id, l.item_name, l.ml, l.price_per_liter, l.base_amount, l.margin_percent, l.margin_amount, l.amount],
      );
      await tx.execute('UPDATE items SET stock_ml = stock_ml - ? WHERE id = ?', [l.ml, l.item_id]);
    }
  });
  return orderId;
}

export async function deleteOrder(id: number) {
  await transaction(async tx => {
    const lines = (await tx.execute('SELECT item_id, ml FROM order_items WHERE order_id = ?', [id])).rows;
    for (const l of lines) {
      await tx.execute('UPDATE items SET stock_ml = stock_ml + ? WHERE id = ?', [l.ml, l.item_id]);
    }
    await tx.execute('DELETE FROM order_items WHERE order_id = ?', [id]);
    await tx.execute('DELETE FROM orders WHERE id = ?', [id]);
  });
}

// ---------- Dashboard ----------

export type DashboardStats = {
  todaySales: number;
  todayProfit: number;
  todayOrders: number;
  monthSales: number;
  monthProfit: number;
  itemCount: number;
  customerCount: number;
  lowStock: Item[];
};

export async function dashboardStats(lowStockMl: number): Promise<DashboardStats> {
  const today = await first<{ s: number; p: number; c: number }>(
    "SELECT IFNULL(SUM(total),0) AS s, IFNULL(SUM(profit),0) AS p, COUNT(*) AS c FROM orders WHERE date(created_at) = date('now','localtime')",
  );
  const month = await first<{ s: number; p: number }>(
    "SELECT IFNULL(SUM(total),0) AS s, IFNULL(SUM(profit),0) AS p FROM orders WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m','now','localtime')",
  );
  const counts = await first<{ items: number; customers: number }>(
    'SELECT (SELECT COUNT(*) FROM items) AS items, (SELECT COUNT(*) FROM customers) AS customers',
  );
  const lowStock = await all<Item>('SELECT * FROM items WHERE stock_ml <= ? ORDER BY stock_ml ASC LIMIT 10', [lowStockMl]);
  return {
    todaySales: today?.s ?? 0,
    todayProfit: today?.p ?? 0,
    todayOrders: today?.c ?? 0,
    monthSales: month?.s ?? 0,
    monthProfit: month?.p ?? 0,
    itemCount: counts?.items ?? 0,
    customerCount: counts?.customers ?? 0,
    lowStock,
  };
}
