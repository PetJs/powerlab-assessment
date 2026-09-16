import { NextRequest, NextResponse } from "next/server";
import { flattenError } from "zod";
import { prisma } from "@/lib/db";
import { createTaskSchema, TASK_STATUSES } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const statusParam = request.nextUrl.searchParams.get("status");

  if (
    statusParam &&
    !TASK_STATUSES.includes(statusParam as (typeof TASK_STATUSES)[number])
  ) {
    return NextResponse.json(
      { error: `Invalid status filter. Must be one of: ${TASK_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const tasks = await prisma.task.findMany({
      where: statusParam ? { status: statusParam } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to list tasks", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = createTaskSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: flattenError(result.error).fieldErrors }, { status: 400 });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title: result.data.title,
        description: result.data.description || null,
        status: result.data.status,
        dueDate: new Date(result.data.dueDate),
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
