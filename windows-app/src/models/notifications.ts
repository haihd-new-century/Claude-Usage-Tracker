export interface NotificationSettings {
  enabled: boolean;
  threshold75Enabled: boolean;
  threshold90Enabled: boolean;
  threshold95Enabled: boolean;
  soundName: string;
  customThresholds: number[];
}

/** All active thresholds (built-in + custom), sorted ascending */
export function sortedThresholds(settings: NotificationSettings): number[] {
  const thresholds: number[] = [];
  if (settings.threshold75Enabled) thresholds.push(75);
  if (settings.threshold90Enabled) thresholds.push(90);
  if (settings.threshold95Enabled) thresholds.push(95);
  thresholds.push(...settings.customThresholds);
  return [...new Set(thresholds)].sort((a, b) => a - b);
}
