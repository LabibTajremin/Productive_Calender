import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { weeklySummaryEmail } from "@/lib/email-templates";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { computeDashboardData, buildWindowDays } from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = getResendClient();
  const now = new Date();
  const windowStart = buildWindowDays(now)[0];

  const users = await prisma.user.findMany({
    where: { notificationSetting: { weeklySummary: true } },
    include: {
      notificationSetting: true,
      habits: {
        where: { archived: false },
        include: { entries: { where: { date: { gte: windowStart } } } },
      },
    },
  });

  let sent = 0;
  const results: { email: string; status: string }[] = [];

  for (const user of users) {
    if (user.habits.length === 0) {
      results.push({ email: user.email, status: "skipped-no-habits" });
      continue;
    }

    if (!resend) {
      results.push({ email: user.email, status: "skipped-no-resend-key" });
      continue;
    }

    const data = computeDashboardData(user.habits, now);

    const { subject, html } = weeklySummaryEmail({
      name: user.name,
      percent: data.overall.percent,
      completed: data.overall.completed,
      total: data.overall.total,
      topHabit: data.topHabits[0]?.title ?? null,
    });

    await resend.emails.send({ from: EMAIL_FROM, to: user.email, subject, html });
    sent += 1;
    results.push({ email: user.email, status: "sent" });
  }

  return NextResponse.json({ checked: users.length, sent, results });
}
