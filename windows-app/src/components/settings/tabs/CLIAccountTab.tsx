import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";
import { syncCLICredentials, isClaudeCodeInstalled, extractAccessToken } from "@/services/cliSyncService";

export function CLIAccountTab() {
  const { t } = useTranslation();
  const { activeProfile, updateProfile } = useProfileStore();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isSynced = activeProfile?.hasCliAccount ?? false;
  const accessToken = extractAccessToken(activeProfile?.cliCredentialsJSON ?? null);

  const handleSync = useCallback(async () => {
    if (!activeProfile) return;
    setSyncing(true);
    setMessage(null);
    try {
      const installed = await isClaudeCodeInstalled();
      if (!installed) {
        setMessage({ type: "error", text: "Claude Code not found. Install it first." });
        return;
      }
      const result = await syncCLICredentials();
      if (!result) {
        setMessage({ type: "error", text: "No CLI credentials found." });
        return;
      }
      updateProfile(activeProfile.id, {
        cliCredentialsJSON: result.json,
        hasCliAccount: result.hasAccount,
        cliAccountSyncedAt: new Date().toISOString(),
      });
      setMessage({ type: "success", text: "CLI credentials synced successfully!" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setSyncing(false);
    }
  }, [activeProfile, updateProfile]);

  const handleRemove = useCallback(() => {
    if (!activeProfile) return;
    updateProfile(activeProfile.id, {
      cliCredentialsJSON: null,
      hasCliAccount: false,
      cliAccountSyncedAt: null,
    });
    setMessage(null);
  }, [activeProfile, updateProfile]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("cli.title")}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("cli.subtitle")}
      </p>

      {/* Status */}
      <div style={statusCard}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: isSynced ? "#22c55e" : "#6b7280" }} />
        <span style={{ fontSize: 13 }}>{isSynced ? t("cli.synced") : t("cli.not_synced")}</span>
        {activeProfile?.cliAccountSyncedAt && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
            {new Date(activeProfile.cliAccountSyncedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {isSynced && accessToken && (
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{t("cli.account_details")}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            <div style={{ marginBottom: 4 }}>
              {t("cli.access_token")}: {accessToken.substring(0, 12)}...
            </div>
          </div>
        </div>
      )}

      {/* About section */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{t("cli.about_title")}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <div>{t("cli.benefits")}</div>
          <div>• {t("cli.benefit_1")}</div>
          <div>• {t("cli.benefit_2")}</div>
          <div>• {t("cli.benefit_3")}</div>
        </div>
      </div>

      {message && (
        <div style={msgStyle(message.type)}>
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={handleSync} disabled={syncing} style={btnStyle}>
          {syncing ? "Syncing..." : isSynced ? t("cli.resync") : t("cli.sync_from_code")}
        </button>
        {isSynced && (
          <button onClick={handleRemove} style={{ ...btnStyle, background: "#991b1b" }}>
            {t("common.remove")}
          </button>
        )}
      </div>
    </div>
  );
}

const statusCard: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
  background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 16,
};

const cardStyle: React.CSSProperties = {
  padding: 12, background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)",
};

const btnStyle: React.CSSProperties = {
  padding: "6px 14px", fontSize: 12, background: "var(--bg-secondary)",
  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", cursor: "pointer",
};

function msgStyle(type: "success" | "error"): React.CSSProperties {
  return {
    padding: "6px 10px", borderRadius: "var(--radius-sm)", fontSize: 12,
    background: type === "success" ? "#052e16" : "#3b1818",
    color: type === "success" ? "#4ade80" : "#f87171",
    border: `1px solid ${type === "success" ? "#166534" : "#5c2020"}`,
  };
}
