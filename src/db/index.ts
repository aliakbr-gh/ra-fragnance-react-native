import { open, type DB, type Scalar, type Transaction } from '@op-engineering/op-sqlite';

export const DB_NAME = 'rafragnance.sqlite';

let db: DB | null = null;

const MIGRATIONS: string[][] = [
  [
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      price_per_liter REAL NOT NULL DEFAULT 0,
      stock_ml REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      whatsapp TEXT,
      phone TEXT,
      email TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
      vendor_name TEXT,
      date TEXT NOT NULL,
      total REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      item_id INTEGER,
      item_name TEXT NOT NULL,
      ml REAL NOT NULL,
      price_per_liter REAL NOT NULL,
      amount REAL NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS stock_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      ml REAL NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      whatsapp TEXT,
      address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      whatsapp TEXT,
      address TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      profit REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_id INTEGER,
      item_name TEXT NOT NULL,
      ml REAL NOT NULL,
      price_per_liter REAL NOT NULL,
      base_amount REAL NOT NULL,
      margin_percent REAL NOT NULL DEFAULT 0,
      margin_amount REAL NOT NULL DEFAULT 0,
      amount REAL NOT NULL
    )`,
    'CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)',
    'CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp)',
  ],
];

function migrate(conn: DB) {
  conn.executeSync('PRAGMA foreign_keys = ON');
  const row = conn.executeSync('PRAGMA user_version').rows[0];
  let version = Number(row?.user_version ?? 0);
  while (version < MIGRATIONS.length) {
    conn.executeSync('BEGIN');
    try {
      for (const sql of MIGRATIONS[version]) {
        conn.executeSync(sql);
      }
      version += 1;
      conn.executeSync(`PRAGMA user_version = ${version}`);
      conn.executeSync('COMMIT');
    } catch (e) {
      conn.executeSync('ROLLBACK');
      throw e;
    }
  }
}

export function getDb(): DB {
  if (!db) {
    const conn = open({ name: DB_NAME });
    migrate(conn);
    db = conn;
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export function getDbPath(): string {
  return getDb().getDbPath();
}

export async function all<T>(sql: string, params: Scalar[] = []): Promise<T[]> {
  const res = await getDb().execute(sql, params);
  return res.rows as unknown as T[];
}

export async function first<T>(sql: string, params: Scalar[] = []): Promise<T | null> {
  const rows = await all<T>(sql, params);
  return rows[0] ?? null;
}

export function run(sql: string, params: Scalar[] = []) {
  return getDb().execute(sql, params);
}

export function transaction(fn: (tx: Transaction) => Promise<void>) {
  return getDb().transaction(fn);
}
