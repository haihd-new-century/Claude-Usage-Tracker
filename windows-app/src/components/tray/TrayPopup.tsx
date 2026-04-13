import { useEffect, useCallback } from "react";
import { useUsageStore } from "@/stores/usageStore";
import { useProfileStore } from "@/stores/profileStore";
import { UsageCard } from "./UsageCard";
import { effectiveSessionPercentage } from "@/models/usage";
import { elapsedFraction } from "@/utils/usageCalculator";
import { statusColor as sysStatusColor } from "@/models/status";
import { Constants } from "@/utils/constants";
import { hideTrayPopup, showSettingsWindow } from "@/services/tauriBridge";

export function TrayPopup() {
  const { usage, status, isRefreshing, lastError, refresh, refreshStatus } = useUsageStore();
  const { activeProfile } = useProfileStore();

  // Initial load + periodic refresh
  useEffect(() => {
    refresh();
    refreshStatus();
    const interval = setInterval(
      () => {
        refresh();
      },
      (activeProfile?.refreshInterval ?? Constants.refreshIntervals.menuBar) * 1000,
    );
    return () => clearInterval(interval);
  }, [activeProfile?.id, activeProfile?.refreshInterval, refresh, refreshStatus]);

  const sessionPct = effectiveSessionPercentage(usage);
  const sessionElapsed = elapsedFraction(usage.sessionResetTime, Constants.sessionWindow, false);
  const weeklyElapsed = elapsedFraction(usage.weeklyResetTime, Constants.weeklyWindow, false);

  const handleRefresh = useCallback(() => {
    refresh();
    refreshStatus();
  }, [refresh, refreshStatus]);

  const handleSettings = useCallback(async () => {
    await showSettingsWindow();
    await hideTrayPopup();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: 12,
        gap: 8,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 8,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Claude Usage</span>
          {activeProfile && (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                background: "var(--bg-secondary)",
                padding: "2px 6px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {activeProfile.name}
            </span>
          )}
        </div>

        {/* Status dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: sysStatusColor(status.indicator),
            }}
            title={status.description}
          />
        </div>
      </div>

      {/* Error banner */}
      {lastError && (
        <div
          style={{
            padding: "6px 10px",
            background: "#3b1818",
            border: "1px solid #5c2020",
            borderRadius: "var(--radius-sm)",
            fontSize: 11,
            color: "#f87171",
          }}
        >
          {lastError}
        </div>
      )}

      {/* Usage cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "auto" }}>
        <UsageCard
          title="Session (5h)"
          percentage={sessionPct}
          resetTime={usage.sessionResetTime}
          elapsedFraction={sessionElapsed}
        />

        <UsageCard
          title="Weekly (All Models)"
          percentage={usage.weeklyPercentage}
          resetTime={usage.weeklyResetTime}
          elapsedFraction={weeklyElapsed}
        />

        {usage.opusWeeklyPercentage > 0 && (
          <UsageCard
            title="Weekly (Opus)"
            percentage={usage.opusWeeklyPercentage}
            resetTime={usage.weeklyResetTime}
            elapsedFraction={weeklyElapsed}
          />
        )}

        {usage.costUsed != null && usage.costLimit != null && (
          <UsageCard
            title="Extra Usage"
            percentage={
              usage.costLimit > 0 ? (usage.costUsed / usage.costLimit) * 100 : 0
            }
            subtitle={`$${usage.costUsed.toFixed(2)} / $${usage.costLimit.toFixed(2)}`}
            showPaceMarker={false}
          />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          borderTop: "1px solid var(--border)",
        }}
      >
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 12px",
            color: "var(--text-primary)",
            cursor: isRefreshing ? "not-allowed" : "pointer",
            fontSize: 12,
            opacity: isRefreshing ? 0.6 : 1,
          }}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>

        <button
          onClick={handleSettings}
          style={{
            background: "var(--accent)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "4px 12px",
            color: "#fff",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
