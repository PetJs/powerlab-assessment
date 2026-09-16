import { z } from "zod";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

const dueDateSchema = z
  .string()
  .trim()
  .min(1, "Due date is required")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Due date must be a valid date",
  })
  .refine(
    (value) => {
      // Compare against the start of today (not the current time) so any
      // time-of-day on today's date still passes.
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return new Date(value) >= startOfToday;
    },
    // createdAt is always "now" , so rejecting past due dates also
    // guarantees dueDate can never fall before a task's createdAt.
    { message: "Due date cannot be in the past" },
  );

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .or(z.literal("")),
  status: z.enum(TASK_STATUSES).default("TODO"),
  dueDate: dueDateSchema,
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
