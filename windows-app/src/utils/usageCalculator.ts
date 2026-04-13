import { UsageStatusLevel } from "@/models/usage";

/** Calculate status level based on percentage, display mode, and optional pacing */
export function calculateStatus(
  usedPercentage: number,
  showRemaining: boolean,
  elapsedFraction?: number,
): UsageStatusLevel {
  const u = usedPercentage / 100.0;

  // Pace-aware logic
  if (elapsedFraction != null && elapsedFraction >= 0.15 && elapsedFraction < 1.0 && u > 0) {
    const projected = u / elapsedFraction;
    if (projected < 0.75) return UsageStatusLevel.Safe;
    if (projected < 0.95) return UsageStatusLevel.Moderate;
    return UsageStatusLevel.Critical;
  }

  if (showRemaining) {
    const remaining = Math.max(0, 100 - usedPercentage);
    if (remaining >= 20) return UsageStatusLevel.Safe;
    if (remaining >= 10) return UsageStatusLevel.Moderate;
    return UsageStatusLevel.Critical;
  } else {
    if (usedPercentage < 50) return UsageStatusLevel.Safe;
    if (usedPercentage < 80) return UsageStatusLevel.Moderate;
    return UsageStatusLevel.Critical;
  }
}

/** Fraction (0...1) of elapsed time within a period */
export function elapsedFraction(
  resetTime: string | null,
  durationSeconds: number,
  showRemaining: boolean,
): number | null {
  if (!resetTime || durationSeconds <= 0) return null;
  const reset = new Date(resetTime);
  const now = new Date();
  if (reset <= now) return showRemaining ? 0.0 : 1.0;
  const remainingMs = reset.getTime() - now.getTime();
  const durationMs = durationSeconds * 1000;
  const elapsed = durationMs - remainingMs;
  const fraction = Math.min(Math.max(elapsed / durationMs, 0), 1);
  return showRemaining ? 1.0 - fraction : fraction;
}

/** Get the display percentage based on mode */
export function getDisplayPercentage(usedPercentage: number, showRemaining: boolean): number {
  return showRemaining ? Math.max(0, 100 - usedPercentage) : usedPercentage;
}

/** 10-level color gradient for usage bar */
export function usageBarColor(usedPercentage: number): string {
  if (usedPercentage <= 10) return "#166534";   // dark green
  if (usedPercentage <= 20) return "#15803d";   // green
  if (usedPercentage <= 30) return "#22c55e";   // green
  if (usedPercentage <= 40) return "#86efac";   // light green
  if (usedPercentage <= 50) return "#bef264";   // yellow-green
  if (usedPercentage <= 60) return "#eab308";   // yellow
  if (usedPercentage <= 70) return "#f97316";   // orange
  if (usedPercentage <= 80) return "#ea580c";   // dark orange
  if (usedPercentage <= 90) return "#dc2626";   // red
  return "#991b1b";                              // deep red
}

/** Status level to CSS color */
export function statusColor(level: UsageStatusLevel): string {
  switch (level) {
    case UsageStatusLevel.Safe: return "#22c55e";
    case UsageStatusLevel.Moderate: return "#f97316";
    case UsageStatusLevel.Critical: return "#ef4444";
  }
}
