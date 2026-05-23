"use client";

import { useTransition } from "react";
import {
  completeTask,
  dismissTask,
  reopenTask,
  snoozeTask,
} from "@/app/actions";
import { SOURCE_COLOR, SOURCE_LABEL, type Source } from "@/lib/sources";

type Props = {
  task: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    source: string;
    sourceUrl: string | null;
    dueDate: Date | null;
  };
};

function formatDue(d: Date | null): { label: string; tone: string } | null {
  if (!d) return null;
  const ms = d.getTime() - Date.now();
  const days = Math.round(ms / 86_400_000);
  if (ms < 0) return { label: `${-days}d overdue`, tone: "text-danger" };
  if (days === 0) return { label: "Due today", tone: "text-warn" };
  if (days === 1) return { label: "Due tomorrow", tone: "text-warn" };
  if (days < 7) return { label: `Due in ${days}d`, tone: "text-sub" };
  return { label: d.toLocaleDateString(), tone: "text-sub" };
}

const PRIORITY_CHIP: Record<string, string> = {
  urgent: "ring-danger/40 bg-danger/10 text-danger",
  high: "ring-warn/40 bg-warn/10 text-warn",
  normal: "ring-line bg-muted text-sub",
  low: "ring-line bg-muted text-sub/70",
};

export function TaskRow({ task }: Props) {
  const [pending, start] = useTransition();
  const due = formatDue(task.dueDate);
  const sourceClass = SOURCE_COLOR[task.source as Source] ?? "bg-muted text-sub ring-line";
  const isDone = task.status === "done" || task.status === "dismissed";

  return (
    <div className={`card flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${isDone ? "opacity-60" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`chip ${sourceClass}`}>{SOURCE_LABEL[task.source as Source] ?? task.source}</span>
          {task.priority !== "normal" && (
            <span className={`chip ${PRIORITY_CHIP[task.priority] ?? ""}`}>{task.priority}</span>
          )}
          {due && <span className={`text-xs ${due.tone}`}>{due.label}</span>}
        </div>
        <div className={`mt-1 text-sm ${isDone ? "line-through text-sub" : "text-ink"}`}>{task.title}</div>
        {task.description && <div className="mt-1 text-xs text-sub whitespace-pre-wrap">{task.description}</div>}
        {task.sourceUrl && (
          <a href={task.sourceUrl} target="_blank" rel="noopener" className="mt-1 inline-block text-xs text-accent hover:underline">
            Open in source ↗
          </a>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isDone ? (
          <button className="btn" disabled={pending} onClick={() => start(() => reopenTask(task.id))}>
            Reopen
          </button>
        ) : (
          <>
            <button className="btn-primary" disabled={pending} onClick={() => start(() => completeTask(task.id))}>
              Done
            </button>
            <button className="btn" disabled={pending} onClick={() => start(() => snoozeTask(task.id, 1))}>
              Snooze 1d
            </button>
            <button className="btn" disabled={pending} onClick={() => start(() => snoozeTask(task.id, 7))}>
              7d
            </button>
            <button className="btn-danger" disabled={pending} onClick={() => start(() => dismissTask(task.id))}>
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}
