import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/task-list";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: [{ completed: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan your day, attach notes, and keep track of what matters.
        </p>
      </div>

      <TaskList initialTasks={tasks} />
    </div>
  );
}
