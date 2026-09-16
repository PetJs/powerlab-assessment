import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";

// Stop static rendering/caching so this page always reflects the latest tasks instead of a static page.
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  // Fetch all tasks directly (Server Component, runs on the server), newest first.
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#171717]">Tasks</h1>
        <Link
          href="/tasks?task=new"
          className="rounded-full bg-[#171717] px-4 py-2 text-sm font-medium text-[#ffffff]"
        >
          New Task
        </Link>
      </div>
      <TaskList tasks={tasks} />
      {/* useSearchParams in TaskModal requires a Suspense boundary */}
      <Suspense>
        <TaskModal />
      </Suspense>
    </div>
  );
}
