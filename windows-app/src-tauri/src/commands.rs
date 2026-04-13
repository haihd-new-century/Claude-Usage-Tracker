use crate::credentials;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

// ─── Credential Commands ────────────────────────────────────────────────────

#[tauri::command]
pub fn save_credential(key: String, value: String) -> Result<(), String> {
    credentials::save(&key, &value)
}

#[tauri::command]
pub fn load_credential(key: String) -> Result<Option<String>, String> {
    credentials::load(&key)
}

#[tauri::command]
pub fn delete_credential(key: String) -> Result<(), String> {
    credentials::delete(&key)
}

#[tauri::command]
pub fn credential_exists(key: String) -> Result<bool, String> {
    credentials::exists(&key)
}

// ─── File System Commands ───────────────────────────────────────────────────

#[tauri::command]
pub fn get_app_data_dir() -> Result<String, String> {
    dirs::data_dir()
        .map(|p| p.join("Claude Usage Tracker").to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine app data directory".to_string())
}

#[tauri::command]
pub fn get_claude_config_dir() -> Result<String, String> {
    // Check CLAUDE_CONFIG_DIR env var first
    if let Ok(config_dir) = std::env::var("CLAUDE_CONFIG_DIR") {
        return Ok(config_dir);
    }
    // Default: %USERPROFILE%\.claude
    dirs::home_dir()
        .map(|p| p.join(".claude").to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine home directory".to_string())
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[tauri::command]
pub fn write_file(path: String, contents: String) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = PathBuf::from(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(&path, contents).map_err(|e| format!("Failed to write {}: {}", path, e))
}

#[tauri::command]
pub fn file_exists(path: String) -> bool {
    PathBuf::from(&path).exists()
}

// ─── Window Commands ────────────────────────────────────────────────────────

#[tauri::command]
pub fn hide_tray_popup(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(popup) = app.get_webview_window("tray-popup") {
        popup.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn show_settings_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(settings) = app.get_webview_window("settings") {
        settings.show().map_err(|e| e.to_string())?;
        settings.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}
