import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { habitSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const habits = await prisma.habit.findMany({
    where: { userId: auth.userId, archived: false },
    orderBy: { order: "asc" },
    include: {
      entries:
        start && end
          ? {
              where: {
                date: {
                  gte: new Date(`${start}T00:00:00.000Z`),
                  lte: new Date(`${end}T23:59:59.999Z`),
                },
              },
            }
          : false,
    },
  });

  return NextResponse.json({ habits });
}

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = habitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const count = await prisma.habit.count({ where: { userId: auth.userId } });

  const habit = await prisma.habit.create({
    data: {
      ...parsed.data,
      userId: auth.userId,
      order: count,
    },
  });

  return NextResponse.json({ habit }, { status: 201 });
}
