"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, ListChecks, Circle } from "lucide-react";

export function TodayHabitProgress({
  scheduled,
  completed,
}: {
  scheduled: number;
  completed: number;
}) {
  const remaining = Math.max(scheduled - completed, 0);
  const percent = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
  const donutData = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: remaining },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {scheduled === 0 ? (
          <p className="text-sm text-muted-foreground">No habits scheduled for today.</p>
        ) : (
          <div className="flex items-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
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
                          <p className="text-muted-foreground">{p.value} habits</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold text-foreground">{percent}%</span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-3 gap-3">
              <StatTile icon={ListChecks} label="Scheduled" value={scheduled} />
              <StatTile icon={CheckCircle2} label="Done" value={completed} />
              <StatTile icon={Circle} label="Left" value={remaining} />
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
}: {
  icon: typeof ListChecks;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <Icon size={14} className="text-accent" />
      <p className="mt-1.5 text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
