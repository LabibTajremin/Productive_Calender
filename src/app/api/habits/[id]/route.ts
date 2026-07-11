import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { habitSchema } from "@/lib/validation";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = habitSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const updated = await prisma.habit.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ habit: updated });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.habit.update({ where: { id }, data: { archived: true } });

  return NextResponse.json({ ok: true });
}
