"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function EntryModal({
  open,
  onClose,
  habitId,
  habitTitle,
  dateKey,
  dateLabel,
  initialCompleted,
  initialNote,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  habitId: string;
  habitTitle: string;
  dateKey: string;
  dateLabel: string;
  initialCompleted: boolean;
  initialNote: string;
  onSaved: (completed: boolean, note: string) => void;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCompleted(initialCompleted);
    setNote(initialNote);
  }, [initialCompleted, initialNote, dateKey, habitId]);

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/habits/${habitId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateKey, completed, note: note || null }),
    });
    setLoading(false);

    if (res.ok) {
      onSaved(completed, note);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={habitTitle}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{dateLabel}</p>

        <button
          type="button"
          onClick={() => setCompleted((v) => !v)}
          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
            completed
              ? "border-success/40 bg-success/10"
              : "border-border-strong hover:bg-surface-raised"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
              completed ? "border-success bg-success text-white" : "border-border-strong"
            }`}
          >
            {completed && <Check size={14} strokeWidth={3} />}
          </span>
          <span className="text-sm font-medium text-foreground">
            {completed ? "Marked done" : "Mark as done"}
          </span>
        </button>

        <div>
          <Label htmlFor="entry-note">Note (optional)</Label>
          <Textarea
            id="entry-note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add details, context, or a reflection for this day…"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
