import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";
import { fetchConsoleOrganizations } from "@/services/claudeApi";
import { saveCredential, deleteCredential } from "@/services/tauriBridge";
import { Constants } from "@/utils/constants";
import type { APIOrganization } from "@/models/usage";

export function APIConsoleTab() {
  const { t } = useTranslation();
  const { activeProfile, updateProfile } = useProfileStore();
  const [apiKey, setApiKey] = useState("");
  const [fetching, setFetching] = useState(false);
  const [orgs, setOrgs] = useState<APIOrganization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isConfigured = !!activeProfile?.apiSessionKey;

  const handleFetchOrgs = useCallback(async () => {
    if (!apiKey.trim()) return;
    setFetching(true);
    setMessage(null);
    try {
      const result = await fetchConsoleOrganizations(apiKey.trim());
      setOrgs(result);
      if (result.length === 1) {
        setSelectedOrg(result[0]!.id);
        setMessage({ type: "success", text: t("api.single_organization") });
      } else if (result.length > 1) {
        setMessage({ type: "success", text: t("api.success_organizations_found", { count: result.length }) });
      }
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setFetching(false);
    }
  }, [apiKey, t]);

  const handleSave = useCallback(async () => {
    if (!apiKey.trim() || !selectedOrg || !activeProfile) return;
    await saveCredential(Constants.credentialKeys.apiSessionKey + "_" + activeProfile.id, apiKey.trim());
    updateProfile(activeProfile.id, {
      apiSessionKey: apiKey.trim(),
      apiOrganizationId: selectedOrg,
    });
    setMessage({ type: "success", text: t("api.success_configuration_saved") });
    setApiKey("");
    setOrgs([]);
  }, [apiKey, selectedOrg, activeProfile, updateProfile, t]);

  const handleRemove = useCallback(async () => {
    if (!activeProfile) return;
    await deleteCredential(Constants.credentialKeys.apiSessionKey + "_" + activeProfile.id);
    updateProfile(activeProfile.id, {
      apiSessionKey: null,
      apiOrganizationId: null,
    });
    setMessage(null);
  }, [activeProfile, updateProfile]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("api.title")}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("api.subtitle")}
      </p>

      {/* Status */}
      <div style={{ ...statusCard }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: isConfigured ? "#22c55e" : "#6b7280" }} />
        <span style={{ fontSize: 13 }}>{isConfigured ? t("common.connected") : t("common.not_connected")}</span>
      </div>

      {isConfigured ? (
        <div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
            Org: {activeProfile?.apiOrganizationId?.substring(0, 12)}...
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleRemove} style={{ ...btnStyle, background: "#991b1b" }}>
              {t("common.remove")}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Instructions */}
          <div style={{ ...instructionBox }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{t("api.instructions")}</div>
            <div>1. {t("api.instruction_step1")}</div>
            <div>2. {t("api.instruction_step2")}</div>
            <div>3. {t("api.instruction_step3")}</div>
            <div>4. {t("api.instruction_step4")}</div>
          </div>

          <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>
            {t("api.label_api_session_key")}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t("api.placeholder_api_session_key")}
            style={inputStyle}
          />

          <button onClick={handleFetchOrgs} disabled={fetching || !apiKey.trim()} style={{ ...btnStyle, marginTop: 10 }}>
            {fetching ? t("api.button_fetching") : t("api.button_fetch_organizations")}
          </button>

          {orgs.length > 1 && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>
                {t("wizard.select_organization")}
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                style={inputStyle}
              >
                <option value="">{t("wizard.choose_organization")}</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.name || o.id}</option>
                ))}
              </select>
            </div>
          )}

          {message && (
            <div style={{ ...messageStyle(message.type), marginTop: 8 }}>
              {message.text}
            </div>
          )}

          {selectedOrg && (
            <button onClick={handleSave} style={{ ...btnStyle, marginTop: 10, background: "var(--accent)", color: "#fff" }}>
              {t("api.button_save_configuration")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const statusCard: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
  background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 16,
};

const instructionBox: React.CSSProperties = {
  padding: 12, background: "var(--bg-secondary)", borderRadius: "var(--radius)",
  marginBottom: 16, fontSize: 12, lineHeight: 1.6, color: "var(--text-secondary)",
};

const btnStyle: React.CSSProperties = {
  padding: "6px 14px", fontSize: 12, background: "var(--bg-secondary)",
  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 13, background: "var(--bg-secondary)",
  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", boxSizing: "border-box",
};

function messageStyle(type: "success" | "error"): React.CSSProperties {
  return {
    padding: "6px 10px", borderRadius: "var(--radius-sm)", fontSize: 12,
    background: type === "success" ? "#052e16" : "#3b1818",
    color: type === "success" ? "#4ade80" : "#f87171",
    border: `1px solid ${type === "success" ? "#166534" : "#5c2020"}`,
  };
}
