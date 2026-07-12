"use client";

import { useState } from "react";
import {
  Plus,
  StickyNote,
  Calendar as CalendarIcon,
  Check,
  GripVertical,
  Pencil,
  AlertCircle,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskModal } from "@/components/task-modal";
import { TaskStatsCard } from "@/components/task-stats-card";
import { computeTaskStats } from "@/lib/task-stats";
import { cn } from "@/lib/utils";
import type { Task } from "@prisma/client";

const PRIORITY_ACCENT: Record<string, string> = {
  LOW: "var(--success)",
  MEDIUM: "var(--warning)",
  HIGH: "var(--danger)",
};

const PRIORITY_TEXT: Record<string, string> = {
  LOW: "text-success",
  MEDIUM: "text-warning",
  HIGH: "text-danger",
};

const NOTE_PREVIEW_LENGTH = 90;

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [modalKey, setModalKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function openNew() {
    setEditing(null);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  function upsert(task: Task) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      return exists ? prev.map((t) => (t.id === task.id ? task : t)) : [task, ...prev];
    });
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function toggleComplete(task: Task) {
    const nextCompleted = !task.completed;
    const next: Task = {
      ...task,
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date() : null,
    };
    upsert(next);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: nextCompleted }),
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);
    if (!activeTask || !overTask || activeTask.completed !== overTask.completed) return;

    const subset = tasks.filter((t) => t.completed === activeTask.completed);
    const oldIndex = subset.findIndex((t) => t.id === active.id);
    const newIndex = subset.findIndex((t) => t.id === over.id);
    const reorderedSubset = arrayMove(subset, oldIndex, newIndex);
    const subsetIds = new Set(reorderedSubset.map((t) => t.id));

    setTasks((prev) => {
      const others = prev.filter((t) => !subsetIds.has(t.id));
      return [...others, ...reorderedSubset];
    });

    await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reorderedSubset.map((t) => t.id) }),
    });
  }

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const stats = computeTaskStats(tasks, new Date());

  return (
    <div className="space-y-6">
      <TaskStatsCard stats={stats} />

      <div className="flex justify-end">
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          New task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No tasks yet. Add one to plan your day.
          </p>
        </div>
      ) : (
        <DndContext
          id="task-list-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            <TaskGroup title="To do" tasks={pending} onToggle={toggleComplete} onEdit={openEdit} />
            {done.length > 0 && (
              <TaskGroup
                title="Completed"
                tasks={done}
                onToggle={toggleComplete}
                onEdit={openEdit}
              />
            )}
          </div>
        </DndContext>
      )}

      <TaskModal
        key={modalKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editing}
        onSaved={upsert}
        onDeleted={remove}
      />
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  onToggle,
  onEdit,
}: {
  title: string;
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle-foreground">
        {title} · {tasks.length}
      </h3>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function dueDateBadge(
  dueDate: Date | null,
  completed: boolean,
): { label: string; tone: "danger" | "warning" | "muted" } | null {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  const diffDays = Math.ceil((due.getTime() - Date.now()) / 86_400_000);

  const dateLabel = new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (completed) return { label: dateLabel, tone: "muted" };
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, tone: "danger" };
  if (diffDays === 0) return { label: "Due today", tone: "warning" };
  if (diffDays === 1) return { label: "Due tomorrow", tone: "warning" };
  if (diffDays <= 3) return { label: `${dateLabel} · in ${diffDays}d`, tone: "warning" };
  return { label: dateLabel, tone: "muted" };
}

function SortableTaskCard({
  task,
  onToggle,
  onEdit,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const [noteExpanded, setNoteExpanded] = useState(false);

  const note = task.note ?? "";
  const noteIsLong = note.length > NOTE_PREVIEW_LENGTH;
  const notePreview = noteIsLong ? `${note.slice(0, NOTE_PREVIEW_LENGTH).trimEnd()}…` : note;
  const due = dueDateBadge(task.dueDate, task.completed);

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderLeftColor: PRIORITY_ACCENT[task.priority],
        borderLeftWidth: 6,
      }}
      className={cn(
        "group relative flex items-stretch gap-2 py-3 pr-3.5 pl-3 transition-shadow hover:shadow-md",
        isDragging && "relative z-20 shadow-lg",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-0.5 flex h-5 w-4 shrink-0 cursor-grab items-center justify-center self-start text-subtle-foreground opacity-0 group-hover:opacity-100 active:cursor-grabbing"
        aria-label={`Drag to reorder ${task.title}`}
      >
        <GripVertical size={14} />
      </button>

      <button
        type="button"
        onClick={() => onToggle(task)}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center self-start rounded-md border-2 transition-colors",
          task.completed
            ? "border-success bg-success text-white"
            : "border-border-strong hover:border-accent",
        )}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && <Check size={12} strokeWidth={3} />}
      </button>

      <button
        type="button"
        onClick={() => onEdit(task)}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={cn(
            "truncate text-sm font-medium text-foreground",
            task.completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("inline-flex items-center gap-1 font-medium", PRIORITY_TEXT[task.priority])}>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: PRIORITY_ACCENT[task.priority] }}
            />
            {task.priority}
          </span>
        </div>

        {note ? (
          <div className="mt-1.5 flex items-start gap-1 text-xs text-muted-foreground">
            <StickyNote size={11} className="mt-0.5 shrink-0" />
            <p className="min-w-0">
              {noteExpanded ? note : notePreview}
              {noteIsLong && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteExpanded((v) => !v);
                  }}
                  className="ml-1.5 font-medium text-accent hover:underline"
                >
                  {noteExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </p>
          </div>
        ) : (
          <p className="mt-1.5 text-xs italic text-subtle-foreground">No note added</p>
        )}
      </button>

      <div className="flex w-32 shrink-0 flex-col items-end justify-between border-l border-border pl-3">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-subtle-foreground opacity-0 transition-opacity hover:bg-surface-raised hover:text-foreground group-hover:opacity-100"
          aria-label={`Edit ${task.title}`}
          title="Edit task"
        >
          <Pencil size={13} />
        </button>

        {due ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-right text-[11px] font-medium",
              due.tone === "danger" && "bg-danger/10 text-danger",
              due.tone === "warning" && "bg-warning/10 text-warning",
              due.tone === "muted" && "text-muted-foreground",
            )}
          >
            {due.tone === "danger" ? (
              <AlertCircle size={11} />
            ) : (
              <CalendarIcon size={11} />
            )}
            {due.label}
          </span>
        ) : (
          <span className="text-[11px] text-subtle-foreground">No due date</span>
        )}
      </div>
    </Card>
  );
}
