import { isSameDay } from "@/lib/date-utils";
import type { Habit, HabitEntry } from "@prisma/client";

export type HabitWithEntries = Habit & { entries: HabitEntry[] };

export interface WeekBucket {
  label: string;
  completed: number;
  possible: number;
}

export interface AnalysisRow {
  id: string;
  title: string;
  icon: string;
  color: string;
  goal: number;
  actual: number;
  left: number;
  percent: number;
}

export interface DashboardData {
  windowDays: Date[];
  weeklyData: WeekBucket[];
  overall: { completed: number; total: number; percent: number };
  analysisRows: AnalysisRow[];
  topHabits: AnalysisRow[];
  bestStreak: { habitTitle: string; streak: number } | null;
}

const WEEKS = 5;
const DAYS_PER_WEEK = 7;

export function buildWindowDays(referenceDate: Date): Date[] {
  const totalDays = WEEKS * DAYS_PER_WEEK;
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (totalDays - 1 - i));
    return d;
  });
}

function currentStreak(habit: HabitWithEntries, referenceDate: Date): number {
  let streak = 0;
  const cursor = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  while (true) {
    const entry = habit.entries.find((e) => isSameDay(new Date(e.date), cursor));
    if (entry?.completed) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function isScheduled(habit: HabitWithEntries, date: Date): boolean {
  return habit.activeWeekdays.includes(date.getDay());
}

export function computeDashboardData(
  habits: HabitWithEntries[],
  referenceDate: Date,
): DashboardData {
  const windowDays = buildWindowDays(referenceDate);

  const weeklyData: WeekBucket[] = Array.from({ length: WEEKS }, (_, weekIndex) => {
    const weekDays = windowDays.slice(weekIndex * DAYS_PER_WEEK, (weekIndex + 1) * DAYS_PER_WEEK);
    let completed = 0;
    let possible = 0;
    for (const habit of habits) {
      for (const day of weekDays) {
        if (!isScheduled(habit, day)) continue;
        possible += 1;
        const entry = habit.entries.find((e) => isSameDay(new Date(e.date), day));
        if (entry?.completed) completed += 1;
      }
    }
    return {
      label: `Week ${weekIndex + 1}`,
      completed,
      possible,
    };
  });

  const totalCompleted = weeklyData.reduce((sum, w) => sum + w.completed, 0);
  const totalPossible = weeklyData.reduce((sum, w) => sum + w.possible, 0);

  const analysisRows: AnalysisRow[] = habits.map((habit) => {
    const scheduledDays = windowDays.filter((d) => isScheduled(habit, d));
    const goal = Math.max(1, scheduledDays.length);
    const actual = habit.entries.filter(
      (e) => e.completed && scheduledDays.some((d) => isSameDay(d, new Date(e.date))),
    ).length;
    const left = Math.max(goal - actual, 0);
    const percent = Math.round((actual / goal) * 100);

    return {
      id: habit.id,
      title: habit.title,
      icon: habit.icon,
      color: habit.color,
      goal,
      actual,
      left,
      percent,
    };
  });

  const topHabits = [...analysisRows].sort((a, b) => b.percent - a.percent).slice(0, 5);

  let bestStreak: DashboardData["bestStreak"] = null;
  for (const habit of habits) {
    const streak = currentStreak(habit, referenceDate);
    if (streak > 0 && (!bestStreak || streak > bestStreak.streak)) {
      bestStreak = { habitTitle: habit.title, streak };
    }
  }

  return {
    windowDays,
    weeklyData,
    overall: {
      completed: totalCompleted,
      total: totalPossible,
      percent: totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100),
    },
    analysisRows,
    topHabits,
    bestStreak,
  };
}
