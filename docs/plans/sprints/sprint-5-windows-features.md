# Sprint 5: Windows-Specific Features

> Timeline: Phase 5-6 of Windows Migration Plan
> Status: **COMPLETED**
> Last updated: 2026-04-13

## Goals

- Auto-start with Windows
- Windows toast notifications
- Global keyboard shortcuts
- Statusline integration for Windows

## Tasks

### 5.1 Auto-Start

- [x] Registry-based auto-start (tauri-plugin-autostart) → `services/autoStartService.ts`
- [x] Enable/disable/toggle API

### 5.2 Notifications

- [x] Windows Toast Notifications (tauri-plugin-notification) → `services/notificationService.ts`
- [x] Permission request handling
- [x] Threshold alerts: 75%, 90%, 95%
- [x] Session reset notifications
- [x] Per-profile threshold state tracking

### 5.3 Global Shortcuts

- [x] Register global hotkeys (tauri-plugin-global-shortcut) → `services/globalShortcutService.ts`
- [x] Default shortcuts: Alt+Shift+C (toggle popup), Alt+Shift+R (refresh)
- [x] Register/unregister/unregisterAll API

### 5.4 Statusline (Windows)

- [x] PowerShell script: `fetch-claude-usage.ps1` → `services/statuslineService.ts`
- [x] PowerShell script: `statusline-command.ps1`
- [x] Install to `%USERPROFILE%\.claude\`
- [x] Update Claude Code settings.json with statusline command
- [x] Session key & org ID injection into fetch script

### 5.5 Deferred to Future

- [ ] Auto-update system (requires Tauri updater plugin + signing)
- [ ] Browser-based auth via WebView2 (requires Tauri webview window for OAuth)

## Notes

- All services are async and TypeScript-typed
- Notification threshold state is tracked in-memory per profile
- Statusline uses PowerShell `-ExecutionPolicy Bypass` for script execution
