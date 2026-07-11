export function getHourInTimezone(date: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    const hourPart = formatter.formatToParts(date).find((p) => p.type === "hour")?.value;
    return hourPart ? Number(hourPart) % 24 : date.getUTCHours();
  } catch {
    return date.getUTCHours();
  }
}
