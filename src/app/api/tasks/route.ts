import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { taskSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const tasks = await prisma.task.findMany({
    where: { userId: auth.userId },
    orderBy: [{ completed: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { title, note, dueDate, priority } = parsed.data;

  const count = await prisma.task.count({ where: { userId: auth.userId } });

  const task = await prisma.task.create({
    data: {
      userId: auth.userId,
      title,
      note,
      priority,
      order: count,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
