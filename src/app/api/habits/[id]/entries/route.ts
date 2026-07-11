import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { habitEntrySchema } from "@/lib/validation";

type Params = Promise<{ id: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = habitEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { date, completed, note } = parsed.data;
  const dateValue = new Date(`${date}T00:00:00.000Z`);

  const entry = await prisma.habitEntry.upsert({
    where: { habitId_date: { habitId: id, date: dateValue } },
    create: { habitId: id, date: dateValue, completed, note },
    update: { completed, note },
  });

  return NextResponse.json({ entry });
}
