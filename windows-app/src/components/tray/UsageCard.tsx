import { ProgressBar } from "./ProgressBar";
import { formatPercentage } from "@/utils/formatter";
import { statusColor, calculateStatus } from "@/utils/usageCalculator";

interface UsageCardProps {
  title: string;
  percentage: number;
  resetTime?: string;
  elapsedFraction?: number | null;
  showPaceMarker?: boolean;
  subtitle?: string;
}

export function UsageCard({
  title,
  percentage,
  resetTime,
  elapsedFraction,
  showPaceMarker = true,
  subtitle,
}: UsageCardProps) {
  const status = calculateStatus(percentage, false, elapsedFraction ?? undefined);
  const color = statusColor(status);

  const formatResetCountdown = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return "now";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div
      style={{
        padding: "10px 14px",
        background: "var(--bg-card)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
          {title}
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>
          {formatPercentage(percentage)}
        </span>
      </div>

      <ProgressBar
        percentage={percentage}
        elapsedFraction={elapsedFraction}
        showPaceMarker={showPaceMarker}
      />

      {(resetTime || subtitle) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          <span>{subtitle ?? ""}</span>
          {resetTime && <span>resets {formatResetCountdown(resetTime)}</span>}
        </div>
      )}
    </div>
  );
}
