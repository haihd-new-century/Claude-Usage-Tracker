import { useState } from "react";
import { SettingsSidebar, type SettingsTab } from "./SettingsSidebar";
import { ClaudeAITab } from "./tabs/ClaudeAITab";
import { APIConsoleTab } from "./tabs/APIConsoleTab";
import { CLIAccountTab } from "./tabs/CLIAccountTab";
import { AppearanceTab } from "./tabs/AppearanceTab";
import { GeneralTab } from "./tabs/GeneralTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { ProfilesTab } from "./tabs/ProfilesTab";
import { LanguageTab } from "./tabs/LanguageTab";
import { AboutTab } from "./tabs/AboutTab";

const tabComponents: Record<SettingsTab, React.FC> = {
  "claude-ai": ClaudeAITab,
  "api-console": APIConsoleTab,
  "cli-account": CLIAccountTab,
  appearance: AppearanceTab,
  general: GeneralTab,
  history: HistoryTab,
  profiles: ProfilesTab,
  language: LanguageTab,
  about: AboutTab,
};

export function SettingsWindow() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("claude-ai");
  const TabContent = tabComponents[activeTab];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <TabContent />
      </div>
    </div>
  );
}
