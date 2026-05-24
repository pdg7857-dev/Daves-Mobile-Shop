import { google } from "googleapis";

// ============================================================================
// Shared client
// ============================================================================

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!raw || !sheetId) return null;
  try {
    return { credentials: JSON.parse(raw), sheetId };
  } catch {
    console.error("Sheets sync disabled: GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
    return null;
  }
}

async function getSheetsClient() {
  const creds = getCredentials();
  if (!creds) return null;
  const auth = new google.auth.GoogleAuth({
    credentials: creds.credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, sheetId: creds.sheetId };
}

type SheetsClient = NonNullable<Awaited<ReturnType<typeof getSheetsClient>>>;

function dateOnly(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toISOString().split("T")[0];
}

async function ensureTab(client: SheetsClient, tabName: string, headers: string[]) {
  const meta = await client.sheets.spreadsheets.get({ spreadsheetId: client.sheetId });
  const existingTab = meta.data.sheets?.find((s) => s.properties?.title === tabName);
  if (!existingTab) {
    await client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: client.sheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] }
    });
  }
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.sheetId,
    range: `${tabName}!1:1`
  });
  const current = res.data.values?.[0] ?? [];
  if (current.length === 0) {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `${tabName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [headers] }
    });
  }
}

async function findRowByFirstCol(client: SheetsClient, tabName: string, value: string): Promise<number | null> {
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.sheetId,
    range: `${tabName}!A:A`
  });
  const values = res.data.values ?? [];
  for (let i = 0; i < values.length; i++) {
    if (values[i]?.[0] === value) return i + 1;
  }
  return null;
}

async function upsertRow(client: SheetsClient, tabName: string, key: string, row: (string | number)[]) {
  const existing = await findRowByFirstCol(client, tabName, key);
  if (existing) {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `${tabName}!A${existing}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] }
    });
  } else {
    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.sheetId,
      range: `${tabName}!A:A`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] }
    });
  }
}

async function appendRow(client: SheetsClient, tabName: string, row: (string | number)[]) {
  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.sheetId,
    range: `${tabName}!A:A`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] }
  });
}

// ============================================================================
// INVENTORY TAB
// ============================================================================

type Repair = { serviceType: string; performedAt: Date | string | null };
type Supplier = { name: string } | null | undefined;

type PhoneForSync = {
  id: number;
  brand: string;
  model: string;
  storage: string | null;
  color: string | null;
  condition: string;
  imei: string | null;
  serial: string | null;
  status: string;
  repairNeeded?: string | null;
  purchaseDate: Date | string;
  purchasePrice: number;
  askingPrice: number | null;
  soldDate: Date | string | null;
  salePrice: number | null;
  soldTo: string | null;
  purchasedFrom: string | null;
  notes?: string | null;
  supplier?: Supplier;
  repairs?: Repair[];
};

const INVENTORY_TAB = "Inventory";
const INVENTORY_HEADERS = [
  "ID", "IMEI", "Serial", "Brand", "Model", "Storage", "Color", "Condition",
  "Status", "Repair Needed", "Purchase Date", "Purchase Price (CAD)",
  "Supplier", "Asking Price (CAD)", "Sold Date", "Sale Price (CAD)",
  "Sold To", "Repairs Done", "Notes", "Updated At"
];

function inventoryRow(phone: PhoneForSync): (string | number)[] {
  const repairsDone =
    phone.repairs
      ?.map((r) => {
        const when = r.performedAt ? dateOnly(r.performedAt) : "";
        return `${r.serviceType}${when ? ` (${when})` : ""}`;
      })
      .join(" · ") ?? "";
  return [
    String(phone.id),
    phone.imei ?? "",
    phone.serial ?? "",
    phone.brand,
    phone.model,
    phone.storage ?? "",
    phone.color ?? "",
    phone.condition,
    phone.status,
    phone.repairNeeded ?? "",
    dateOnly(phone.purchaseDate),
    phone.purchasePrice,
    phone.supplier?.name ?? phone.purchasedFrom ?? "",
    phone.askingPrice ?? "",
    dateOnly(phone.soldDate),
    phone.salePrice ?? "",
    phone.soldTo ?? "",
    repairsDone,
    phone.notes ?? "",
    new Date().toISOString()
  ];
}

export async function syncPhone(phone: PhoneForSync): Promise<void> {
  const client = await getSheetsClient();
  if (!client) return;
  try {
    await ensureTab(client, INVENTORY_TAB, INVENTORY_HEADERS);
    await upsertRow(client, INVENTORY_TAB, String(phone.id), inventoryRow(phone));
  } catch (err) {
    console.error("Sheets inventory sync failed:", err instanceof Error ? err.message : err);
  }
}

export async function markPhoneDeleted(phoneId: number): Promise<void> {
  const client = await getSheetsClient();
  if (!client) return;
  try {
    const row = await findRowByFirstCol(client, INVENTORY_TAB, String(phoneId));
    if (!row) return;
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `${INVENTORY_TAB}!I${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["deleted"]] }
    });
  } catch (err) {
    console.error("Sheets delete-mark failed:", err instanceof Error ? err.message : err);
  }
}

// ============================================================================
// ORDERS TAB — every order, with status/tracking/delivery updates
// ============================================================================

export type OrderForSync = {
  id: number;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  paymentMethod: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  paidAt: Date | string | null;
  shippedAt: Date | string | null;
  deliveredAt: Date | string | null;
  cancelledAt: Date | string | null;
  createdAt: Date | string;
  items?: Array<{ name: string; quantity: number; unitPrice: number; itemType: string }>;
};

const ORDERS_TAB = "Orders";
const ORDERS_HEADERS = [
  "Order #", "Status", "Created", "Customer", "Email", "Phone",
  "Ship To", "Items", "Subtotal", "Discount", "Shipping", "Tax", "Total",
  "Payment Method", "Carrier", "Tracking #", "Paid At", "Shipped At",
  "Delivered At", "Cancelled At", "Updated At"
];

function ordersRow(o: OrderForSync): (string | number)[] {
  const itemsSummary =
    o.items?.map((i) => `${i.quantity}× ${i.name} ($${i.unitPrice.toFixed(2)})`).join(" · ") ?? "";
  const shipTo = `${o.city}, ${o.province} ${o.postalCode} ${o.country}`.trim();
  return [
    o.orderNumber,
    o.status,
    dateOnly(o.createdAt),
    o.customerName,
    o.customerEmail,
    o.customerPhone ?? "",
    shipTo,
    itemsSummary,
    o.subtotal,
    o.discountAmount,
    o.shippingCost,
    o.taxAmount,
    o.total,
    o.paymentMethod ?? "",
    o.carrier ?? "",
    o.trackingNumber ?? "",
    dateOnly(o.paidAt),
    dateOnly(o.shippedAt),
    dateOnly(o.deliveredAt),
    dateOnly(o.cancelledAt),
    new Date().toISOString()
  ];
}

export async function syncOrder(order: OrderForSync): Promise<void> {
  const client = await getSheetsClient();
  if (!client) return;
  try {
    await ensureTab(client, ORDERS_TAB, ORDERS_HEADERS);
    await upsertRow(client, ORDERS_TAB, order.orderNumber, ordersRow(order));
  } catch (err) {
    console.error("Sheets orders sync failed:", err instanceof Error ? err.message : err);
  }
}

// ============================================================================
// FINANCE LEDGER TAB — append-only money log
// ============================================================================
// Each row is one money event: sale, refund, discount, supplier purchase, etc.
// "Tax collected" is sales tax we owe to CRA/Revenu Québec.
// "Tax paid" is what we paid suppliers (Input Tax Credit on sales tax remittance).

export type LedgerType =
  | "sale"
  | "refund"
  | "discount"
  | "shipping_charged"
  | "supplier_purchase"
  | "dave_care_revenue"
  | "manual_adjustment";

export type LedgerEntry = {
  type: LedgerType;
  date?: Date | string;
  description: string;
  orderNumber?: string | null;
  amountIn?: number;
  amountOut?: number;
  taxCollected?: number;
  taxPaid?: number;
  province?: string;
  notes?: string;
};

const FINANCE_TAB = "Finance";
const FINANCE_HEADERS = [
  "Timestamp", "Date", "Type", "Order #", "Description",
  "Money In (CAD)", "Money Out (CAD)", "Net (CAD)",
  "Sales Tax Collected (owed)", "Sales Tax Paid (ITC)", "Net Tax Owed",
  "Province", "Notes"
];

function financeRow(entry: LedgerEntry): (string | number)[] {
  const now = new Date();
  const date = dateOnly(entry.date ?? now);
  const moneyIn = entry.amountIn ?? 0;
  const moneyOut = entry.amountOut ?? 0;
  const taxCollected = entry.taxCollected ?? 0;
  const taxPaid = entry.taxPaid ?? 0;
  const net = Math.round((moneyIn - moneyOut) * 100) / 100;
  const netTax = Math.round((taxCollected - taxPaid) * 100) / 100;
  return [
    now.toISOString(),
    date,
    entry.type,
    entry.orderNumber ?? "",
    entry.description,
    moneyIn,
    moneyOut,
    net,
    taxCollected,
    taxPaid,
    netTax,
    entry.province ?? "",
    entry.notes ?? ""
  ];
}

export async function logFinance(entry: LedgerEntry): Promise<void> {
  const client = await getSheetsClient();
  if (!client) return;
  try {
    await ensureTab(client, FINANCE_TAB, FINANCE_HEADERS);
    await appendRow(client, FINANCE_TAB, financeRow(entry));
  } catch (err) {
    console.error("Sheets finance log failed:", err instanceof Error ? err.message : err);
  }
}

export async function logOrderPaid(order: OrderForSync): Promise<void> {
  await logFinance({
    type: "sale",
    date: order.paidAt ?? new Date(),
    description: `Order ${order.orderNumber} — ${order.customerName}`,
    orderNumber: order.orderNumber,
    amountIn: order.subtotal + order.shippingCost,
    taxCollected: order.taxAmount,
    province: order.province
  });
  if (order.discountAmount > 0) {
    await logFinance({
      type: "discount",
      date: order.paidAt ?? new Date(),
      description: `Discount applied to ${order.orderNumber}`,
      orderNumber: order.orderNumber,
      amountOut: order.discountAmount,
      province: order.province,
      notes: "Pre-tax discount; reduces money received"
    });
  }
}

export async function logOrderRefunded(order: OrderForSync): Promise<void> {
  await logFinance({
    type: "refund",
    date: new Date(),
    description: `Refund issued for ${order.orderNumber} — ${order.customerName}`,
    orderNumber: order.orderNumber,
    amountOut: order.subtotal + order.shippingCost,
    taxCollected: -order.taxAmount,
    province: order.province
  });
}
