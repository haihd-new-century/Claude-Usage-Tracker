import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";

export function GeneralTab() {
  const { t } = useTranslation();
  const { activeProfile, updateProfile } = useProfileStore();

  if (!activeProfile) return null;

  const setRefreshInterval = (val: number) => {
    updateProfile(activeProfile.id, { refreshInterval: val });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("general.title")}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("general.subtitle")}
      </p>

      {/* Refresh Interval */}
      <Section title={t("general.refresh_title")} subtitle={t("general.refresh_subtitle")}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t("general.refresh_min")}</span>
          <input
            type="range"
            min={10}
            max={300}
            step={10}
            value={activeProfile.refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t("general.refresh_max")}</span>
        </div>
        <div style={{ textAlign: "center", fontSize: 13, marginTop: 4, fontWeight: 600 }}>
          {t("general.refresh_seconds", { count: activeProfile.refreshInterval })}
        </div>
      </Section>

      {/* Auto-Start Session */}
      <Section title={t("general.autostart_title")} subtitle={t("general.autostart_subtitle")}>
        <Toggle
          label={t("general.autostart_toggle")}
          description={t("general.autostart_description")}
          checked={activeProfile.autoStartSessionEnabled}
          onChange={(v) => updateProfile(activeProfile.id, { autoStartSessionEnabled: v })}
        />
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
          {t("general.autostart_requirement")}
        </div>
      </Section>

      {/* Notifications */}
      <Section title={t("general.notifications_title")} subtitle={t("general.notifications_subtitle")}>
        <Toggle
          label={t("notifications.enable")}
          description={t("notifications.enable.description")}
          checked={activeProfile.notificationSettings.enabled}
          onChange={(v) =>
            updateProfile(activeProfile.id, {
              notificationSettings: { ...activeProfile.notificationSettings, enabled: v },
            })
          }
        />
        {activeProfile.notificationSettings.enabled && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
              {t("notifications.alert_thresholds")}
            </div>
            <Toggle
              label={`${t("notifications.threshold.warning")} (75%)`}
              description=""
              checked={activeProfile.notificationSettings.threshold75Enabled}
              onChange={(v) =>
                updateProfile(activeProfile.id, {
                  notificationSettings: { ...activeProfile.notificationSettings, threshold75Enabled: v },
                })
              }
            />
            <Toggle
              label={`${t("notifications.threshold.high")} (90%)`}
              description=""
              checked={activeProfile.notificationSettings.threshold90Enabled}
              onChange={(v) =>
                updateProfile(activeProfile.id, {
                  notificationSettings: { ...activeProfile.notificationSettings, threshold90Enabled: v },
                })
              }
            />
            <Toggle
              label={`${t("notifications.threshold.critical")} (95%)`}
              description=""
              checked={activeProfile.notificationSettings.threshold95Enabled}
              onChange={(v) =>
                updateProfile(activeProfile.id, {
                  notificationSettings: { ...activeProfile.notificationSettings, threshold95Enabled: v },
                })
              }
            />
          </div>
        )}
      </Section>

      {/* Extra Usage */}
      <Section title={t("general.check_overage_limit")} subtitle={t("general.check_overage_limit.description")}>
        <Toggle
          label={t("general.check_overage_limit")}
          description=""
          checked={activeProfile.checkOverageLimitEnabled}
          onChange={(v) => updateProfile(activeProfile.id, { checkOverageLimitEnabled: v })}
        />
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600 }}>{title}</h3>
      {subtitle && <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--text-muted)" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
      <div>
        <div style={{ fontSize: 13 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{description}</div>}
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
    </div>
  );
}
