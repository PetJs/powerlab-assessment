"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cancel01Icon, Delete02Icon, PencilEdit02Icon } from "hugeicons-react";
import TaskForm from "@/components/TaskForm";
import type { Task } from "../generated/prisma/client";

// Dates come back as ISO strings over JSON, not Date instances like on the server.
type TaskDto = Omit<Task, "dueDate" | "createdAt" | "updatedAt"> & {
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

// Same status -> color/label mapping as TaskList, so the pill matches whichever color the task shows in the list.
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

export default function TaskModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskParam = searchParams.get("task");
  const isEdit = searchParams.get("edit") === "1";
  const isNew = taskParam === "new";
  const isOpen = Boolean(taskParam);

  const [task, setTask] = useState<TaskDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch the task whenever a real id is present in the URL (view or edit mode).
  useEffect(() => {
    if (!taskParam || isNew) {
      setTask(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/tasks/${taskParam}`)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error ?? "Failed to load task");
        }
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setTask(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load task");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [taskParam, isNew]);

  // Close the modal by dropping the query params, and refresh so the server-rendered list reflects any change made while it was open.
  function close() {
    router.push("/tasks");
    router.refresh();
  }

  function openEdit() {
    router.push(`/tasks?task=${taskParam}&edit=1`);
  }

  async function handleDelete() {
    if (!taskParam) return;
    if (!window.confirm("Delete this task? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${taskParam}`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Failed to delete task.");
        return;
      }
      close();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-lg border border-[#e5e5e5] bg-[#ffffff] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 cursor-pointer top-4 text-[#71717a]"
        >
          <Cancel01Icon size={18} />
        </button>

        {isNew && (
          <>
            <h2 className="mb-4 pr-8 text-lg font-semibold text-[#171717]">New Task</h2>
            <TaskForm mode="create" onSuccess={close} onCancel={close} />
          </>
        )}

        {!isNew && loading && <p className="pr-8 text-sm text-[#71717a]">Loading...</p>}

        {!isNew && error && !loading && (
          <p className="pr-8 text-sm text-[#b91c1c]">{error}</p>
        )}

        {!isNew && !loading && !error && task && isEdit && (
          <>
            <h2 className="mb-4 pr-8 text-lg font-semibold text-[#171717]">Edit Task</h2>
            <TaskForm
              mode="edit"
              taskId={task.id}
              initialValues={{
                title: task.title,
                description: task.description ?? "",
                status: task.status,
                dueDate: task.dueDate.slice(0, 10),
              }}
              onSuccess={close}
              onCancel={close}
            />
          </>
        )}

        {!isNew && !loading && !error && task && !isEdit && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 pr-8">
              <h2 className="text-lg font-semibold text-[#171717]">{task.title}</h2>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  STATUS_STYLES[task.status] ?? STATUS_STYLES.TODO
                }`}
              >
                {STATUS_LABELS[task.status] ?? task.status}
              </span>
            </div>

            <p className="whitespace-pre-wrap text-sm text-[#171717]">
              {task.description || "No description provided."}
            </p>

            <div className="text-xs text-[#71717a]">
              Created {new Date(task.createdAt).toLocaleString()}
            </div>
            
            <div className="text-xs text-[#71717a]">
              Due {new Date(task.dueDate).toLocaleDateString()}
            </div>
            

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={openEdit}
                className="flex items-center gap-1.5 rounded-full border border-[#e5e5e5] px-4 py-2 text-sm font-medium text-[#171717]"
              >
                <PencilEdit02Icon size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-full border border-[#e5e5e5] px-4 py-2 text-sm font-medium text-[#b91c1c] disabled:opacity-50"
              >
                <Delete02Icon size={16} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
