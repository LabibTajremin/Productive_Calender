import type { Task } from "@prisma/client";

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  overdue: number;
  onTime: number;
  late: number;
  onTimeRate: number | null;
}

export function computeTaskStats(tasks: Task[], now: Date): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate !== null && t.dueDate < now,
  ).length;

  let onTime = 0;
  let late = 0;
  for (const t of tasks) {
    if (!t.completed || !t.dueDate || !t.completedAt) continue;
    if (t.completedAt <= t.dueDate) onTime += 1;
    else late += 1;
  }
  const onTimeTotal = onTime + late;
  const onTimeRate = onTimeTotal === 0 ? null : Math.round((onTime / onTimeTotal) * 100);

  return { total, completed, pending, completionRate, overdue, onTime, late, onTimeRate };
}
