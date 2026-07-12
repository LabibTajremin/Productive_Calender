import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const setting = await prisma.notificationSetting.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and email notification preferences.
        </p>
      </div>

      <SettingsForm
        user={{
          name: session.user.name ?? "",
          username: session.user.username ?? "",
          email: session.user.email ?? "",
        }}
        initialSetting={{
          dailyReminder: setting.dailyReminder,
          reminderHour: setting.reminderHour,
          weeklySummary: setting.weeklySummary,
        }}
      />
    </div>
  );
}
