# Sprint 1: Project Setup & Core Infrastructure

> Timeline: Phase 1 of Windows Migration Plan
> Status: **COMPLETED**
> Last updated: 2026-04-13

## Goals
- Initialize Tauri 2.0 + React + TypeScript project
- Set up build tooling and project structure
- Implement system tray with popup window
- Implement Windows credential storage (Rust backend)

## Tasks

### 1.1 Project Initialization
- [x] Create Tauri 2.0 project with React + TypeScript template
- [x] Configure Vite, TypeScript strict mode
- [x] Set up folder structure per plan
- [ ] Configure ESLint, Prettier (deferred — non-blocking)
- [ ] Add CI workflow for Windows build (Sprint 6)

### 1.2 System Tray Integration
- [x] Implement system tray icon (Tauri tray plugin) — `src-tauri/tauri.conf.json`
- [x] Create tray popup window (replaces NSPopover) — `lib.rs` setup
- [x] Click tray icon -> show/hide popup near tray — `on_tray_icon_event`
- [ ] Click outside -> close popup (needs focus-lost event)
- [ ] Dynamic icon update based on usage percentage (Sprint 4)

### 1.3 Credential Storage (Rust Backend)
- [x] Implement Windows Credential Manager wrapper — `credentials.rs` using `keyring` crate
- [x] Save/Load/Delete session keys — `credentials::save/load/delete/exists`
- [x] Tauri IPC commands for credential operations — `commands.rs`
- [x] File system commands (read/write/exists) — `commands.rs`
- [x] Window control commands (hide popup, show settings) — `commands.rs`

## Build Status
- **Frontend (Vite)**: ✅ Compiles — 51 modules, 213KB gzipped
- **Backend (Cargo)**: ✅ Compiles — 577 crate dependencies resolved
- **TypeScript check**: ✅ No errors
- **Note**: Windows Defender file lock issue requires `CARGO_TARGET_DIR=/c/tmp/cargo-target`

## Files Created

### Rust Backend (`src-tauri/`)
- `Cargo.toml` — Dependencies: tauri 2, keyring 3, dirs 6, reqwest, tokio, serde
- `tauri.conf.json` — App config, tray icon, window definitions, plugins
- `capabilities/default.json` — Tauri 2 permission manifest
- `src/lib.rs` — App setup, tray event handler, window creation
- `src/main.rs` — Entry point
- `src/credentials.rs` — Windows Credential Manager CRUD via keyring
- `src/commands.rs` — IPC commands for credentials, filesystem, windows

### TypeScript Frontend (`src/`)
- `main.tsx`, `App.tsx` — Entry point with hash-based routing
- `models/usage.ts` — ClaudeUsage, APIUsage, APICostSource (ported from Swift)
- `models/profile.ts` — Profile, createDefaultProfile (ported from Swift)
- `models/config.ts` — MenuBarIconConfiguration, MetricIconConfig types
- `models/status.ts` — ClaudeStatus, PaceStatus with 6-tier calculation
- `models/notifications.ts` — NotificationSettings
- `utils/constants.ts` — App-wide constants (ported from Constants.swift)
- `utils/sessionKeyValidator.ts` — Full validation with security checks
- `utils/urlBuilder.ts` — Safe URL construction for API endpoints
- `utils/usageCalculator.ts` — Status calculation, elapsed fraction, bar colors
- `utils/funnyNameGenerator.ts` — Random profile names
- `utils/formatter.ts` — Time, percentage, currency formatting
- `services/tauriBridge.ts` — TypeScript wrappers for Tauri IPC commands
- `services/claudeApi.ts` — Full API service (3 auth types, all endpoints)
- `stores/usageStore.ts` — Zustand store for usage data + refresh logic
- `stores/profileStore.ts` — Zustand store for profile CRUD + persistence
- `components/tray/TrayPopup.tsx` — Main popup UI with usage cards
- `components/tray/UsageCard.tsx` — Usage card with progress bar
- `components/tray/ProgressBar.tsx` — Animated bar with pace marker
- `components/settings/SettingsWindow.tsx` — Settings skeleton with sidebar
- `styles/globals.css` — Dark/light theme CSS variables

## Notes
- Using Tauri 2.0 (not 1.x) for better plugin ecosystem
- React + TypeScript frontend, Rust backend
- Target: Windows 10 1809+ and Windows 11
- Workaround: Use `CARGO_TARGET_DIR=/c/tmp/cargo-target` to avoid Windows Defender file lock during Rust builds
