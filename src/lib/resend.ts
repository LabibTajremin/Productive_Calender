import { Resend } from "resend";

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Momentum <onboarding@resend.dev>";
