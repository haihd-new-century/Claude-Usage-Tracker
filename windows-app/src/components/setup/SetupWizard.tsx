import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";
import { fetchOrganizationId } from "@/services/claudeApi";
import { saveCredential } from "@/services/tauriBridge";
import { syncCLICredentials } from "@/services/cliSyncService";
import { Constants } from "@/utils/constants";

type Step = "enter-key" | "select-org" | "confirm";

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const { t } = useTranslation();
  const { activeProfile, updateProfile } = useProfileStore();
  const [step, setStep] = useState<Step>("enter-key");
  const [sessionKey, setSessionKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Step 1: Test connection
  const handleTest = useCallback(async () => {
    if (!sessionKey.trim()) return;
    setTesting(true);
    setError(null);
    try {
      const id = await fetchOrganizationId(sessionKey.trim());
      setOrgId(id);
      setStep("select-org");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTesting(false);
    }
  }, [sessionKey]);

  // Step 3: Save
  const handleSave = useCallback(async () => {
    if (!activeProfile || !orgId) return;
    setSaving(true);
    try {
      await saveCredential(
        Constants.credentialKeys.claudeSessionKey + "_" + activeProfile.id,
        sessionKey.trim(),
      );
      updateProfile(activeProfile.id, {
        claudeSessionKey: sessionKey.trim(),
        organizationId: orgId,
      });

      // Also try to sync CLI credentials
      const cliResult = await syncCLICredentials();
      if (cliResult) {
        updateProfile(activeProfile.id, {
          cliCredentialsJSON: cliResult.json,
          hasCliAccount: cliResult.hasAccount,
          cliAccountSyncedAt: new Date().toISOString(),
        });
      }

      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [activeProfile, orgId, sessionKey, updateProfile, onComplete]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        padding: 32,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 24,
        }}
      >
        {/* Header */}
        <h1 style={{ margin: "0 0 4px", fontSize: 20, textAlign: "center" }}>
          {t("setup.welcome.title")}
        </h1>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)", textAlign: "center" }}>
          {t("setup.welcome.subtitle")}
        </p>

        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {(["enter-key", "select-org", "confirm"] as const).map((s, i) => (
            <div
              key={s}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                background: step === s ? "var(--accent)" : "var(--bg-secondary)",
                color: step === s ? "#fff" : "var(--text-muted)",
                border: `1px solid ${step === s ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Step 1: Enter Key */}
        {step === "enter-key" && (
          <div>
            <div style={instructionBox}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{t("setup.step.get_session_key")}</div>
              <div>1. {t("setup.instruction.step1")}</div>
              <div>2. {t("setup.instruction.step2")}</div>
              <div>3. {t("setup.instruction.step3")}</div>
              <div>4. {t("setup.instruction.step4")}</div>
            </div>

            <input
              type="password"
              value={sessionKey}
              onChange={(e) => setSessionKey(e.target.value)}
              placeholder={t("personal.placeholder_session_key")}
              style={inputStyle}
            />

            {error && <div style={errorStyle}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={onComplete} style={btnSecondary}>
                {t("wizard.claude_code_skip_setup")}
              </button>
              <button
                onClick={handleTest}
                disabled={testing || !sessionKey.trim()}
                style={btnPrimary}
              >
                {testing ? t("wizard.testing") : t("wizard.test_connection")}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Org (auto-selected since we get org from fetchOrganizationId) */}
        {step === "select-org" && (
          <div>
            <div style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>&#10003;</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>
                {t("setup.validation.success")}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                {t("wizard.organization_id", { value0: orgId.substring(0, 12) })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => setStep("enter-key")} style={btnSecondary}>
                {t("common.back")}
              </button>
              <button onClick={() => setStep("confirm")} style={btnPrimary}>
                {t("common.next")}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && (
          <div>
            <div style={{ ...instructionBox, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{t("wizard.review_config")}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <div style={{ marginBottom: 4 }}>
                  {t("wizard.session_key")}: ****{sessionKey.slice(-6)}
                </div>
                <div>{t("wizard.organization")}: {orgId.substring(0, 12)}...</div>
              </div>
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => setStep("select-org")} style={btnSecondary}>
                {t("common.back")}
              </button>
              <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                {saving ? t("wizard.saving") : t("wizard.save_configuration")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const instructionBox: React.CSSProperties = {
  padding: 12, background: "var(--bg-secondary)", borderRadius: "var(--radius)",
  marginBottom: 16, fontSize: 12, lineHeight: 1.6, color: "var(--text-secondary)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 13, background: "var(--bg-secondary)",
  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
  marginTop: 8, padding: "6px 10px", borderRadius: "var(--radius-sm)", fontSize: 12,
  background: "#3b1818", color: "#f87171", border: "1px solid #5c2020",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 18px", fontSize: 13, background: "var(--accent)", border: "none",
  borderRadius: "var(--radius-sm)", color: "#fff", cursor: "pointer", fontWeight: 500,
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 18px", fontSize: 13, background: "var(--bg-secondary)",
  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", cursor: "pointer",
};
