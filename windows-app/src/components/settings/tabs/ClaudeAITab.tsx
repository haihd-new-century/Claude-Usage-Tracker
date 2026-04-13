import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";
import { fetchOrganizationId } from "@/services/claudeApi";
import { saveCredential, deleteCredential } from "@/services/tauriBridge";
import { Constants } from "@/utils/constants";

export function ClaudeAITab() {
  const { t } = useTranslation();
  const { activeProfile, updateProfile } = useProfileStore();
  const [sessionKey, setSessionKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isConfigured = !!activeProfile?.claudeSessionKey;

  const handleTestConnection = useCallback(async () => {
    if (!sessionKey.trim() || !activeProfile) return;
    setTesting(true);
    setMessage(null);
    try {
      const orgId = await fetchOrganizationId(sessionKey.trim());
      setMessage({ type: "success", text: `${t("personal.success_connected")}: ${orgId.substring(0, 8)}...` });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setTesting(false);
    }
  }, [sessionKey, activeProfile, t]);

  const handleSave = useCallback(async () => {
    if (!sessionKey.trim() || !activeProfile) return;
    setSaving(true);
    setMessage(null);
    try {
      const orgId = await fetchOrganizationId(sessionKey.trim());
      await saveCredential(Constants.credentialKeys.claudeSessionKey + "_" + activeProfile.id, sessionKey.trim());
      updateProfile(activeProfile.id, {
        claudeSessionKey: sessionKey.trim(),
        organizationId: orgId,
      });
      setMessage({ type: "success", text: t("personal.success_key_saved") });
      setSessionKey("");
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }, [sessionKey, activeProfile, updateProfile, t]);

  const handleRemove = useCallback(async () => {
    if (!activeProfile) return;
    await deleteCredential(Constants.credentialKeys.claudeSessionKey + "_" + activeProfile.id);
    updateProfile(activeProfile.id, {
      claudeSessionKey: null,
      organizationId: null,
    });
    setMessage(null);
  }, [activeProfile, updateProfile]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("personal.title")}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("personal.subtitle")}
      </p>

      {/* Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "var(--bg-card)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isConfigured ? "#22c55e" : "#6b7280",
          }}
        />
        <span style={{ fontSize: 13 }}>
          {isConfigured ? t("common.connected") : t("common.not_connected")}
        </span>
        {isConfigured && activeProfile?.organizationId && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
            Org: {activeProfile.organizationId.substring(0, 8)}...
          </span>
        )}
      </div>

      {isConfigured ? (
        <div>
          <p style={{ fontSize: 13, marginBottom: 12, color: "var(--text-secondary)" }}>
            {t("personal.session_key.configured")}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { updateProfile(activeProfile!.id, { claudeSessionKey: null }); }} style={btnStyle}>
              {t("personal.reconfigure")}
            </button>
            <button onClick={handleRemove} style={{ ...btnStyle, background: "#991b1b", borderColor: "#991b1b" }}>
              {t("personal.button_remove_key")}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Instructions */}
          <div
            style={{
              padding: 12,
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius)",
              marginBottom: 16,
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{t("setup.show_instructions")}</div>
            <div>1. {t("setup.instruction.step1")}</div>
            <div>2. {t("setup.instruction.step2")}</div>
            <div>3. {t("setup.instruction.step3")}</div>
            <div>4. {t("setup.instruction.step4")}</div>
          </div>

          {/* Session key input */}
          <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>
            {t("personal.label_session_key")}
          </label>
          <input
            type="password"
            value={sessionKey}
            onChange={(e) => setSessionKey(e.target.value)}
            placeholder={t("personal.placeholder_session_key")}
            style={inputStyle}
          />

          {/* Message */}
          {message && (
            <div
              style={{
                marginTop: 8,
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                background: message.type === "success" ? "#052e16" : "#3b1818",
                color: message.type === "success" ? "#4ade80" : "#f87171",
                border: `1px solid ${message.type === "success" ? "#166534" : "#5c2020"}`,
              }}
            >
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handleTestConnection} disabled={testing || !sessionKey.trim()} style={btnStyle}>
              {testing ? t("wizard.testing") : t("personal.button_test_connection")}
            </button>
            <button onClick={handleSave} disabled={saving || !sessionKey.trim()} style={{ ...btnStyle, background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" }}>
              {saving ? t("personal.button_saving") : t("personal.button_save_and_continue")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 14px",
  fontSize: 12,
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  boxSizing: "border-box",
};
