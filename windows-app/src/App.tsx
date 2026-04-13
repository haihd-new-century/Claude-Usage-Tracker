import { useEffect, useState } from "react";
import { TrayPopup } from "@/components/tray/TrayPopup";
import { SettingsWindow } from "@/components/settings/SettingsWindow";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { useProfileStore } from "@/stores/profileStore";
import { hasAnyCredentials } from "@/models/profile";

export default function App() {
  const { loadProfiles, activeProfile } = useProfileStore();
  const [loaded, setLoaded] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    loadProfiles().then(() => setLoaded(true));
  }, [loadProfiles]);

  // Show setup wizard on first launch (no credentials)
  useEffect(() => {
    if (loaded && activeProfile && !hasAnyCredentials(activeProfile)) {
      setShowWizard(true);
    }
  }, [loaded, activeProfile]);

  if (!loaded) return null;

  // Route based on URL hash
  const isSettings = window.location.hash === "#/settings";

  if (isSettings) {
    return <SettingsWindow />;
  }

  if (showWizard) {
    return <SetupWizard onComplete={() => setShowWizard(false)} />;
  }

  return <TrayPopup />;
}
