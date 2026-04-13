import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";
import type { MenuBarColorMode, MenuBarIconStyle, MenuBarMetricType } from "@/models/config";

export function AppearanceTab() {
  const { t } = useTranslation();
  const { activeProfile, updateProfile } = useProfileStore();
  const config = activeProfile?.iconConfig;

  if (!activeProfile || !config) return null;

  const updateConfig = (patch: Partial<typeof config>) => {
    updateProfile(activeProfile.id, {
      iconConfig: { ...config, ...patch },
    });
  };

  const updateMetric = (metricType: MenuBarMetricType, patch: Partial<(typeof config.metrics)[0]>) => {
    const metrics = config.metrics.map((m) =>
      m.metricType === metricType ? { ...m, ...patch } : m,
    );
    updateConfig({ metrics });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("appearance.title")}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("appearance.subtitle")}
      </p>

      {/* Global Settings */}
      <Section title={t("appearance.global_settings")}>
        <Toggle
          label={t("appearance.monochrome_title")}
          description={t("appearance.monochrome_description")}
          checked={config.colorMode === "monochrome"}
          onChange={(v) => updateConfig({ colorMode: (v ? "monochrome" : "multiColor") as MenuBarColorMode })}
        />
        <Toggle
          label={t("appearance.show_labels_title")}
          description={t("appearance.show_labels_description")}
          checked={config.showIconNames}
          onChange={(v) => updateConfig({ showIconNames: v })}
        />
        <Toggle
          label={t("appearance.show_remaining_title")}
          description={t("appearance.show_remaining_description")}
          checked={config.showRemainingPercentage}
          onChange={(v) => updateConfig({ showRemainingPercentage: v })}
        />
      </Section>

      {/* Pace Marker */}
      <Section title={t("appearance.pace_marker_section_title")}>
        <Toggle
          label={t("appearance.show_time_marker_title")}
          description={t("appearance.show_time_marker_description")}
          checked={config.showTimeMarker}
          onChange={(v) => updateConfig({ showTimeMarker: v })}
        />
        <Toggle
          label={t("appearance.show_pace_marker_title")}
          description={t("appearance.show_pace_marker_description")}
          checked={config.showPaceMarker}
          onChange={(v) => updateConfig({ showPaceMarker: v })}
        />
        <Toggle
          label={t("appearance.pace_coloring_title")}
          description={t("appearance.pace_coloring_description")}
          checked={config.usePaceColoring}
          onChange={(v) => updateConfig({ usePaceColoring: v })}
        />
      </Section>

      {/* Metric Configuration */}
      <Section title={t("appearance.metric_configuration")}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>
          {t("appearance.drag_to_reorder")}
        </p>
        {config.metrics.map((metric) => (
          <div
            key={metric.metricType}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-sm)",
              marginBottom: 4,
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={metric.isEnabled}
                onChange={(e) => updateMetric(metric.metricType, { isEnabled: e.target.checked })}
              />
              <span style={{ fontSize: 13 }}>
                {t(`metric.${metric.metricType === "session" ? "session_usage" : metric.metricType === "week" ? "week_usage" : "api_credits"}`)}
              </span>
            </div>
            <select
              value={metric.iconStyle}
              onChange={(e) => updateMetric(metric.metricType, { iconStyle: e.target.value as MenuBarIconStyle })}
              style={selectStyle}
            >
              <option value="battery">{t("icon_style.battery")}</option>
              <option value="percentage">{t("icon_style.percentage")}</option>
              <option value="textOnly">{t("icon_style.text_only")}</option>
              <option value="minimal">{t("icon_style.minimal")}</option>
            </select>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600 }}>{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <div style={{ fontSize: 13 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 16, height: 16, cursor: "pointer" }}
      />
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "4px 8px", fontSize: 12, background: "var(--bg-card)",
  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
};
