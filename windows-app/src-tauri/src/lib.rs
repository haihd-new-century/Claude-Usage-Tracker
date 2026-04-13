mod credentials;
mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            // Create the tray popup window (hidden by default)
            let _popup_window = tauri::WebviewWindowBuilder::new(
                app,
                "tray-popup",
                tauri::WebviewUrl::App("index.html".into()),
            )
            .title("Claude Usage Tracker")
            .inner_size(320.0, 480.0)
            .resizable(false)
            .decorations(false)
            .skip_taskbar(true)
            .always_on_top(true)
            .visible(false)
            .focused(false)
            .build()?;

            // Create settings window (hidden by default)
            let _settings_window = tauri::WebviewWindowBuilder::new(
                app,
                "settings",
                tauri::WebviewUrl::App("index.html#/settings".into()),
            )
            .title("Claude Usage Tracker - Settings")
            .inner_size(720.0, 750.0)
            .resizable(true)
            .visible(false)
            .center()
            .build()?;

            Ok(())
        })
        .on_tray_icon_event(|tray_handle, event| {
            match event {
                tauri::tray::TrayIconEvent::Click {
                    button: tauri::tray::MouseButton::Left,
                    button_state: tauri::tray::MouseButtonState::Up,
                    position,
                    ..
                } => {
                    let app = tray_handle.app_handle();
                    if let Some(popup) = app.get_webview_window("tray-popup") {
                        if popup.is_visible().unwrap_or(false) {
                            let _ = popup.hide();
                        } else {
                            // Position popup near the tray icon
                            let _ = popup.set_position(tauri::PhysicalPosition::new(
                                position.x as i32 - 160,
                                position.y as i32 - 490,
                            ));
                            let _ = popup.show();
                            let _ = popup.set_focus();
                        }
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::save_credential,
            commands::load_credential,
            commands::delete_credential,
            commands::credential_exists,
            commands::get_app_data_dir,
            commands::read_file,
            commands::write_file,
            commands::file_exists,
            commands::hide_tray_popup,
            commands::show_settings_window,
            commands::get_claude_config_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
