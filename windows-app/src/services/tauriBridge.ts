import { invoke } from "@tauri-apps/api/core";

// ─── Credential Operations ──────────────────────────────────────────────────

export async function saveCredential(key: string, value: string): Promise<void> {
  return invoke("save_credential", { key, value });
}

export async function loadCredential(key: string): Promise<string | null> {
  return invoke("load_credential", { key });
}

export async function deleteCredential(key: string): Promise<void> {
  return invoke("delete_credential", { key });
}

export async function credentialExists(key: string): Promise<boolean> {
  return invoke("credential_exists", { key });
}

// ─── File System ────────────────────────────────────────────────────────────

export async function getAppDataDir(): Promise<string> {
  return invoke("get_app_data_dir");
}

export async function getClaudeConfigDir(): Promise<string> {
  return invoke("get_claude_config_dir");
}

export async function readFile(path: string): Promise<string> {
  return invoke("read_file", { path });
}

export async function writeFile(path: string, contents: string): Promise<void> {
  return invoke("write_file", { path, contents });
}

export async function fileExists(path: string): Promise<boolean> {
  return invoke("file_exists", { path });
}

// ─── Window Control ─────────────────────────────────────────────────────────

export async function hideTrayPopup(): Promise<void> {
  return invoke("hide_tray_popup");
}

export async function showSettingsWindow(): Promise<void> {
  return invoke("show_settings_window");
}
