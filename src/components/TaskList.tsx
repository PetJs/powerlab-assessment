import Link from "next/link";
import type { Task } from "../generated/prisma/client";

const STATUS_STYLES: Record<string, string> = {
  TODO: "bg-[#f4f4f5] text-[#3f3f46]",
  IN_PROGRESS: "bg-[#fef3c7] text-[#92400e]",
  DONE: "bg-[#dcfce7] text-[#166534]",
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export default function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-[#e5e5e5] px-6 py-12 text-center text-sm text-[#71717a]">
        No tasks yet. Create your first task.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link
            href={`/tasks?task=${task.id}`}
            title="Click to view"
            className="flex items-center justify-between gap-4 rounded-lg border border-[#e5e5e5] px-4 py-3 hover:bg-[#fafafa]"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium text-[#171717]">{task.title}</span>
              <span className="text-xs text-[#71717a]">
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                STATUS_STYLES[task.status] ?? STATUS_STYLES.TODO
              }`}
            >
              {STATUS_LABELS[task.status] ?? task.status}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
