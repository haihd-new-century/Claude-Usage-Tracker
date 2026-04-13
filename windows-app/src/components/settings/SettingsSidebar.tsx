import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";

export type SettingsTab =
  | "claude-ai"
  | "api-console"
  | "cli-account"
  | "appearance"
  | "general"
  | "history"
  | "profiles"
  | "language"
  | "about";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const sections: { heading: string; items: { tab: SettingsTab; labelKey: string; descKey: string }[] }[] = [
  {
    heading: "section.credentials",
    items: [
      { tab: "claude-ai", labelKey: "section.claudeai_title", descKey: "section.claudeai_desc" },
      { tab: "api-console", labelKey: "section.api_console_title", descKey: "section.api_console_desc" },
      { tab: "cli-account", labelKey: "section.cli_account_title", descKey: "section.cli_account_desc" },
    ],
  },
  {
    heading: "section.settings",
    items: [
      { tab: "appearance", labelKey: "section.appearance_title", descKey: "section.appearance_desc" },
      { tab: "general", labelKey: "section.general_title", descKey: "section.general_desc" },
      { tab: "history", labelKey: "section.history_title", descKey: "section.history_desc" },
      { tab: "profiles", labelKey: "section.manage_profiles_title", descKey: "section.manage_profiles_desc" },
    ],
  },
  {
    heading: "section.app",
    items: [
      { tab: "language", labelKey: "language.title", descKey: "language.subtitle" },
      { tab: "about", labelKey: "settings.about", descKey: "settings.about.description" },
    ],
  },
];

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const { t } = useTranslation();
  const { activeProfile, profiles, setActiveProfile } = useProfileStore();

  return (
    <div
      style={{
        width: 220,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Profile switcher */}
      <div style={{ padding: "12px 12px 8px" }}>
        <select
          value={activeProfile?.id ?? ""}
          onChange={(e) => setActiveProfile(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 8px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-primary)",
            fontSize: 12,
          }}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
        {sections.map((section) => (
          <div key={section.heading} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                padding: "8px 8px 4px",
              }}
            >
              {t(section.heading)}
            </div>
            {section.items.map((item) => (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 8px",
                  marginBottom: 1,
                  background: activeTab === item.tab ? "var(--accent)" : "transparent",
                  color: activeTab === item.tab ? "#fff" : "var(--text-primary)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
