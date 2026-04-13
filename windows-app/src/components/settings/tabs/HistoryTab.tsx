import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";
import type { UsageHistoryData, UsageSnapshot, ResetType } from "@/models/usageHistory";
import { sessionSnapshots, weeklySnapshots, billingSnapshots, exportToJSON, exportToCSV } from "@/models/usageHistory";
import { loadHistory, clearHistory } from "@/services/usageHistoryService";

type HistoryTabType = "session" | "weekly" | "billing";

export function HistoryTab() {
  const { t } = useTranslation();
  const { activeProfile } = useProfileStore();
  const [tab, setTab] = useState<HistoryTabType>("session");
  const [history, setHistory] = useState<UsageHistoryData | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    loadHistory(activeProfile.id).then(setHistory);
  }, [activeProfile?.id]);

  if (!activeProfile || !history) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "var(--text-muted)" }}>{t("history.no_profile")}</p>
      </div>
    );
  }

  const snapshotsByTab: Record<HistoryTabType, UsageSnapshot[]> = {
    session: sessionSnapshots(history),
    weekly: weeklySnapshots(history),
    billing: billingSnapshots(history),
  };

  const resetTypeMap: Record<HistoryTabType, ResetType> = {
    session: "sessionReset",
    weekly: "weeklyReset",
    billing: "billingCycle",
  };

  const current = snapshotsByTab[tab];

  const handleExport = (format: "json" | "csv") => {
    const content = format === "json"
      ? exportToJSON(history, resetTypeMap[tab])
      : exportToCSV(history, resetTypeMap[tab]);

    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claude-usage-${tab}-${new Date().toISOString().substring(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    await clearHistory(activeProfile.id, resetTypeMap[tab]);
    setHistory(await loadHistory(activeProfile.id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("history.title")}</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("history.subtitle")}
      </p>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {(["session", "weekly", "billing"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              background: tab === key ? "var(--accent)" : "var(--bg-secondary)",
              color: tab === key ? "#fff" : "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
            }}
          >
            {t(`history.tab.${key}`)}
          </button>
        ))}
      </div>

      {/* Count + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {t("history.list.count", { count: current.length })}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => handleExport("json")} style={smallBtnStyle}>{t("history.export.json")}</button>
          <button onClick={() => handleExport("csv")} style={smallBtnStyle}>{t("history.export.csv")}</button>
          <button onClick={handleClear} style={{ ...smallBtnStyle, color: "#f87171" }}>{t("history.clear_button")}</button>
        </div>
      </div>

      {/* Snapshot list */}
      {current.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 13 }}>
          {t(`history.empty.${tab}_title`)}
          <div style={{ marginTop: 4, fontSize: 11 }}>{t(`history.empty.${tab}_description`)}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 400, overflowY: "auto" }}>
          {current.slice(0, 50).map((snap) => (
            <SnapshotRow key={snap.id} snapshot={snap} tab={tab} />
          ))}
          {current.length > 50 && (
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", padding: 8 }}>
              {t("history.list.more", { count: current.length - 50 })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SnapshotRow({ snapshot, tab }: { snapshot: UsageSnapshot; tab: HistoryTabType }) {
  const date = new Date(snapshot.timestamp).toLocaleString();
  let detail = "";

  if (tab === "session") {
    detail = snapshot.sessionPercentage != null ? `${snapshot.sessionPercentage.toFixed(1)}%` : "-";
  } else if (tab === "weekly") {
    detail = snapshot.weeklyPercentage != null ? `${snapshot.weeklyPercentage.toFixed(1)}%` : "-";
  } else {
    detail = snapshot.apiSpendCents != null
      ? `$${(snapshot.apiSpendCents / 100).toFixed(2)}`
      : "-";
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 10px",
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-sm)",
        fontSize: 12,
        border: "1px solid var(--border)",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{date}</span>
      <span style={{ fontWeight: 600 }}>{detail}</span>
    </div>
  );
}

const smallBtnStyle: React.CSSProperties = {
  padding: "4px 8px",
  fontSize: 11,
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  cursor: "pointer",
};
