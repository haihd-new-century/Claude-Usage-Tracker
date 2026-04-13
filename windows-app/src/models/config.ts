// ─── Menu Bar Icon Styles ───────────────────────────────────────────────────

export type MenuBarIconStyle = "battery" | "progressBar" | "percentageOnly" | "iconWithBar" | "compact";

export type MenuBarMetricType = "session" | "week" | "api";

export type MenuBarColorMode = "multiColor" | "monochrome" | "singleColor";

export type APIDisplayMode = "remaining" | "used" | "both";

export type WeekDisplayMode = "percentage" | "tokens";

// ─── Metric Icon Config ─────────────────────────────────────────────────────

export interface MetricIconConfig {
  metricType: MenuBarMetricType;
  isEnabled: boolean;
  iconStyle: MenuBarIconStyle;
  order: number;
  weekDisplayMode: WeekDisplayMode;
  apiDisplayMode: APIDisplayMode;
  showNextSessionTime: boolean;
}

// ─── Global Icon Configuration ──────────────────────────────────────────────

export interface MenuBarIconConfiguration {
  colorMode: MenuBarColorMode;
  singleColorHex: string;
  showIconNames: boolean;
  showRemainingPercentage: boolean;
  showTimeMarker: boolean;
  showPaceMarker: boolean;
  usePaceColoring: boolean;
  metrics: MetricIconConfig[];
}

// ─── Statusline Color Mode ──────────────────────────────────────────────────

export type StatuslineColorMode = "multiColor" | "greyscale" | "singleColor";

// ─── Time Format ────────────────────────────────────────────────────────────

export type TimeFormatPreference = "system" | "12h" | "24h";
