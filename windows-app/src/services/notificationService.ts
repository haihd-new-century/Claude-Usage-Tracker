import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import type { NotificationSettings } from "@/models/notifications";

let permissionGranted = false;

/** Initialize notification permissions */
export async function initNotifications(): Promise<void> {
  permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }
}

/** Send a Windows toast notification */
export async function notify(title: string, body: string): Promise<void> {
  if (!permissionGranted) {
    await initNotifications();
  }
  if (permissionGranted) {
    sendNotification({ title, body });
  }
}

// ─── Usage Threshold Notifications ──────────────────────────────────────────

interface ThresholdState {
  notified75: boolean;
  notified90: boolean;
  notified95: boolean;
  notifiedReset: boolean;
  lastResetTime: string | null;
}

const thresholdStates = new Map<string, ThresholdState>();

function getState(profileId: string): ThresholdState {
  let state = thresholdStates.get(profileId);
  if (!state) {
    state = { notified75: false, notified90: false, notified95: false, notifiedReset: false, lastResetTime: null };
    thresholdStates.set(profileId, state);
  }
  return state;
}

/** Check usage against thresholds and send notifications if needed */
export async function checkThresholds(
  profileId: string,
  percentage: number,
  settings: NotificationSettings,
  resetTime: string,
): Promise<void> {
  if (!settings.enabled) return;

  const state = getState(profileId);

  // Reset detection: if reset time changed, clear notification state
  if (state.lastResetTime && state.lastResetTime !== resetTime) {
    state.notified75 = false;
    state.notified90 = false;
    state.notified95 = false;
    state.notifiedReset = false;
  }
  state.lastResetTime = resetTime;

  // Session reset notification
  if (percentage === 0 && !state.notifiedReset && (state.notified75 || state.notified90 || state.notified95)) {
    await notify("Session Reset", "Your session has reset! You now have a fresh 5-hour session available.");
    state.notifiedReset = true;
    return;
  }

  // Threshold notifications
  if (settings.threshold95Enabled && percentage >= 95 && !state.notified95) {
    await notify("Session Usage Critical", `You've used ${percentage.toFixed(0)}% of your 5-hour session limit!`);
    state.notified95 = true;
  } else if (settings.threshold90Enabled && percentage >= 90 && !state.notified90) {
    await notify("Session Usage High", `You've used ${percentage.toFixed(0)}% of your 5-hour session limit.`);
    state.notified90 = true;
  } else if (settings.threshold75Enabled && percentage >= 75 && !state.notified75) {
    await notify("Session Usage Warning", `You've used ${percentage.toFixed(0)}% of your 5-hour session limit.`);
    state.notified75 = true;
  }
}
