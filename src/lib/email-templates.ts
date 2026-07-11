const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function emailShell(bodyHtml: string): string {
  return `
  <div style="background:#f4f4f7;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececf1;">
      <tr>
        <td style="padding:28px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6 55%,#d946ef);">
          <table role="presentation"><tr>
            <td style="vertical-align:middle;padding-right:10px;">
              <div style="width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;line-height:32px;text-align:center;">M</div>
            </td>
            <td style="vertical-align:middle;">
              <span style="color:#ffffff;font-size:17px;font-weight:600;letter-spacing:-0.01em;">Momentum</span>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #ececf1;">
          <p style="margin:0;font-size:12px;color:#9c9ca6;">
            You're receiving this because you enabled email notifications on Momentum.
            <a href="${APP_URL}/settings" style="color:#6366f1;text-decoration:none;">Manage preferences</a>
          </p>
        </td>
      </tr>
    </table>
  </div>`;
}

export function dailyReminderEmail({
  name,
  pendingHabits,
}: {
  name: string;
  pendingHabits: string[];
}) {
  const list = pendingHabits
    .map(
      (h) =>
        `<li style="margin-bottom:8px;font-size:14px;color:#1a1a22;">${escapeHtml(h)}</li>`,
    )
    .join("");

  const body = `
    <h1 style="margin:0 0 8px;font-size:19px;color:#0b0b10;">Hey ${escapeHtml(name)}, keep the streak alive 🔥</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#5c5c66;">
      Here's what's still open for today:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;">${list}</ul>
    <a href="${APP_URL}/calendar" style="display:inline-block;padding:11px 20px;border-radius:9px;background:#6366f1;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
      Check off today
    </a>
  `;
  return {
    subject: `${pendingHabits.length} habit${pendingHabits.length === 1 ? "" : "s"} left today`,
    html: emailShell(body),
  };
}

export function weeklySummaryEmail({
  name,
  percent,
  completed,
  total,
  topHabit,
}: {
  name: string;
  percent: number;
  completed: number;
  total: number;
  topHabit: string | null;
}) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:19px;color:#0b0b10;">Your week in review, ${escapeHtml(name)}</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#5c5c66;">
      Over the last 5 weeks you completed <strong style="color:#0b0b10;">${completed}</strong> of
      <strong style="color:#0b0b10;">${total}</strong> check-ins — that's
      <strong style="color:#0b0b10;">${percent}%</strong>.
    </p>
    ${
      topHabit
        ? `<p style="margin:0 0 20px;font-size:14px;color:#5c5c66;">Your strongest habit: <strong style="color:#0b0b10;">${escapeHtml(topHabit)}</strong></p>`
        : ""
    }
    <a href="${APP_URL}/dashboard" style="display:inline-block;padding:11px 20px;border-radius:9px;background:#6366f1;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
      View full dashboard
    </a>
  `;
  return {
    subject: `Your weekly recap: ${percent}% complete`,
    html: emailShell(body),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
