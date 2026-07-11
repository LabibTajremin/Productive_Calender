import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { notificationSettingSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const setting = await prisma.notificationSetting.upsert({
    where: { userId: auth.userId },
    create: { userId: auth.userId },
    update: {},
  });

  return NextResponse.json({ setting });
}

export async function PATCH(request: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = notificationSettingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const setting = await prisma.notificationSetting.upsert({
    where: { userId: auth.userId },
    create: { userId: auth.userId, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ setting });
}
