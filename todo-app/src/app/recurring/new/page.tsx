import Link from "next/link";
import { createRecurringTask } from "@/app/actions";

const DAYS = [
  { v: 0, l: "Sun" },
  { v: 1, l: "Mon" },
  { v: 2, l: "Tue" },
  { v: 3, l: "Wed" },
  { v: 4, l: "Thu" },
  { v: 5, l: "Fri" },
  { v: 6, l: "Sat" },
];

export default function NewRecurringPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-lg font-semibold">New recurring task</h1>
      <form action={createRecurringTask} className="card flex flex-col gap-4">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" required className="input" placeholder="e.g. Reconcile inventory" />
        </div>
        <div>
          <label className="label" htmlFor="description">Notes</label>
          <textarea id="description" name="description" rows={2} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="frequency">Frequency</label>
            <select id="frequency" name="frequency" className="input" defaultValue="WEEKLY">
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="intervalCount">Every (N)</label>
            <input id="intervalCount" name="intervalCount" type="number" min={1} defaultValue={1} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Days of week (weekly only)</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <label key={d.v} className="inline-flex items-center gap-1 rounded-md border border-line bg-muted px-2 py-1 text-xs">
                <input type="checkbox" name="daysOfWeek" value={d.v} />
                {d.l}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="dayOfMonth">Day of month (monthly only)</label>
            <input id="dayOfMonth" name="dayOfMonth" type="number" min={1} max={31} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="priority">Priority</label>
            <select id="priority" name="priority" className="input" defaultValue="normal">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="startDate">First occurrence</label>
          <input id="startDate" name="startDate" type="datetime-local" className="input" />
        </div>
        <div className="flex justify-end gap-2">
          <Link href="/recurring" className="btn">Cancel</Link>
          <button type="submit" className="btn-primary">Create</button>
        </div>
      </form>
    </div>
  );
}
