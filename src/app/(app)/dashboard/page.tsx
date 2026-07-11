import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeDashboardData, buildWindowDays } from "@/lib/dashboard";
import { DashboardCharts } from "@/components/dashboard-charts";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const now = new Date();
  const windowDays = buildWindowDays(now);
  const windowStart = windowDays[0];

  const [habits, tasksDueSoon] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: session.user.id, archived: false },
      orderBy: { order: "asc" },
      include: {
        entries: { where: { date: { gte: windowStart } } },
      },
    }),
    prisma.task.count({
      where: {
        userId: session.user.id,
        completed: false,
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const data = computeDashboardData(habits, now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your last 5 weeks of momentum, at a glance.
        </p>
      </div>

      <DashboardCharts
        weeklyData={data.weeklyData}
        overall={data.overall}
        analysisRows={data.analysisRows}
        topHabits={data.topHabits}
        bestStreak={data.bestStreak}
        habitCount={habits.length}
        tasksDueSoon={tasksDueSoon}
      />
    </div>
  );
}
