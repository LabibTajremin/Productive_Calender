import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { dailyReminderEmail } from "@/lib/email-templates";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { toDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = getResendClient();
  const now = new Date();
  const todayKey = toDateKey(now);
  const todayStart = new Date(`${todayKey}T00:00:00.000Z`);

  const users = await prisma.user.findMany({
    where: { notificationSetting: { dailyReminder: true } },
    include: {
      notificationSetting: true,
      habits: {
        where: { archived: false },
        include: { entries: { where: { date: todayStart } } },
      },
    },
  });

  let sent = 0;
  const results: { email: string; status: string }[] = [];

  for (const user of users) {
    const pending = user.habits.filter((h) => !h.entries.some((e) => e.completed));
    if (pending.length === 0) {
      results.push({ email: user.email, status: "skipped-no-pending" });
      continue;
    }

    if (!resend) {
      results.push({ email: user.email, status: "skipped-no-resend-key" });
      continue;
    }

    const { subject, html } = dailyReminderEmail({
      name: user.name,
      pendingHabits: pending.map((h) => `${h.icon} ${h.title}`),
    });

    await resend.emails.send({ from: EMAIL_FROM, to: user.email, subject, html });
    sent += 1;
    results.push({ email: user.email, status: "sent" });
  }

  return NextResponse.json({ checked: users.length, sent, results });
}
