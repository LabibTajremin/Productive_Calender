export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <h1 className="text-lg font-semibold">You&apos;re offline</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Momentum needs a connection to load this page. Reconnect and try again.
      </p>
    </div>
  );
}
