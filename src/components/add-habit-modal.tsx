"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WEEKDAY_LABELS, WEEKDAY_SHORT_LABELS } from "@/lib/date-utils";
import type { Habit } from "@prisma/client";

const COLORS = [
  // Core
  "#6366f1", "#0ca30c", "#eda100", "#e34948", "#1baf7a", "#e87ba4", "#eb6834", "#4a3aa7",
  // Premium jewel tones
  "#1e40af", "#059669", "#be123c", "#7c3aed", "#b45309", "#b76e79",
  "#334155", "#92400e", "#1e293b", "#86198f", "#0f766e", "#7f1d1d",
];
const ICONS = [
  "✨", "💪", "📖", "🧘", "💧", "🏃", "🎯", "🚫", "🌅", "💤",
  "🙏", "🕌", "🕋", "📿", "🧠", "✍️", "💻", "🎨", "🎵", "🚶",
  "🚴", "🏋️", "🥗", "🍎", "🚭", "💊", "🧹", "💰", "📚", "🗣️",
  "😴", "☀️", "🌙", "🧴", "🪥", "☕", "🚰", "📵", "🧘‍♂️", "❤️",
];
const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export function AddHabitModal({
  open,
  onClose,
  habit,
  onCreated,
  onUpdated,
  onArchived,
}: {
  open: boolean;
  onClose: () => void;
  habit?: Habit | null;
  onCreated?: (habit: unknown) => void;
  onUpdated?: (habit: Habit) => void;
  onArchived?: (id: string) => void;
}) {
  const [title, setTitle] = useState(habit?.title ?? "");
  const [icon, setIcon] = useState(habit?.icon ?? ICONS[0]);
  const [color, setColor] = useState(habit?.color ?? COLORS[0]);
  const [activeWeekdays, setActiveWeekdays] = useState<number[]>(
    habit?.activeWeekdays ?? ALL_WEEKDAYS,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleWeekday(day: number) {
    setActiveWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function reset() {
    setTitle("");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setActiveWeekdays(ALL_WEEKDAYS);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Give your habit a name");
      return;
    }
    if (activeWeekdays.length === 0) {
      setError("Select at least one day");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = { title, icon, color, activeWeekdays };

    const res = habit
      ? await fetch(`/api/habits/${habit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save habit");
      return;
    }

    const body = await res.json();
    if (habit) {
      onUpdated?.(body.habit);
    } else {
      onCreated?.({ ...body.habit, entries: [] });
      reset();
    }
    onClose();
  }

  async function handleArchive() {
    if (!habit) return;
    setLoading(true);
    const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      onArchived?.(habit.id);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={habit ? "Edit habit" : "New habit"}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="habit-title">Name</Label>
          <Input
            id="habit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wake up at 5:00"
            autoFocus
          />
        </div>

        <div>
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border text-xl transition-colors ${
                  icon === i
                    ? "border-ring bg-surface-raised"
                    : "border-border hover:bg-surface-raised"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full ring-offset-2 ring-offset-surface transition-all"
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px ${c}` : undefined,
                }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Repeat on</Label>
          <div className="flex gap-1.5">
            {WEEKDAY_SHORT_LABELS.map((label, day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(day)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                  activeWeekdays.includes(day)
                    ? "border-ring bg-accent text-accent-foreground"
                    : "border-border text-muted-foreground hover:bg-surface-raised"
                }`}
                aria-pressed={activeWeekdays.includes(day)}
                aria-label={WEEKDAY_LABELS[day]}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-subtle-foreground">
            All days are selected by default — tap a day to exclude it.
          </p>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          {habit ? (
            <Button
              variant="ghost"
              type="button"
              onClick={handleArchive}
              disabled={loading}
              className="text-danger hover:bg-danger/10"
            >
              Archive
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving…" : habit ? "Save" : "Create habit"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
