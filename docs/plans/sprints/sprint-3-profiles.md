# Sprint 3: Profile System

> Timeline: Phase 3 of Windows Migration Plan
> Status: **COMPLETED**
> Last updated: 2026-04-13

## Goals
- Port multi-profile management system
- Implement profile persistence on Windows
- Claude Code CLI integration for Windows

## Tasks

### 3.1 Profile Management
- [x] `ProfileManager` — CRUD profiles, switch active profile → `stores/profileStore.ts`
- [x] `ProfileStore` — persist profiles to `%APPDATA%/Claude Usage Tracker/profiles.json`
- [x] Per-profile isolated settings (credentials, appearance, refresh, notifications)
- [x] Profile display modes: Single / Multi
- [x] Fun auto-name generator integration

### 3.2 Claude Code CLI Integration
- [x] Read CLI credentials from `%USERPROFILE%\.claude\.credentials.json` → `services/cliSyncService.ts`
- [x] Fallback to Windows Credential Manager
- [x] Auto-switch CLI credentials when switching profiles
- [x] Detect Claude Code installation on Windows

### 3.3 Usage History
- [x] `UsageSnapshot` model → `models/usageHistory.ts`
- [x] `UsageHistoryData` with filter/sort/export (JSON, CSV)
- [x] `UsageHistoryService` — periodic recording, pruning, save/load → `services/usageHistoryService.ts`

## Notes
- macOS uses UserDefaults; Windows uses JSON files in %APPDATA%
- CLI credential paths differ: `~/` -> `%USERPROFILE%\`
- History files stored as `history_{profileId}.json` in app data dir
