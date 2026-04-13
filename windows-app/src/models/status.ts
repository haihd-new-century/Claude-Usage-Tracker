// ─── Claude System Status ───────────────────────────────────────────────────

export type StatusIndicator = "none" | "minor" | "major" | "critical" | "unknown";

export interface ClaudeStatus {
  indicator: StatusIndicator;
  description: string;
}

export function statusColor(indicator: StatusIndicator): string {
  switch (indicator) {
    case "none": return "#22c55e";     // green
    case "minor": return "#eab308";    // yellow
    case "major": return "#f97316";    // orange
    case "critical": return "#ef4444"; // red
    case "unknown": return "#9ca3af";  // gray
  }
}

export const unknownStatus: ClaudeStatus = { indicator: "unknown", description: "Status Unknown" };
export const operationalStatus: ClaudeStatus = { indicator: "none", description: "All Systems Operational" };

// ─── Pace Status (6-tier) ───────────────────────────────────────────────────

export enum PaceStatus {
  Comfortable = 0, // projected <50%
  OnTrack = 1,     // projected 50-75%
  Warming = 2,     // projected 75-90%
  Pressing = 3,    // projected 90-100%
  Critical = 4,    // projected 100-120%
  Runaway = 5,     // projected >120%
}

export function calculatePace(usedPercentage: number, elapsedFraction: number): PaceStatus | null {
  if (elapsedFraction < 0.03 || elapsedFraction >= 1.0) return null;
  if (usedPercentage <= 0) return PaceStatus.Comfortable;

  const projected = (usedPercentage / 100.0) / elapsedFraction;
  if (projected < 0.50) return PaceStatus.Comfortable;
  if (projected < 0.75) return PaceStatus.OnTrack;
  if (projected < 0.90) return PaceStatus.Warming;
  if (projected < 1.00) return PaceStatus.Pressing;
  if (projected < 1.20) return PaceStatus.Critical;
  return PaceStatus.Runaway;
}

export function paceColor(pace: PaceStatus): string {
  switch (pace) {
    case PaceStatus.Comfortable: return "#22c55e"; // green
    case PaceStatus.OnTrack:     return "#14b8a6"; // teal
    case PaceStatus.Warming:     return "#eab308"; // yellow
    case PaceStatus.Pressing:    return "#f97316"; // orange
    case PaceStatus.Critical:    return "#ef4444"; // red
    case PaceStatus.Runaway:     return "#a855f7"; // purple
  }
}

export function paceLabel(pace: PaceStatus): string {
  switch (pace) {
    case PaceStatus.Comfortable: return "Comfortable";
    case PaceStatus.OnTrack:     return "On Track";
    case PaceStatus.Warming:     return "Warming";
    case PaceStatus.Pressing:    return "Pressing";
    case PaceStatus.Critical:    return "Critical";
    case PaceStatus.Runaway:     return "Runaway";
  }
}
