import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { title, note, dueDate, priority, completed } = body as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = String(title).trim().slice(0, 200);
  if (note !== undefined) data.note = note === null ? null : String(note).slice(0, 4000);
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate as string) : null;
  if (priority !== undefined) data.priority = priority;
  if (completed !== undefined) {
    const nextCompleted = Boolean(completed);
    data.completed = nextCompleted;
    if (nextCompleted && !task.completed) {
      data.completedAt = new Date();
    } else if (!nextCompleted) {
      data.completedAt = null;
    }
  }

  const updated = await prisma.task.update({ where: { id }, data });

  return NextResponse.json({ task: updated });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
