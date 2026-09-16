import { NextRequest, NextResponse } from "next/server";
import { flattenError } from "zod";
import { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validation";

// Route handlers receive dynamic params as a Promise, not a plain json object.
type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to load task", error);
    return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = updateTaskSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: flattenError(result.error).fieldErrors }, { status: 400 });
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      // updateTask Schema is a partial schema, so only fields actually present in the request body are included in the update, empty field are left rather than overwritting it.
      data: {
        ...(result.data.title !== undefined && { title: result.data.title }),
        ...(result.data.description !== undefined && {
          description: result.data.description || null,
        }),
        ...(result.data.status !== undefined && { status: result.data.status }),
        ...(result.data.dueDate !== undefined && { dueDate: new Date(result.data.dueDate) }),
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    // P2025 = Prisma's "record not found" code, thrown when `where` matches no row.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    console.error("Failed to update task", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    console.error("Failed to delete task", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
