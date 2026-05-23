import { Pool } from "pg";
import { prisma } from "./db";
import { SOURCE } from "./sources";

// Order statuses that we treat as "still work to do". Terminal statuses
// (delivered, cancelled, refunded) close their corresponding task.
const OPEN_ORDER_STATUSES = ["pending_payment", "paid", "processing", "shipped"];
const TERMINAL_ORDER_STATUSES = ["delivered", "cancelled", "refunded"];

// How far ahead we look when surfacing expiring Dave Care plans as reminders.
const CARE_PLAN_EXPIRY_WINDOW_DAYS = 30;

let pool: Pool | null = null;
function getPool(): Pool {
  const url = process.env.MOBILE_SHOP_DATABASE_URL;
  if (!url) throw new Error("MOBILE_SHOP_DATABASE_URL is not set");
  if (!pool) pool = new Pool({ connectionString: url, max: 3 });
  return pool;
}

function orderTitle(row: OrderRow): string {
  const action = orderAction(row.status);
  return `${action} order ${row.orderNumber} — ${row.customerName} ($${row.total.toFixed(2)})`;
}

function orderAction(status: string): string {
  switch (status) {
    case "pending_payment":
      return "Collect payment for";
    case "paid":
      return "Process";
    case "processing":
      return "Ship";
    case "shipped":
      return "Confirm delivery of";
    default:
      return "Review";
  }
}

function orderPriority(status: string, createdAt: Date): "low" | "normal" | "high" | "urgent" {
  const ageDays = (Date.now() - createdAt.getTime()) / 86_400_000;
  if (status === "pending_payment" && ageDays > 2) return "urgent";
  if (status === "paid" && ageDays > 1) return "high";
  if (status === "processing" && ageDays > 3) return "high";
  return "normal";
}

function carePlanTitle(row: CarePlanRow): string {
  const days = Math.max(0, Math.round((row.expiresAt.getTime() - Date.now()) / 86_400_000));
  return `Dave Care expiring in ${days}d — ${row.customerName} (${row.phoneLabel})`;
}

type OrderRow = {
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: Date;
  trackingNumber: string | null;
};

type CarePlanRow = {
  id: number;
  customerName: string;
  phoneLabel: string;
  expiresAt: Date;
  status: string;
};

export type SyncResult = {
  added: number;
  updated: number;
  closed: number;
};

export async function syncMobileShop(): Promise<SyncResult> {
  const adminBase = process.env.MOBILE_SHOP_ADMIN_URL ?? "";
  const client = await getPool().connect();
  const result: SyncResult = { added: 0, updated: 0, closed: 0 };

  try {
    const ordersRes = await client.query<OrderRow>(
      `SELECT "orderNumber", "customerName", status, total::float8 AS total,
              "createdAt", "trackingNumber"
       FROM "Order"
       WHERE status = ANY($1)`,
      [OPEN_ORDER_STATUSES],
    );

    for (const row of ordersRes.rows) {
      const upsert = await prisma.task.upsert({
        where: {
          source_sourceId: {
            source: SOURCE.MOBILE_SHOP_ORDER,
            sourceId: row.orderNumber,
          },
        },
        create: {
          title: orderTitle(row),
          source: SOURCE.MOBILE_SHOP_ORDER,
          sourceId: row.orderNumber,
          sourceUrl: adminBase ? `${adminBase}/orders/${row.orderNumber}` : null,
          sourceMetadata: { ...row, createdAt: row.createdAt.toISOString() } as object,
          status: "open",
          priority: orderPriority(row.status, row.createdAt),
        },
        update: {
          title: orderTitle(row),
          sourceMetadata: { ...row, createdAt: row.createdAt.toISOString() } as object,
          priority: orderPriority(row.status, row.createdAt),
        },
      });
      if (upsert.createdAt.getTime() === upsert.updatedAt.getTime()) result.added++;
      else result.updated++;
    }

    const terminalRes = await client.query<{ orderNumber: string }>(
      `SELECT "orderNumber" FROM "Order" WHERE status = ANY($1)`,
      [TERMINAL_ORDER_STATUSES],
    );
    const closed = await prisma.task.updateMany({
      where: {
        source: SOURCE.MOBILE_SHOP_ORDER,
        sourceId: { in: terminalRes.rows.map((r) => r.orderNumber) },
        status: "open",
      },
      data: { status: "done", completedAt: new Date() },
    });
    result.closed += closed.count;

    const cutoff = new Date(Date.now() + CARE_PLAN_EXPIRY_WINDOW_DAYS * 86_400_000);
    const plansRes = await client.query<CarePlanRow>(
      `SELECT id, "customerName", "phoneLabel", "expiresAt", status
       FROM "DaveCarePlan"
       WHERE status = 'active' AND "expiresAt" <= $1`,
      [cutoff],
    );

    for (const row of plansRes.rows) {
      const upsert = await prisma.task.upsert({
        where: {
          source_sourceId: {
            source: SOURCE.MOBILE_SHOP_CARE_PLAN,
            sourceId: String(row.id),
          },
        },
        create: {
          title: carePlanTitle(row),
          source: SOURCE.MOBILE_SHOP_CARE_PLAN,
          sourceId: String(row.id),
          sourceUrl: adminBase ? `${adminBase}/dave-care/${row.id}` : null,
          sourceMetadata: { ...row, expiresAt: row.expiresAt.toISOString() } as object,
          dueDate: row.expiresAt,
          status: "open",
          priority: "normal",
        },
        update: {
          title: carePlanTitle(row),
          dueDate: row.expiresAt,
          sourceMetadata: { ...row, expiresAt: row.expiresAt.toISOString() } as object,
        },
      });
      if (upsert.createdAt.getTime() === upsert.updatedAt.getTime()) result.added++;
      else result.updated++;
    }

    const expiredPlans = await client.query<{ id: number }>(
      `SELECT id FROM "DaveCarePlan" WHERE status = 'cancelled'`,
    );
    const closedPlans = await prisma.task.updateMany({
      where: {
        source: SOURCE.MOBILE_SHOP_CARE_PLAN,
        sourceId: { in: expiredPlans.rows.map((r) => String(r.id)) },
        status: "open",
      },
      data: { status: "dismissed", completedAt: new Date() },
    });
    result.closed += closedPlans.count;
  } finally {
    client.release();
  }

  return result;
}
