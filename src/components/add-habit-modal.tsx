"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLORS = ["#6366f1", "#0ca30c", "#eda100", "#e34948", "#1baf7a", "#e87ba4", "#eb6834", "#4a3aa7"];
const ICONS = ["✨", "💪", "📖", "🧘", "💧", "🏃", "🎯", "🚫", "🌅", "💤"];

export function AddHabitModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (habit: unknown) => void;
}) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Give your habit a name");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, icon, color, weeklyGoal }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create habit");
      return;
    }

    const { habit } = await res.json();
    onCreated({ ...habit, entries: [] });
    setTitle("");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setWeeklyGoal(7);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New habit">
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
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-base transition-colors ${
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
          <Label htmlFor="weekly-goal">Weekly goal (days per week)</Label>
          <Input
            id="weekly-goal"
            type="number"
            min={1}
            max={7}
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(Number(e.target.value))}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating…" : "Create habit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
