"use client";

import { useTransition } from "react";
import { deleteRecurringTask, toggleRecurringActive } from "@/app/actions";

type Props = {
  item: {
    id: number;
    title: string;
    description: string | null;
    priority: string;
    frequency: string;
    intervalCount: number;
    daysOfWeek: number[];
    dayOfMonth: number | null;
    startDate: string;
    nextDueDate: string;
    lastSpawnedAt: string | null;
    active: boolean;
  };
};

const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function describeCadence(item: Props["item"]): string {
  const every = item.intervalCount > 1 ? `every ${item.intervalCount} ` : "";
  if (item.frequency === "DAILY") return `${every || "Every "}${item.intervalCount > 1 ? "days" : "day"}`;
  if (item.frequency === "WEEKLY") {
    const days = item.daysOfWeek.length
      ? item.daysOfWeek.sort().map((d) => DAY_LABEL[d]).join(", ")
      : "week";
    return `${every || "Every "}${item.intervalCount > 1 ? "weeks" : "week"} on ${days}`;
  }
  if (item.frequency === "MONTHLY") {
    return `${every || "Every "}${item.intervalCount > 1 ? "months" : "month"}${item.dayOfMonth ? ` on day ${item.dayOfMonth}` : ""}`;
  }
  return item.frequency;
}

export function RecurringRow({ item }: Props) {
  const [pending, start] = useTransition();
  return (
    <div className={`card flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${item.active ? "" : "opacity-60"}`}>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-ink">{item.title}</div>
        <div className="mt-1 text-xs text-sub">
          {describeCadence(item)} · next {new Date(item.nextDueDate).toLocaleString()}
        </div>
        {item.description && <div className="mt-1 text-xs text-sub whitespace-pre-wrap">{item.description}</div>}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="btn"
          disabled={pending}
          onClick={() => start(() => toggleRecurringActive(item.id, !item.active))}
        >
          {item.active ? "Pause" : "Resume"}
        </button>
        <button
          className="btn-danger"
          disabled={pending}
          onClick={() => start(() => deleteRecurringTask(item.id))}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
