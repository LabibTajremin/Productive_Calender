"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Task } from "@/generated/prisma/client";

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const;

export function TaskModal({
  open,
  onClose,
  task,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onSaved: (task: Task) => void;
  onDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [note, setNote] = useState(task?.note ?? "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
  );
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]["value"]>(
    (task?.priority as (typeof PRIORITIES)[number]["value"]) ?? "MEDIUM",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Give the task a title");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      title,
      note: note || null,
      dueDate: dueDate ? new Date(`${dueDate}T09:00:00.000Z`).toISOString() : null,
      priority,
    };

    const res = task
      ? await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save task");
      return;
    }

    const body = await res.json();
    onSaved(body.task);
    onClose();
  }

  async function handleDelete() {
    if (!task) return;
    setLoading(true);
    const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      onDeleted(task.id);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit task" : "New task"}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finish quarterly report"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="task-priority">Priority</Label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="task-note">Note</Label>
          <Textarea
            id="task-note"
            rows={5}
            value={note ?? ""}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add extra context, links, or details…"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          {task ? (
            <Button variant="ghost" type="button" onClick={handleDelete} disabled={loading} className="text-danger hover:bg-danger/10">
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
