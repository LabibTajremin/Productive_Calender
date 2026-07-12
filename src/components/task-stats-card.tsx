"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ListChecks, CheckCircle2, AlertTriangle, Target } from "lucide-react";
import type { TaskStats } from "@/lib/task-stats";

export function TaskStatsCard({ stats }: { stats: TaskStats }) {
  const donutData = [
    { name: "Completed", value: stats.completed },
    { name: "Pending", value: stats.pending },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.total === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 self-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="68%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  >
                    <Cell fill="var(--series-1)" />
                    <Cell fill="var(--chart-grid)" />
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0];
                      return (
                        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-muted-foreground">{p.value} tasks</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {stats.completionRate}%
                </span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile icon={ListChecks} label="Total" value={String(stats.total)} />
              <StatTile icon={CheckCircle2} label="Completed" value={String(stats.completed)} />
              <StatTile
                icon={AlertTriangle}
                label="Overdue"
                value={String(stats.overdue)}
                tone={stats.overdue > 0 ? "danger" : undefined}
              />
              <StatTile
                icon={Target}
                label="On-time rate"
                value={stats.onTimeRate === null ? "—" : `${stats.onTimeRate}%`}
                tone={
                  stats.onTimeRate === null
                    ? undefined
                    : stats.onTimeRate >= 80
                      ? "success"
                      : stats.onTimeRate >= 50
                        ? "warning"
                        : "danger"
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ListChecks;
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-accent";

  return (
    <div className="rounded-xl border border-border p-3">
      <Icon size={14} className={toneClass} />
      <p className="mt-1.5 text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
