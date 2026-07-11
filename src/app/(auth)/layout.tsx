import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[var(--brand-start)]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[var(--brand-end)]/20 blur-3xl"
      />
      <div className="relative w-full max-w-sm animate-fade-in-up">
        <div className="mb-8 flex justify-center">
          <Logo markSize={36} wordmarkClassName="text-xl" />
        </div>
        {children}
      </div>
    </div>
  );
}
