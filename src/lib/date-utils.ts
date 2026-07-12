export function getMonthMatrix(year: number, month: number): Date[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function weekdayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "narrow" });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Index matches JS Date#getDay(): 0 = Sunday … 6 = Saturday.
export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const WEEKDAY_SHORT_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
