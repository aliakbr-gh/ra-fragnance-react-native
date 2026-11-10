/** A label shown in English with its Urdu translation alongside. */
export type Bi = { en: string; ur: string };

/** Anything a UI component can show as a label: a bilingual pair or a plain string (numbers, names, units). */
export type Label = Bi | string;

const bi = (en: string, ur: string): Bi => ({ en, ur });

export function isBi(l: Label | null | undefined): l is Bi {
  return typeof l === 'object' && l !== null;
}

/** Flattens a label into one string for places that only accept text (alerts, placeholders, native titles). */
export function both(l: Label, sep = ' / ') {
  return isBi(l) ? `${l.en}${sep}${l.ur}` : l;
}

/** Appends a suffix like " *" or a count to both languages. */
export function withSuffix(l: Bi, suffix: string): Bi {
  return { en: `${l.en}${suffix}`, ur: `${l.ur}${suffix}` };
}

export const T = {
  // Common
  back: bi('Back', 'واپس'),
  save: bi('Save', 'محفوظ کریں'),
  cancel: bi('Cancel', 'منسوخ'),
  delete: bi('Delete', 'حذف کریں'),
  remove: bi('Remove', 'ہٹائیں'),
  edit: bi('Edit', 'ترمیم'),
  close: bi('Close', 'بند کریں'),
  search: bi('Search...', 'تلاش کریں...'),
  error: bi('Error', 'خرابی'),
  required: bi('Required', 'ضروری'),
  optional: bi('Optional', 'اختیاری'),
  notes: bi('Notes', 'نوٹس'),
  name: bi('Name', 'نام'),
  address: bi('Address', 'پتہ'),
  whatsapp: bi('WhatsApp', 'واٹس ایپ'),
  whatsappNumber: bi('WhatsApp number', 'واٹس ایپ نمبر'),
  phoneNumber: bi('Phone number', 'فون نمبر'),
  email: bi('Email', 'ای میل'),
  call: bi('Call', 'کال کریں'),
  nothingFound: bi('Nothing found', 'کچھ نہیں ملا'),
  noItemsAdded: bi('No items added', 'کوئی آئٹم شامل نہیں'),
  addItemLine: bi('+ Add item', 'آئٹم شامل کریں'),
  selectItem: bi('Select item', 'آئٹم منتخب کریں'),
  item: bi('Item', 'آئٹم'),
  items: bi('Items', 'آئٹمز'),
  quantityMl: bi('Quantity (ml)', 'مقدار (ملی لیٹر)'),
  qty: bi('Qty', 'مقدار'),
  amount: bi('Amount', 'رقم'),
  total: bi('Total', 'کل'),
  subtotal: bi('Subtotal', 'ذیلی کل'),
  discount: bi('Discount', 'رعایت'),
  stock: bi('Stock', 'اسٹاک'),
  currentStock: bi('Current stock', 'موجودہ اسٹاک'),
  profit: bi('Profit', 'منافع'),
  date: bi('Date', 'تاریخ'),
  vendor: bi('Vendor', 'وینڈر'),
  customer: bi('Customer', 'گاہک'),
  order: bi('Order', 'آرڈر'),
  purchase: bi('Purchase', 'خریداری'),
  noItemsTitle: bi('No items', 'کوئی آئٹم نہیں'),
  addAtLeastOne: bi('Add at least one item', 'کم از کم ایک آئٹم شامل کریں'),
  quantityMissing: bi('Quantity missing', 'مقدار درج نہیں'),
  enterMlForEvery: bi('Enter ml for every item', 'ہر آئٹم کی مقدار (ملی لیٹر) درج کریں'),
  itemCount: (n: number) => bi(`${n} item(s)`, `${n} آئٹم`),
  orderCount: (n: number) => bi(`${n} order(s)`, `${n} آرڈر`),

  // Navigation
  home: bi('Home', 'ہوم'),
  dashboard: bi('Dashboard', 'ڈیش بورڈ'),
  orders: bi('Orders', 'آرڈرز'),
  purchases: bi('Purchases', 'خریداری'),
  more: bi('More', 'مزید'),
  vendors: bi('Vendors', 'وینڈرز'),
  customers: bi('Customers', 'گاہک'),
  stockAdjustments: bi('Stock Adjustments', 'اسٹاک ایڈجسٹمنٹ'),
  adjustStock: bi('Adjust Stock', 'اسٹاک ایڈجسٹ کریں'),
  shopSettings: bi('Shop Settings', 'دکان کی ترتیبات'),
  settings: bi('Settings', 'ترتیبات'),
  backup: bi('Backup', 'بیک اپ'),
  backupRestore: bi('Backup & Restore', 'بیک اپ اور بحالی'),

  // Home
  todaySales: bi("Today's Sales", 'آج کی فروخت'),
  todayProfit: bi("Today's Profit", 'آج کا منافع'),
  monthSales: bi('This Month Sales', 'اس ماہ کی فروخت'),
  monthProfit: bi('This Month Profit', 'اس ماہ کا منافع'),
  ordersToday: bi('Orders Today', 'آج کے آرڈرز'),
  quickActions: bi('Quick actions', 'فوری اقدامات'),
  newOrder: bi('New Order', 'نیا آرڈر'),
  addItem: bi('Add Item', 'آئٹم شامل کریں'),
  lowStock: bi('Low stock', 'کم اسٹاک'),
  allStocked: bi('All items are well stocked 👍', 'تمام آئٹمز کا اسٹاک مناسب ہے'),

  // More
  vendorsSub: bi('Suppliers with address & WhatsApp', 'سپلائرز کا پتہ اور واٹس ایپ'),
  customersSub: bi('Saved automatically from orders', 'آرڈرز سے خودبخود محفوظ'),
  adjustmentsSub: bi('Add or remove stock with a reason', 'وجہ کے ساتھ اسٹاک شامل یا کم کریں'),
  settingsSub: bi('Name, logo, address, contact, receipt', 'نام، لوگو، پتہ، رابطہ، رسید'),
  backupSub: bi('Download or import the SQLite database', 'ڈیٹا بیس ڈاؤن لوڈ یا امپورٹ کریں'),

  // Orders
  searchOrders: bi('Search by customer, number or order #', 'گاہک، نمبر یا آرڈر نمبر سے تلاش'),
  noOrders: bi('No orders yet', 'ابھی کوئی آرڈر نہیں'),
  pickExisting: bi('Pick existing', 'موجودہ منتخب کریں'),
  customerName: bi('Customer name *', 'گاہک کا نام *'),
  priceAuto: bi('Price (auto)', 'قیمت (خودکار)'),
  marginPercent: bi('Margin %', 'مارجن %'),
  margin: bi('Margin', 'مارجن'),
  lineTotal: bi('Line total', 'آئٹم کا کل'),
  totalMargin: bi('Total margin', 'کل مارجن'),
  profitAfterDiscount: bi('Profit (after discount)', 'منافع (رعایت کے بعد)'),
  placeOrder: bi('Place Order', 'آرڈر کریں'),
  placeOrderAnyway: bi('Place order', 'آرڈر کریں'),
  selectCustomer: bi('Select customer', 'گاہک منتخب کریں'),
  enterCustomerName: bi('Enter customer name', 'گاہک کا نام درج کریں'),
  invalidDiscount: bi('Invalid discount', 'غلط رعایت'),
  discountTooHigh: bi('Discount cannot be more than subtotal', 'رعایت ذیلی کل سے زیادہ نہیں ہو سکتی'),
  stockGoesNegative: bi('Place order anyway? Stock will go negative.', 'پھر بھی آرڈر کریں؟ اسٹاک منفی ہو جائے گا۔'),
  have: bi('have', 'موجود'),
  deleteOrderQ: bi('Delete order?', 'آرڈر حذف کریں؟'),
  deleteOrderMsg: bi('Items will be returned to stock.', 'آئٹمز اسٹاک میں واپس چلے جائیں گے۔'),
  whatsappImage: bi('WhatsApp Image', 'واٹس ایپ تصویر'),
  sharePdf: bi('Share PDF', 'پی ڈی ایف شیئر کریں'),
  profitBreakdown: bi('Profit breakdown (internal)', 'منافع کی تفصیل (اندرونی)'),
  base: bi('Base', 'بنیادی'),
  netProfit: bi('Net profit', 'خالص منافع'),
  viewCustomer: bi('View customer', 'گاہک دیکھیں'),
  couldNotShare: bi('Could not share', 'شیئر نہیں ہو سکا'),
  couldNotPdf: bi('Could not create PDF', 'پی ڈی ایف نہیں بن سکی'),
  billTo: bi('Bill To', 'بنام'),

  // Items
  searchItems: bi('Search items or brand', 'آئٹم یا برانڈ تلاش کریں'),
  noItemsYet: bi('No items yet', 'ابھی کوئی آئٹم نہیں'),
  newItem: bi('New Item', 'نیا آئٹم'),
  editItem: bi('Edit Item', 'آئٹم میں ترمیم'),
  deleteItemQ: bi('Delete item?', 'آئٹم حذف کریں؟'),
  deleteItemMsg: bi(
    'Past orders and purchases keep their record, but stock adjustments for this item will be removed.',
    'پچھلے آرڈرز اور خریداری کا ریکارڈ محفوظ رہے گا، لیکن اس آئٹم کی اسٹاک ایڈجسٹمنٹ ختم ہو جائیں گی۔',
  ),
  itemName: bi('Item name *', 'آئٹم کا نام *'),
  brand: bi('Brand / Inspired by', 'برانڈ'),
  pricePerLitre: bi('Price per 1000ml (1 Litre) *', 'قیمت فی 1000 ملی لیٹر *'),
  enterItemName: bi('Please enter item name', 'آئٹم کا نام درج کریں'),
  enterPrice: bi('Please enter price per 1000ml', 'فی 1000 ملی لیٹر قیمت درج کریں'),
  saveItem: bi('Save Item', 'آئٹم محفوظ کریں'),
  updateItem: bi('Update Item', 'آئٹم اپڈیٹ کریں'),
  stockHistory: bi('Stock history', 'اسٹاک کی تاریخ'),
  noMovements: bi('No movements yet', 'ابھی کوئی تبدیلی نہیں'),
  kind: {
    purchase: bi('Purchase', 'خریداری'),
    order: bi('Order', 'آرڈر'),
    adjustment: bi('Adjustment', 'ایڈجسٹمنٹ'),
  },

  // Vendors
  searchVendors: bi('Search vendors', 'وینڈر تلاش کریں'),
  noVendors: bi('No vendors yet', 'ابھی کوئی وینڈر نہیں'),
  newVendor: bi('New Vendor', 'نیا وینڈر'),
  editVendor: bi('Edit Vendor', 'وینڈر میں ترمیم'),
  deleteVendorQ: bi('Delete vendor?', 'وینڈر حذف کریں؟'),
  deleteVendorMsg: bi('Existing purchases will keep the vendor name.', 'موجودہ خریداری میں وینڈر کا نام محفوظ رہے گا۔'),
  enterVendorName: bi('Please enter vendor name', 'وینڈر کا نام درج کریں'),
  vendorName: bi('Vendor name *', 'وینڈر کا نام *'),
  saveVendor: bi('Save Vendor', 'وینڈر محفوظ کریں'),
  updateVendor: bi('Update Vendor', 'وینڈر اپڈیٹ کریں'),

  // Purchases
  searchPurchases: bi('Search by vendor or date', 'وینڈر یا تاریخ سے تلاش'),
  noPurchases: bi('No purchases yet', 'ابھی کوئی خریداری نہیں'),
  noVendor: bi('No vendor', 'کوئی وینڈر نہیں'),
  newPurchase: bi('New Purchase', 'نئی خریداری'),
  selectVendor: bi('Select vendor', 'وینڈر منتخب کریں'),
  addVendorFirst: bi('+ Add a vendor first', 'پہلے وینڈر شامل کریں'),
  dateFormat: bi('Date (YYYY-MM-DD)', 'تاریخ'),
  ratePerLitre: bi('Rate / 1000ml', 'ریٹ فی 1000 ملی لیٹر'),
  updatePrices: bi('Update item price to these rates', 'آئٹم کی قیمت ان ریٹس پر اپڈیٹ کریں'),
  totalQuantity: bi('Total quantity', 'کل مقدار'),
  totalAmount: bi('Total amount', 'کل رقم'),
  savePurchase: bi('Save Purchase', 'خریداری محفوظ کریں'),
  invalidDate: bi('Invalid date', 'غلط تاریخ'),
  useDateFormat: bi('Use format YYYY-MM-DD', 'تاریخ YYYY-MM-DD فارمیٹ میں لکھیں'),
  deletePurchaseQ: bi('Delete purchase?', 'خریداری حذف کریں؟'),
  deletePurchaseMsg: bi('The purchased quantity will be removed from stock.', 'خریدی گئی مقدار اسٹاک سے نکال دی جائے گی۔'),

  // Stock adjustments
  noAdjustments: bi('No adjustments yet', 'ابھی کوئی ایڈجسٹمنٹ نہیں'),
  deleteAdjustmentQ: bi('Delete adjustment?', 'ایڈجسٹمنٹ حذف کریں؟'),
  deleteAdjustmentMsg: bi('Stock will be reverted.', 'اسٹاک پہلے جیسا ہو جائے گا۔'),
  deletedItem: bi('Deleted item', 'حذف شدہ آئٹم'),
  itemRequired: bi('Item *', 'آئٹم *'),
  addStock: bi('+ Add stock', 'اسٹاک شامل کریں'),
  removeStock: bi('− Remove stock', 'اسٹاک کم کریں'),
  quantityMlRequired: bi('Quantity (ml) *', 'مقدار (ملی لیٹر) *'),
  reasonRequired: bi('Reason *', 'وجہ *'),
  typeReason: bi('Or type a reason', 'یا وجہ لکھیں'),
  change: bi('Change', 'تبدیلی'),
  newStock: bi('New stock', 'نیا اسٹاک'),
  saveAdjustment: bi('Save Adjustment', 'ایڈجسٹمنٹ محفوظ کریں'),
  selectAnItem: bi('Select an item', 'آئٹم منتخب کریں'),
  enterQtyMl: bi('Enter quantity in ml', 'مقدار ملی لیٹر میں درج کریں'),
  enterReason: bi('Enter a reason', 'وجہ درج کریں'),
  reasons: {
    plus: [
      bi('Opening stock', 'ابتدائی اسٹاک'),
      bi('Counting correction', 'گنتی کی درستگی'),
      bi('Returned by customer', 'گاہک نے واپس کیا'),
      bi('Free sample received', 'مفت نمونہ موصول'),
    ],
    minus: [
      bi('Damaged / Leaked', 'خراب / لیک'),
      bi('Evaporation', 'بخارات بن گیا'),
      bi('Tester / Sample', 'ٹیسٹر / نمونہ'),
      bi('Counting correction', 'گنتی کی درستگی'),
      bi('Personal use', 'ذاتی استعمال'),
    ],
  },

  // Customers
  searchCustomers: bi('Search by name or number', 'نام یا نمبر سے تلاش'),
  noCustomers: bi('Customers appear here after their first order', 'پہلے آرڈر کے بعد گاہک یہاں نظر آئیں گے'),
  noNumber: bi('No number', 'کوئی نمبر نہیں'),
  deleteCustomerQ: bi('Delete customer?', 'گاہک حذف کریں؟'),
  deleteCustomerMsg: bi('Their orders will be kept.', 'ان کے آرڈرز محفوظ رہیں گے۔'),
  enterName: bi('Enter name', 'نام درج کریں'),
  totalSpent: bi('Total spent', 'کل خرچ'),
  totalProfit: bi('Total profit', 'کل منافع'),

  // Settings
  shop: bi('Shop', 'دکان'),
  tapToAddLogo: bi('Tap to add logo', 'لوگو شامل کریں'),
  changeLogo: bi('Change logo', 'لوگو تبدیل کریں'),
  chooseLogo: bi('Choose logo', 'لوگو منتخب کریں'),
  shopName: bi('Shop name *', 'دکان کا نام *'),
  preferences: bi('Preferences', 'ترجیحات'),
  currency: bi('Currency', 'کرنسی'),
  countryCode: bi('Country code', 'ملک کا کوڈ'),
  countryCodeHint: bi('Used for WhatsApp (92 = PK)', 'واٹس ایپ کے لیے (92 = پاکستان)'),
  defaultMargin: bi('Default margin %', 'ڈیفالٹ مارجن %'),
  lowStockAlert: bi('Low stock alert (ml)', 'کم اسٹاک الرٹ (ملی لیٹر)'),
  receiptFooter: bi('Receipt footer', 'رسید کا فوٹر'),
  showProfitOnReceipt: bi('Show profit on shared receipt', 'شیئر کی گئی رسید پر منافع دکھائیں'),
  saveSettings: bi('Save Settings', 'ترتیبات محفوظ کریں'),
  enterShopName: bi('Enter shop name', 'دکان کا نام درج کریں'),

  // Backup
  download: bi('Download', 'ڈاؤن لوڈ'),
  downloadDesc: bi(
    'Saves the full SQLite database (items, vendors, purchases, stock, orders, customers and settings) as a single .sqlite file.',
    'مکمل ڈیٹا بیس (آئٹمز، وینڈرز، خریداری، اسٹاک، آرڈرز، گاہک اور ترتیبات) ایک فائل میں محفوظ کرتا ہے۔',
  ),
  downloadBackup: bi('Download backup (.sqlite)', 'بیک اپ ڈاؤن لوڈ کریں'),
  shareBackup: bi('Share backup (Drive, WhatsApp...)', 'بیک اپ شیئر کریں'),
  restore: bi('Restore', 'بحالی'),
  restoreDesc: bi(
    'Import a .sqlite backup created by this app. Your current data will be replaced.',
    'اس ایپ کا بنایا ہوا بیک اپ امپورٹ کریں۔ موجودہ ڈیٹا تبدیل ہو جائے گا۔',
  ),
  importBackup: bi('Import backup', 'بیک اپ امپورٹ کریں'),
  restoreQ: bi('Restore backup?', 'بیک اپ بحال کریں؟'),
  restoreMsg: bi(
    'All current data on this phone will be replaced by the backup file. Download a backup first if you are unsure.',
    'اس فون کا تمام موجودہ ڈیٹا بیک اپ فائل سے تبدیل ہو جائے گا۔ اگر یقین نہیں تو پہلے بیک اپ ڈاؤن لوڈ کر لیں۔',
  ),
  chooseFile: bi('Choose file', 'فائل منتخب کریں'),
  backupSaved: bi('Backup saved', 'بیک اپ محفوظ ہو گیا'),
  savedAs: (name: string) => bi(`Saved as ${name}`, `اس نام سے محفوظ: ${name}`),
  restored: bi('Restored', 'بحال ہو گیا'),
  restoredMsg: bi('Backup imported successfully.', 'بیک اپ کامیابی سے امپورٹ ہو گیا۔'),
};
