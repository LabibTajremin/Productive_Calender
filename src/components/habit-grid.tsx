"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, StickyNote, Check, GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getMonthMatrix, monthLabel, weekdayShort, isSameDay } from "@/lib/date-utils";
import { toDateKey } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AddHabitModal } from "@/components/add-habit-modal";
import { EntryModal } from "@/components/entry-modal";
import type { Habit, HabitEntry } from "@prisma/client";

type HabitWithEntries = Habit & { entries: HabitEntry[] };

export function HabitGrid({
  initialHabits,
  year,
  month,
  showTicks,
}: {
  initialHabits: HabitWithEntries[];
  year: number;
  month: number;
  showTicks: boolean;
}) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [addOpen, setAddOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<{ habit: HabitWithEntries; date: Date } | null>(
    null,
  );

  const days = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const today = new Date();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    const params = new URLSearchParams({
      year: String(next.getFullYear()),
      month: String(next.getMonth()),
    });
    router.push(`/calendar?${params.toString()}`);
  }

  function entryFor(habit: HabitWithEntries, date: Date) {
    return habit.entries.find((e) => isSameDay(new Date(e.date), date));
  }

  function updateEntry(habitId: string, date: Date, completed: boolean, note: string) {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const others = h.entries.filter((e) => !isSameDay(new Date(e.date), date));
        return {
          ...h,
          entries: [
            ...others,
            {
              id: `${habitId}-${toDateKey(date)}`,
              habitId,
              date,
              completed,
              note: note || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as HabitEntry,
          ],
        };
      }),
    );
  }

  async function quickToggle(habit: HabitWithEntries, date: Date) {
    const existing = entryFor(habit, date);
    const nextCompleted = !existing?.completed;
    updateEntry(habit.id, date, nextCompleted, existing?.note ?? "");

    await fetch(`/api/habits/${habit.id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: toDateKey(date),
        completed: nextCompleted,
        note: existing?.note ?? null,
      }),
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(habits, oldIndex, newIndex);
    setHabits(reordered);

    await fetch("/api/habits/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((h) => h.id) }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface-raised hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="w-40 text-center text-sm font-semibold text-foreground">
            {monthLabel(year, month)}
          </h2>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface-raised hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={15} />
          Add habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No habits yet. Add your first one to start tracking.
          </p>
        </div>
      ) : (
        <DndContext
          id="habit-grid-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-[200px] border-b border-border bg-surface px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Habit
                  </th>
                  {days.map((d) => (
                    <th
                      key={d.toISOString()}
                      className={`border-b border-border px-1 py-2 text-center text-[11px] font-medium ${
                        isSameDay(d, today) ? "text-accent" : "text-subtle-foreground"
                      }`}
                    >
                      <div>{weekdayShort(d)}</div>
                      <div>{d.getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <SortableContext
                items={habits.map((h) => h.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {habits.map((habit) => (
                    <SortableHabitRow
                      key={habit.id}
                      habit={habit}
                      days={days}
                      today={today}
                      showTicks={showTicks}
                      entryFor={entryFor}
                      quickToggle={quickToggle}
                      onOpenEntry={(date) => setActiveCell({ habit, date })}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
      )}

      <p className="text-xs text-subtle-foreground">
        Tip: drag the grip to reorder · click a day to toggle it done · right-click (or
        double-click) to add a note.
      </p>

      <AddHabitModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(habit) => setHabits((prev) => [...prev, habit as HabitWithEntries])}
      />

      {activeCell && (
        <EntryModal
          open
          onClose={() => setActiveCell(null)}
          habitId={activeCell.habit.id}
          habitTitle={activeCell.habit.title}
          dateKey={toDateKey(activeCell.date)}
          dateLabel={activeCell.date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          initialCompleted={entryFor(activeCell.habit, activeCell.date)?.completed ?? false}
          initialNote={entryFor(activeCell.habit, activeCell.date)?.note ?? ""}
          onSaved={(completed, note) => updateEntry(activeCell.habit.id, activeCell.date, completed, note)}
        />
      )}
    </div>
  );
}

function SortableHabitRow({
  habit,
  days,
  today,
  showTicks,
  entryFor,
  quickToggle,
  onOpenEntry,
}: {
  habit: HabitWithEntries;
  days: Date[];
  today: Date;
  showTicks: boolean;
  entryFor: (habit: HabitWithEntries, date: Date) => HabitEntry | undefined;
  quickToggle: (habit: HabitWithEntries, date: Date) => void;
  onOpenEntry: (date: Date) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  });

  const completedCount = habit.entries.filter((e) => e.completed).length;

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-20 bg-surface-raised" : "group"}
    >
      <td className="sticky left-0 z-10 border-b border-border bg-surface px-2 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex h-6 w-4 shrink-0 cursor-grab items-center justify-center text-subtle-foreground opacity-0 group-hover:opacity-100 active:cursor-grabbing"
            aria-label={`Drag to reorder ${habit.title}`}
          >
            <GripVertical size={14} />
          </button>
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs"
            style={{ backgroundColor: `${habit.color}22` }}
          >
            {habit.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{habit.title}</p>
            <p className="text-[10px] text-subtle-foreground">
              {completedCount}/{days.length} days
            </p>
          </div>
        </div>
      </td>
      {days.map((d) => {
        const entry = entryFor(habit, d);
        const isFuture = d > today && !isSameDay(d, today);
        return (
          <td key={d.toISOString()} className="border-b border-border p-1 text-center">
            <button
              type="button"
              disabled={isFuture}
              onClick={() => quickToggle(habit, d)}
              onDoubleClick={(e) => {
                e.preventDefault();
                onOpenEntry(d);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onOpenEntry(d);
              }}
              className="relative mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                borderColor: entry?.completed ? habit.color : "var(--border-strong)",
                backgroundColor: entry?.completed ? habit.color : "transparent",
              }}
              aria-label={`Toggle ${habit.title} on ${d.toDateString()}`}
              title="Click to toggle · right-click / double-click for notes"
            >
              {entry?.completed && showTicks && (
                <Check size={13} strokeWidth={3} className="text-white" />
              )}
              {entry?.note && (
                <StickyNote
                  size={9}
                  className="absolute -top-1 -right-1 rounded-full bg-surface text-accent"
                />
              )}
            </button>
          </td>
        );
      })}
    </tr>
  );
}
