# Sprint 4: UI Implementation

> Timeline: Phase 4 of Windows Migration Plan
> Status: **COMPLETED**
> Last updated: 2026-04-13

## Goals

- Build tray popup UI with full usage display
- Build settings window with all tabs
- First-run setup wizard
- Localization (9 languages)

## Tasks

### 4.1 Tray Popup

- [x] Usage cards: session %, weekly %, Opus %
- [x] Color-coded progress bars (10-level gradient)
- [x] Pace markers (6-tier colored)
- [x] Reset countdown timers
- [x] Extra usage / API cost display
- [x] Profile name badge
- [x] Refresh / Settings buttons
- [x] Claude system status indicator
- [x] Dark/Light mode CSS variables

### 4.2 Settings Window

- [x] Sidebar navigation with profile switcher → `SettingsSidebar.tsx`
- [x] Claude.AI credentials tab (session key wizard) → `ClaudeAITab.tsx`
- [x] API Console credentials tab → `APIConsoleTab.tsx`
- [x] CLI Account tab (sync from Claude Code) → `CLIAccountTab.tsx`
- [x] Appearance tab (icon style picker, color mode, pace markers) → `AppearanceTab.tsx`
- [x] General tab (refresh interval, auto-start, notifications) → `GeneralTab.tsx`
- [x] Usage History tab (list view + export JSON/CSV) → `HistoryTab.tsx`
- [x] Manage Profiles tab (CRUD, rename, activate) → `ProfilesTab.tsx`
- [x] Language tab (9 language picker) → `LanguageTab.tsx`
- [x] About tab (version, links, creator) → `AboutTab.tsx`

### 4.3 Setup Wizard

- [x] 3-step wizard: enter key → test connection → confirm & save
- [x] Auto-detect CLI credentials on save
- [x] Skip setup option
- [x] Shows on first launch when no credentials configured

### 4.4 Localization

- [x] Port 9 language files (.strings → JSON) via conversion script
- [x] i18next + react-i18next integration → `i18n/index.ts`
- [x] Language persistence in localStorage
- [x] en: 696 keys, de: 682, es: 682, fr: 682, it: 680, ja: 682, ko: 733, pt: 680, zh: 684

## Files Created

- `src/i18n/index.ts` — i18next config with 9 languages
- `src/i18n/locales/{en,de,es,fr,it,ja,ko,pt,zh}.json` — Translation files
- `src/components/settings/SettingsSidebar.tsx` — Sidebar with sections
- `src/components/settings/tabs/` — All 9 tab components
- `src/components/setup/SetupWizard.tsx` — 3-step first-run wizard
- `scripts/convert-strings.cjs` — .strings → JSON converter

## Notes

- TypeScript strict mode: zero errors after all changes
- All translations use i18next interpolation ({{value0}}, {{count}})
- Settings window uses component map pattern for clean tab routing
