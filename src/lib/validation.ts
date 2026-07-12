import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-z0-9_.-]+$/,
      "Username can only contain lowercase letters, numbers, underscores, dots, and hyphens",
    ),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const habitSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  icon: z.string().trim().min(1).max(8).default("✨"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value")
    .default("#6366f1"),
  weeklyGoal: z.number().int().min(1).max(7).default(7),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  note: z.string().trim().max(4000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

export const habitEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  completed: z.boolean(),
  note: z.string().trim().max(2000).optional().nullable(),
});

export const notificationSettingSchema = z.object({
  dailyReminder: z.boolean(),
  reminderHour: z.number().int().min(0).max(23),
  weeklySummary: z.boolean(),
});
