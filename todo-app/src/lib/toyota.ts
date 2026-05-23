import { prisma } from "./db";
import { SOURCE } from "./sources";
import type { SyncResult } from "./mobile-shop";

// Customer statuses we surface as tasks. SOLD and LOST are terminal — they
// close their existing tasks if present.
const OPEN_LEAD_STATUSES = ["LEAD", "TEST_DRIVE_BOOKED", "QUOTED", "NEGOTIATING", "FOLLOW_UP"];
const TERMINAL_LEAD_STATUSES = ["SOLD", "LOST"];

type ToyotaCustomer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  followUpDate: string | null;
  budgetCad: string | null;
  vehicleOfInterestTrimId: number | null;
  notesMd: string | null;
};

async function fetchCustomers(): Promise<ToyotaCustomer[]> {
  const base = process.env.TOYOTA_API_BASE;
  const token = process.env.TOYOTA_API_TOKEN;
  if (!base || !token) throw new Error("TOYOTA_API_BASE and TOYOTA_API_TOKEN must be set");

  const url = `${base.replace(/\/$/, "")}/api/v1/customers`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Toyota API ${res.status}: ${await res.text()}`);

  const body = (await res.json()) as { customers?: ToyotaCustomer[] } | ToyotaCustomer[];
  return Array.isArray(body) ? body : (body.customers ?? []);
}

function leadTitle(c: ToyotaCustomer): string {
  const action = leadAction(c.status);
  return `${action} ${c.name}${c.budgetCad ? ` ($${c.budgetCad} CAD)` : ""}`;
}

function leadAction(status: string): string {
  switch (status) {
    case "LEAD":
      return "Qualify lead:";
    case "TEST_DRIVE_BOOKED":
      return "Confirm test drive with";
    case "QUOTED":
      return "Follow up on quote with";
    case "NEGOTIATING":
      return "Negotiate with";
    case "FOLLOW_UP":
      return "Follow up:";
    default:
      return "Lead:";
  }
}

function leadPriority(c: ToyotaCustomer): "low" | "normal" | "high" | "urgent" {
  if (!c.followUpDate) return c.status === "NEGOTIATING" ? "high" : "normal";
  const dueIn = (new Date(c.followUpDate).getTime() - Date.now()) / 86_400_000;
  if (dueIn < 0) return "urgent";
  if (dueIn < 1) return "high";
  return c.status === "NEGOTIATING" ? "high" : "normal";
}

export async function syncToyota(): Promise<SyncResult> {
  const adminBase = process.env.TOYOTA_ADMIN_URL ?? "";
  const customers = await fetchCustomers();
  const result: SyncResult = { added: 0, updated: 0, closed: 0 };

  const open = customers.filter((c) => OPEN_LEAD_STATUSES.includes(c.status));
  const terminal = customers.filter((c) => TERMINAL_LEAD_STATUSES.includes(c.status));

  for (const c of open) {
    const upsert = await prisma.task.upsert({
      where: { source_sourceId: { source: SOURCE.TOYOTA_LEAD, sourceId: String(c.id) } },
      create: {
        title: leadTitle(c),
        description: c.notesMd ?? null,
        source: SOURCE.TOYOTA_LEAD,
        sourceId: String(c.id),
        sourceUrl: adminBase ? `${adminBase}/customers/${c.id}` : null,
        sourceMetadata: c as unknown as object,
        dueDate: c.followUpDate ? new Date(c.followUpDate) : null,
        priority: leadPriority(c),
        status: "open",
      },
      update: {
        title: leadTitle(c),
        description: c.notesMd ?? null,
        sourceMetadata: c as unknown as object,
        dueDate: c.followUpDate ? new Date(c.followUpDate) : null,
        priority: leadPriority(c),
      },
    });
    if (upsert.createdAt.getTime() === upsert.updatedAt.getTime()) result.added++;
    else result.updated++;
  }

  if (terminal.length) {
    const closed = await prisma.task.updateMany({
      where: {
        source: SOURCE.TOYOTA_LEAD,
        sourceId: { in: terminal.map((c) => String(c.id)) },
        status: "open",
      },
      data: { status: "done", completedAt: new Date() },
    });
    result.closed = closed.count;
  }

  return result;
}
