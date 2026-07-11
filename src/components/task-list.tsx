"use client";

import { useState } from "react";
import { Plus, StickyNote, Calendar as CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskModal } from "@/components/task-modal";
import { cn } from "@/lib/utils";
import type { Task } from "@/generated/prisma/client";

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-success/10 text-success",
  MEDIUM: "bg-warning/10 text-warning",
  HIGH: "bg-danger/10 text-danger",
};

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
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
    const next = { ...task, completed: !task.completed };
    upsert(next);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: next.completed }),
    });
  }

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
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
        <div className="space-y-6">
          <TaskGroup title="To do" tasks={pending} onToggle={toggleComplete} onEdit={openEdit} />
          {done.length > 0 && (
            <TaskGroup title="Completed" tasks={done} onToggle={toggleComplete} onEdit={openEdit} />
          )}
        </div>
      )}

      <TaskModal
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
      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-start gap-3 p-3.5">
            <button
              type="button"
              onClick={() => onToggle(task)}
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
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
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-medium",
                    PRIORITY_STYLES[task.priority],
                  )}
                >
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon size={11} />
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                {task.note && (
                  <span className="inline-flex items-center gap-1">
                    <StickyNote size={11} />
                    Note
                  </span>
                )}
              </div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
