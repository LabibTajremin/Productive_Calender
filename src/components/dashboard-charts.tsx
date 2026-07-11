"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flame, ListChecks, Percent, Sparkles } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import type { AnalysisRow, WeekBucket } from "@/lib/dashboard";

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: WeekBucket }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const { completed, possible } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {completed} of {possible} check-ins
      </p>
    </div>
  );
}

export function DashboardCharts({
  weeklyData,
  overall,
  analysisRows,
  topHabits,
  bestStreak,
  habitCount,
  tasksDueSoon,
}: {
  weeklyData: WeekBucket[];
  overall: { completed: number; total: number; percent: number };
  analysisRows: AnalysisRow[];
  topHabits: AnalysisRow[];
  bestStreak: { habitTitle: string; streak: number } | null;
  habitCount: number;
  tasksDueSoon: number;
}) {
  const donutData = [
    { name: "Completed", value: overall.completed },
    { name: "Remaining", value: Math.max(overall.total - overall.completed, 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Active habits"
          value={String(habitCount)}
          icon={Sparkles}
          hint="Tracked daily"
        />
        <StatCard
          label="35-day completion"
          value={`${overall.percent}%`}
          icon={Percent}
          hint={`${overall.completed}/${overall.total} check-ins`}
        />
        <StatCard
          label="Best streak"
          value={bestStreak ? `${bestStreak.streak}d` : "—"}
          icon={Flame}
          hint={bestStreak?.habitTitle ?? "Start today"}
        />
        <StatCard
          label="Tasks due soon"
          value={String(tasksDueSoon)}
          icon={ListChecks}
          hint="Next 7 days"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--chart-grid)"
                    strokeDasharray="0"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: "var(--chart-axis)" }}
                    tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
                    width={36}
                    allowDecimals={false}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "var(--chart-grid)", opacity: 0.4 }} />
                  <Bar
                    dataKey="completed"
                    fill="var(--series-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overall Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="68%"
                    outerRadius="88%"
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
                          <p className="text-muted-foreground">{p.value} check-ins</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-foreground">{overall.percent}%</span>
                <span className="text-xs text-muted-foreground">completed</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--series-1)" }} />
                Completed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--chart-grid)" }} />
                Remaining
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Analysis</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {analysisRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No habits yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Habit</th>
                    <th className="pb-2 font-medium tabular-nums">Goal</th>
                    <th className="pb-2 font-medium tabular-nums">Actual</th>
                    <th className="pb-2 font-medium tabular-nums">Left</th>
                    <th className="pb-2 font-medium">Progress</th>
                    <th className="pb-2 text-right font-medium tabular-nums">%</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisRows.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="py-2 pr-2">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <span>{row.icon}</span>
                          {row.title}
                        </span>
                      </td>
                      <td className="tabular-nums text-muted-foreground">{row.goal}</td>
                      <td className="tabular-nums text-muted-foreground">{row.actual}</td>
                      <td className="tabular-nums text-muted-foreground">{row.left}</td>
                      <td className="py-2 pr-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--chart-grid)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(row.percent, 100)}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                      </td>
                      <td className="text-right tabular-nums font-medium text-foreground">
                        {row.percent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No habits yet.</p>
            ) : (
              topHabits.map((row, i) => (
                <div key={row.id} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-semibold text-subtle-foreground">
                    {i + 1}
                  </span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs"
                    style={{ backgroundColor: `${row.color}22` }}
                  >
                    {row.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {row.percent}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--chart-grid)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(row.percent, 100)}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
