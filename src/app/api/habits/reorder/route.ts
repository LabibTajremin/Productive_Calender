import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { reorderSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { orderedIds } = parsed.data;

  const owned = await prisma.habit.findMany({
    where: { id: { in: orderedIds }, userId: auth.userId },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((h) => h.id));

  if (ownedIds.size !== orderedIds.length) {
    return NextResponse.json({ error: "One or more habits not found" }, { status: 404 });
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.habit.update({ where: { id }, data: { order: index } }),
    ),
  );

  return NextResponse.json({ ok: true });
}
