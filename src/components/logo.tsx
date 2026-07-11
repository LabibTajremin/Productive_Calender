import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Momentum logo"
    >
      <defs>
        <linearGradient id="momentum-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#momentum-grad)" />
      <path
        d="M11 21.5L16.2 26.7L29 13"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.97"
      />
      <path
        d="M11 13.5H23"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

export function Logo({
  className,
  markSize = 32,
  wordmarkClassName,
}: {
  className?: string;
  markSize?: number;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <span
        className={cn(
          "text-lg font-semibold tracking-tight text-foreground",
          wordmarkClassName,
        )}
      >
        Momentum
      </span>
    </span>
  );
}
