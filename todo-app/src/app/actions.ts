"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeNextDueDate } from "@/lib/recurrence";
import { syncAll } from "@/lib/sync";

export async function completeTask(id: number) {
  await prisma.task.update({
    where: { id },
    data: { status: "done", completedAt: new Date() },
  });
  revalidatePath("/");
}

export async function reopenTask(id: number) {
  await prisma.task.update({
    where: { id },
    data: { status: "open", completedAt: null, snoozedUntil: null },
  });
  revalidatePath("/");
}

export async function snoozeTask(id: number, days: number) {
  const until = new Date(Date.now() + Math.max(1, days) * 86_400_000);
  await prisma.task.update({
    where: { id },
    data: { status: "snoozed", snoozedUntil: until },
  });
  revalidatePath("/");
}

export async function dismissTask(id: number) {
  await prisma.task.update({
    where: { id },
    data: { status: "dismissed", completedAt: new Date() },
  });
  revalidatePath("/");
}

export async function createPersonalTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const description = String(formData.get("description") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "normal");
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;

  await prisma.task.create({
    data: { title, description, priority, dueDate, source: "PERSONAL", status: "open" },
  });
  redirect("/");
}

export async function createRecurringTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const description = String(formData.get("description") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "normal");
  const frequency = String(formData.get("frequency") ?? "DAILY");
  const intervalCount = Math.max(1, parseInt(String(formData.get("intervalCount") ?? "1"), 10));
  const daysOfWeek = formData
    .getAll("daysOfWeek")
    .map((v) => parseInt(String(v), 10))
    .filter((n) => !Number.isNaN(n));
  const dayOfMonthRaw = String(formData.get("dayOfMonth") ?? "");
  const dayOfMonth = dayOfMonthRaw ? parseInt(dayOfMonthRaw, 10) : null;
  const startDateRaw = String(formData.get("startDate") ?? "");
  const startDate = startDateRaw ? new Date(startDateRaw) : new Date();

  await prisma.recurringTask.create({
    data: {
      title,
      description,
      priority,
      frequency,
      intervalCount,
      daysOfWeek,
      dayOfMonth,
      startDate,
      nextDueDate: startDate,
    },
  });
  // Spawn the first occurrence immediately if the start date is now/past.
  if (startDate.getTime() <= Date.now()) {
    const created = await prisma.recurringTask.findFirst({
      where: { title, startDate },
      orderBy: { id: "desc" },
    });
    if (created) {
      await prisma.task.create({
        data: {
          title: created.title,
          description: created.description,
          priority: created.priority,
          source: "PERSONAL",
          dueDate: created.nextDueDate,
          recurringTaskId: created.id,
        },
      });
      const next = computeNextDueDate(
        created.frequency,
        created.intervalCount,
        created.daysOfWeek,
        created.dayOfMonth,
        created.nextDueDate,
      );
      await prisma.recurringTask.update({
        where: { id: created.id },
        data: { nextDueDate: next, lastSpawnedAt: new Date() },
      });
    }
  }
  redirect("/recurring");
}

export async function toggleRecurringActive(id: number, active: boolean) {
  await prisma.recurringTask.update({ where: { id }, data: { active } });
  revalidatePath("/recurring");
}

export async function deleteRecurringTask(id: number) {
  await prisma.recurringTask.delete({ where: { id } });
  revalidatePath("/recurring");
}

export async function runSyncNow() {
  const report = await syncAll();
  revalidatePath("/");
  return report;
}
