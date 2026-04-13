import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

/** Default shortcut key bindings */
export const DEFAULT_SHORTCUTS = {
  togglePopup: "Alt+Shift+C",
  refreshUsage: "Alt+Shift+R",
} as const;

type ShortcutHandler = () => void | Promise<void>;

const registeredShortcuts = new Map<string, string>();

/** Register a global keyboard shortcut */
export async function registerShortcut(
  name: string,
  shortcut: string,
  handler: ShortcutHandler,
): Promise<void> {
  try {
    // Unregister existing if any
    const existing = registeredShortcuts.get(name);
    if (existing) {
      await unregister(existing);
    }

    await register(shortcut, (event) => {
      if (event.state === "Pressed") {
        handler();
      }
    });
    registeredShortcuts.set(name, shortcut);
  } catch (e) {
    console.warn(`Failed to register shortcut ${shortcut}:`, e);
  }
}

/** Unregister a global keyboard shortcut by name */
export async function unregisterShortcut(name: string): Promise<void> {
  const shortcut = registeredShortcuts.get(name);
  if (shortcut) {
    await unregister(shortcut);
    registeredShortcuts.delete(name);
  }
}

/** Unregister all registered shortcuts */
export async function unregisterAllShortcuts(): Promise<void> {
  for (const [name, shortcut] of registeredShortcuts) {
    await unregister(shortcut);
    registeredShortcuts.delete(name);
  }
}
