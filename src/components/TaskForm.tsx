"use client";

import { useState } from "react";

type TaskFormValues = {
  title: string;
  description: string;
  status: string;
  dueDate: string;
};

const STATUS_OPTIONS = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

const DEFAULT_VALUES: TaskFormValues = {
  title: "",
  description: "",
  status: "TODO",
  dueDate: "",
};

export default function TaskForm({
  mode,
  taskId,
  initialValues,
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  taskId?: string;
  initialValues?: TaskFormValues;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<TaskFormValues>(initialValues ?? DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const url = mode === "create" ? "/api/tasks" : `/api/tasks/${taskId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.status === 400) {
        const data = await response.json();
        setFieldErrors(data.errors ?? {});
        setFormError(data.error ?? null);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setFormError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      onSuccess();
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(field: string) {
    return fieldErrors[field]?.[0];
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {formError && (
        <p className="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">{formError}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-[#171717]">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          className="rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm"
        />
        {fieldError("title") && <p className="text-xs text-[#b91c1c]">{fieldError("title")}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-[#171717]">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          className="rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm"
        />
        {fieldError("description") && (
          <p className="text-xs text-[#b91c1c]">{fieldError("description")}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium text-[#171717]">
          Status
        </label>
        <select
          id="status"
          value={values.status}
          onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
          className="rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldError("status") && <p className="text-xs text-[#b91c1c]">{fieldError("status")}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="dueDate" className="text-sm font-medium text-[#171717]">
          Due date
        </label>
        <input
          id="dueDate"
          type="date"
          value={values.dueDate}
          onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
          className="rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm"
        />
        {fieldError("dueDate") && (
          <p className="text-xs text-[#b91c1c]">{fieldError("dueDate")}</p>
        )}
      </div>

      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#171717] px-5 py-2 text-sm font-medium text-[#ffffff] disabled:opacity-50"
        >
          {submitting ? "Saving..." : mode === "create" ? "Create task" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[#e5e5e5] px-5 py-2 text-sm font-medium text-[#171717]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
