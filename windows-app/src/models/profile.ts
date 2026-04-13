import type { ClaudeUsage, APIUsage } from "./usage";
import type { MenuBarIconConfiguration } from "./config";
import type { NotificationSettings } from "./notifications";

/** Represents a complete isolated profile with all credentials and settings */
export interface Profile {
  id: string; // UUID
  name: string;

  // Credentials
  claudeSessionKey: string | null;
  organizationId: string | null;
  apiSessionKey: string | null;
  apiOrganizationId: string | null;
  apiSessionKeyExpiry: string | null; // ISO 8601
  cliCredentialsJSON: string | null;

  // CLI Account Sync Metadata
  hasCliAccount: boolean;
  cliAccountSyncedAt: string | null; // ISO 8601

  // Usage Data (Per-Profile)
  claudeUsage: ClaudeUsage | null;
  apiUsage: APIUsage | null;

  // Appearance Settings (Per-Profile)
  iconConfig: MenuBarIconConfiguration;

  // Behavior Settings (Per-Profile)
  refreshInterval: number; // seconds
  autoStartSessionEnabled: boolean;
  checkOverageLimitEnabled: boolean;

  // Notification Settings (Per-Profile)
  notificationSettings: NotificationSettings;

  // Display Configuration
  isSelectedForDisplay: boolean;

  // Metadata
  createdAt: string; // ISO 8601
  lastUsedAt: string; // ISO 8601
}

export function hasClaudeAI(profile: Profile): boolean {
  return profile.claudeSessionKey != null && profile.organizationId != null;
}

export function hasAPIConsole(profile: Profile): boolean {
  return profile.apiSessionKey != null && profile.apiOrganizationId != null;
}

export function hasAnyCredentials(profile: Profile): boolean {
  return hasClaudeAI(profile) || hasAPIConsole(profile) || profile.cliCredentialsJSON != null;
}

export function hasUsageCredentials(profile: Profile): boolean {
  return hasClaudeAI(profile) || hasAPIConsole(profile) || profile.cliCredentialsJSON != null;
}

export function createDefaultProfile(name: string): Profile {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    claudeSessionKey: null,
    organizationId: null,
    apiSessionKey: null,
    apiOrganizationId: null,
    apiSessionKeyExpiry: null,
    cliCredentialsJSON: null,
    hasCliAccount: false,
    cliAccountSyncedAt: null,
    claudeUsage: null,
    apiUsage: null,
    iconConfig: defaultIconConfiguration(),
    refreshInterval: 30,
    autoStartSessionEnabled: false,
    checkOverageLimitEnabled: true,
    notificationSettings: defaultNotificationSettings(),
    isSelectedForDisplay: true,
    createdAt: now,
    lastUsedAt: now,
  };
}

// Import defaults inline to avoid circular deps
function defaultIconConfiguration(): MenuBarIconConfiguration {
  return {
    colorMode: "multiColor",
    singleColorHex: "#00BFFF",
    showIconNames: true,
    showRemainingPercentage: false,
    showTimeMarker: true,
    showPaceMarker: true,
    usePaceColoring: true,
    metrics: [
      { metricType: "session", isEnabled: true, iconStyle: "battery", order: 0, weekDisplayMode: "percentage", apiDisplayMode: "remaining", showNextSessionTime: false },
      { metricType: "week", isEnabled: false, iconStyle: "battery", order: 1, weekDisplayMode: "percentage", apiDisplayMode: "remaining", showNextSessionTime: false },
      { metricType: "api", isEnabled: false, iconStyle: "battery", order: 2, weekDisplayMode: "percentage", apiDisplayMode: "remaining", showNextSessionTime: false },
    ],
  };
}

function defaultNotificationSettings(): NotificationSettings {
  return {
    enabled: true,
    threshold75Enabled: true,
    threshold90Enabled: true,
    threshold95Enabled: true,
    soundName: "default",
    customThresholds: [],
  };
}

/** Profile display mode */
export type ProfileDisplayMode = "single" | "multi";
