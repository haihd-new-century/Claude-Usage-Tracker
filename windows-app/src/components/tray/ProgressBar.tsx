import { usageBarColor } from "@/utils/usageCalculator";
import { paceColor, calculatePace, type PaceStatus } from "@/models/status";

interface ProgressBarProps {
  percentage: number;
  elapsedFraction?: number | null;
  showPaceMarker?: boolean;
  height?: number;
}

export function ProgressBar({
  percentage,
  elapsedFraction,
  showPaceMarker = true,
  height = 8,
}: ProgressBarProps) {
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const barColor = usageBarColor(clampedPct);

  let pace: PaceStatus | null = null;
  if (showPaceMarker && elapsedFraction != null) {
    pace = calculatePace(clampedPct, elapsedFraction);
  }

  return (
    <div
      style={{
        width: "100%",
        height,
        background: "var(--bg-secondary)",
        borderRadius: height / 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fill */}
      <div
        style={{
          width: `${clampedPct}%`,
          height: "100%",
          background: barColor,
          borderRadius: height / 2,
          transition: "width 0.3s ease",
        }}
      />

      {/* Pace marker */}
      {pace != null && elapsedFraction != null && elapsedFraction > 0 && (
        <div
          style={{
            position: "absolute",
            left: `${Math.min(elapsedFraction * 100, 100)}%`,
            top: 0,
            width: 2,
            height: "100%",
            background: paceColor(pace),
            transform: "translateX(-1px)",
          }}
        />
      )}
    </div>
  );
}
