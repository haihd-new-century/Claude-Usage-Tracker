/** Application-wide constants */
export const Constants = {
  /** App Group identifier */
  appGroupIdentifier: "com.claudeusagetracker.windows",

  /** Refresh intervals (in seconds) */
  refreshIntervals: {
    menuBar: 30,
  },

  /** Session window (5 hours in seconds) */
  sessionWindow: 5 * 60 * 60,

  /** Weekly window (7 days in seconds) */
  weeklyWindow: 7 * 24 * 60 * 60,

  /** Weekly limit (tokens) */
  weeklyLimit: 1_000_000,

  /** Notification thresholds */
  notificationThresholds: {
    warning: 75.0,
    high: 90.0,
    critical: 95.0,
  },

  /** GitHub repository */
  githubRepoURL: "https://github.com/hamed-elfayome/Claude-Usage-Tracker",

  /** API Endpoints */
  apiEndpoints: {
    claudeBase: "https://claude.ai/api",
    consoleBase: "https://console.anthropic.com/api",
    statusBase: "https://status.claude.com/api/v2",
  },

  /** UI Timing (ms) */
  uiTiming: {
    popoverCloseDelay: 150,
    refreshAnimationDuration: 1000,
    hoverAnimationDuration: 200,
    transitionDuration: 300,
  },

  /** Window Sizes */
  windowSizes: {
    settings: { width: 720, height: 750 },
    popup: { width: 320, height: 480 },
  },

  /** Credential keys for Windows Credential Manager */
  credentialKeys: {
    claudeSessionKey: "claude-session-key",
    apiSessionKey: "api-session-key",
  },
} as const;
