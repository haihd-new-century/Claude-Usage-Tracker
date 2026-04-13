import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

/** Check if auto-start is currently enabled */
export async function isAutoStartEnabled(): Promise<boolean> {
  try {
    return await isEnabled();
  } catch {
    return false;
  }
}

/** Enable auto-start on Windows login */
export async function enableAutoStart(): Promise<void> {
  await enable();
}

/** Disable auto-start on Windows login */
export async function disableAutoStart(): Promise<void> {
  await disable();
}

/** Toggle auto-start based on desired state */
export async function setAutoStart(enabled: boolean): Promise<void> {
  if (enabled) {
    await enableAutoStart();
  } else {
    await disableAutoStart();
  }
}
