import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HabitGrid } from "@/components/habit-grid";
import { TodayHabitProgress } from "@/components/today-habit-progress";
import { toDateKey } from "@/lib/utils";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const now = new Date();
  const params = await searchParams;
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth();

  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const [habits, user] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: session.user.id, archived: false },
      orderBy: { order: "asc" },
      include: {
        entries: {
          where: { date: { gte: start, lte: end } },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { showHabitTicks: true },
    }),
  ]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  let todayScheduled = 0;
  let todayCompleted = 0;

  if (isCurrentMonth) {
    const todayDate = new Date(`${toDateKey(now)}T00:00:00.000Z`);
    const todayDow = now.getDay();
    for (const habit of habits) {
      if (!habit.activeWeekdays.includes(todayDow)) continue;
      todayScheduled += 1;
      const entry = habit.entries.find((e) => e.date.getTime() === todayDate.getTime());
      if (entry?.completed) todayCompleted += 1;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Habit Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check off each day you show up. Click a day for details or to leave a note.
        </p>
      </div>

      {isCurrentMonth && (
        <TodayHabitProgress scheduled={todayScheduled} completed={todayCompleted} />
      )}

      <HabitGrid
        initialHabits={habits}
        year={year}
        month={month}
        showTicks={user?.showHabitTicks ?? true}
      />
    </div>
  );
}
