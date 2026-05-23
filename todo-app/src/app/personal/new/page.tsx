import Link from "next/link";
import { createPersonalTask } from "@/app/actions";

export default function NewPersonalTaskPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-lg font-semibold">New personal task</h1>
      <form action={createPersonalTask} className="card flex flex-col gap-4">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" required className="input" placeholder="e.g. Call accountant" />
        </div>
        <div>
          <label className="label" htmlFor="description">Notes</label>
          <textarea id="description" name="description" rows={3} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="priority">Priority</label>
            <select id="priority" name="priority" className="input" defaultValue="normal">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dueDate">Due date</label>
            <input id="dueDate" name="dueDate" type="date" className="input" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Link href="/" className="btn">Cancel</Link>
          <button type="submit" className="btn-primary">Add task</button>
        </div>
      </form>
    </div>
  );
}
