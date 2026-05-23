import { google } from "googleapis";

type Repair = {
  serviceType: string;
  performedAt: Date | string | null;
};

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

const SHEET_TAB = "Inventory";

const HEADERS = [
  "ID",
  "IMEI",
  "Serial",
  "Brand",
  "Model",
  "Storage",
  "Color",
  "Condition",
  "Status",
  "Repair Needed",
  "Purchase Date",
  "Purchase Price (CAD)",
  "Supplier",
  "Asking Price (CAD)",
  "Sold Date",
  "Sale Price (CAD)",
  "Sold To",
  "Repairs Done",
  "Notes",
  "Updated At"
];

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

function dateOnly(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toISOString().split("T")[0];
}

function buildRow(phone: PhoneForSync): (string | number)[] {
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

type SheetsClient = NonNullable<Awaited<ReturnType<typeof getSheetsClient>>>;

async function ensureHeaders(client: SheetsClient) {
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.sheetId,
    range: `${SHEET_TAB}!1:1`
  });
  const existing = res.data.values?.[0] ?? [];
  if (existing.length === 0) {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `${SHEET_TAB}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [HEADERS] }
    });
  }
}

async function findRowByPhoneId(client: SheetsClient, phoneId: number): Promise<number | null> {
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.sheetId,
    range: `${SHEET_TAB}!A:A`
  });
  const values = res.data.values ?? [];
  for (let i = 0; i < values.length; i++) {
    if (values[i]?.[0] === String(phoneId)) return i + 1;
  }
  return null;
}

export async function syncPhone(phone: PhoneForSync): Promise<void> {
  const client = await getSheetsClient();
  if (!client) return;
  try {
    await ensureHeaders(client);
    const row = buildRow(phone);
    const existingRow = await findRowByPhoneId(client, phone.id);
    if (existingRow) {
      await client.sheets.spreadsheets.values.update({
        spreadsheetId: client.sheetId,
        range: `${SHEET_TAB}!A${existingRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] }
      });
    } else {
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: `${SHEET_TAB}!A:A`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] }
      });
    }
  } catch (err) {
    console.error("Sheets sync failed:", err instanceof Error ? err.message : err);
  }
}

export async function markPhoneDeleted(phoneId: number): Promise<void> {
  const client = await getSheetsClient();
  if (!client) return;
  try {
    const row = await findRowByPhoneId(client, phoneId);
    if (!row) return;
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.sheetId,
      range: `${SHEET_TAB}!I${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["deleted"]] }
    });
  } catch (err) {
    console.error("Sheets delete-mark failed:", err instanceof Error ? err.message : err);
  }
}
