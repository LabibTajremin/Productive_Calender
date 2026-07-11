import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { NavSidebar } from "@/components/nav-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { MobileNavClient } from "@/components/mobile-nav-client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <div className="px-2">
          <Logo markSize={28} wordmarkClassName="text-base" />
        </div>
        <div className="mt-8 flex-1">
          <NavSidebar />
        </div>
        <p className="px-2 text-xs text-subtle-foreground">
          Discipline over motivation.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Logo markSize={26} wordmarkClassName="text-sm" />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu name={session.user.name ?? "You"} email={session.user.email ?? ""} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 md:px-8 md:py-8 md:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 flex h-16 shrink-0 items-center justify-around border-t border-border bg-surface md:hidden">
          <MobileNavClient />
        </nav>
      </div>
    </div>
  );
}
