"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function SettingsForm({
  user,
  initialSetting,
}: {
  user: { name: string; email: string };
  initialSetting: { dailyReminder: boolean; reminderHour: number; weeklySummary: boolean };
}) {
  const { theme, setTheme } = useTheme();
  const [dailyReminder, setDailyReminder] = useState(initialSetting.dailyReminder);
  const [reminderHour, setReminderHour] = useState(initialSetting.reminderHour);
  const [weeklySummary, setWeeklySummary] = useState(initialSetting.weeklySummary);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyReminder, reminderHour, weeklySummary }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user.name} disabled />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user.email} disabled />
            <p className="mt-1 text-xs text-subtle-foreground">
              Notification emails are sent to this address.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Laptop },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors",
                  mounted && theme === value
                    ? "border-ring bg-surface-raised text-foreground"
                    : "border-border text-muted-foreground hover:bg-surface-raised",
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Daily reminder</p>
              <p className="text-xs text-muted-foreground">
                A reminder email for habits you haven&apos;t checked off yet.
              </p>
            </div>
            <Switch checked={dailyReminder} onChange={setDailyReminder} label="Daily reminder" />
          </div>

          {dailyReminder && (
            <div>
              <Label htmlFor="reminder-hour">Send around</Label>
              <select
                id="reminder-hour"
                value={reminderHour}
                onChange={(e) => setReminderHour(Number(e.target.value))}
                className="h-10 w-40 rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-subtle-foreground">In your local time zone.</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium text-foreground">Weekly summary</p>
              <p className="text-xs text-muted-foreground">
                A recap of your progress every Monday morning.
              </p>
            </div>
            <Switch checked={weeklySummary} onChange={setWeeklySummary} label="Weekly summary" />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save preferences"}
            </Button>
            {saved && <span className="text-xs text-success">Saved</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
