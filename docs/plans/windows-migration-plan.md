# Plan: Chuyển đổi Claude Usage Tracker sang Windows PC

> Ngày tạo: 2026-04-13
> Branch: `haihd/feature/wip-windows-pc`
> Mục tiêu: Xây dựng phiên bản Windows tương đương chức năng với bản macOS hiện tại

---

## 1. Phân tích hiện trạng

### 1.1 Các phụ thuộc macOS-only cần thay thế

| macOS API | Chức năng | Mức độ khó thay thế |
|-----------|-----------|---------------------|
| `NSStatusBar` / `NSStatusItem` | Icon + menu trên menu bar | Cao — Windows dùng System Tray (NotifyIcon) |
| `NSPopover` | Popup hiển thị usage khi click icon | Trung bình — cần custom popup window |
| `NSWindow` / `NSHostingController` | Settings window, setup wizard | Thấp — dùng WinUI 3 / WPF window |
| `NSApp.setActivationPolicy(.accessory)` | Ẩn dock icon | Thấp — Windows app không cần dock |
| `Security` framework (Keychain) | Lưu session key an toàn | Trung bình — dùng Windows Credential Manager / DPAPI |
| `NSEvent.addGlobalMonitorForEvents` | Click-outside-to-close popover | Thấp — Win32 hook hoặc focus lost event |
| `NSScreen` | Multi-display, headless support | Thấp — Win32 EnumDisplayMonitors |
| `UNUserNotificationCenter` | Push notifications | Thấp — Windows Toast Notifications |
| `WKWebView` | Browser-based auth (sign-in) | Trung bình — dùng WebView2 (Edge Chromium) |
| Sparkle framework | Auto-update | Trung bình — dùng Squirrel.Windows hoặc custom updater |
| `UserDefaults` / App Groups | Lưu settings | Thấp — dùng file JSON/SQLite hoặc Registry |
| `LaunchAtLoginManager` | Khởi động cùng hệ thống | Thấp — Registry Run key hoặc Task Scheduler |
| SwiftUI | Toàn bộ UI | Cao — cần viết lại UI hoàn toàn |

### 1.2 Logic có thể tái sử dụng (platform-independent)

- **API logic**: URL building, request construction, response parsing (`ClaudeAPIService`, `URLBuilder`)
- **Data models**: `ClaudeUsage`, `APIUsage`, `Profile`, `MenuBarIconConfig`, etc.
- **Business logic**: `UsageStatusCalculator`, `PaceStatus`, `SessionKeyValidator`, `FormatterHelper`
- **Profile management logic**: Profile CRUD, switching logic (trừ Keychain + CLI sync)
- **Notification threshold logic**: Khi nào trigger notification
- **Statusline script generation**: Logic tạo script (chỉ cần adapt path)

---

## 2. Lựa chọn công nghệ cho Windows

### 2.1 Phương án đề xuất: **Electron + React/TypeScript**

**Lý do chọn:**
- Hỗ trợ System Tray natively (`Tray` API)
- UI đẹp, dễ customize với web technologies
- Có thể share code nếu sau này làm thêm Linux
- Ecosystem lớn: auto-update (`electron-updater`), notifications, WebView built-in
- Dễ port logic từ Swift sang TypeScript (cùng paradigm async/await)

**Nhược điểm:**
- Bundle size lớn hơn (~100MB vs ~6MB native)
- RAM usage cao hơn

### 2.2 Phương án thay thế: **Tauri + React/TypeScript**

**Ưu điểm so với Electron:**
- Bundle size nhỏ (~10-15MB), dùng WebView2 có sẵn trên Windows
- RAM thấp hơn nhiều
- System tray support tốt
- Rust backend cho credential management (gọi Windows DPAPI)

**Nhược điểm:**
- Ecosystem nhỏ hơn, ít mature hơn
- Cần biết Rust cho backend logic

### 2.3 Phương án thay thế: **.NET WPF/WinUI 3 + C#**

**Ưu điểm:**
- Native Windows, performance tốt nhất
- System tray, notifications, credential manager — tất cả đều native
- Bundle size nhỏ (~5-10MB)

**Nhược điểm:**
- Chỉ chạy trên Windows, không cross-platform
- Cần học C#/.NET nếu team chưa quen

### Khuyến nghị: **Tauri 2.0 + React + TypeScript**
- Cân bằng tốt giữa size, performance, và developer experience
- System tray plugin chính thức
- Auto-updater built-in
- Có thể mở rộng sang Linux sau này

---

## 3. Kế hoạch triển khai chi tiết

### Phase 1: Setup dự án & Core Infrastructure (1-2 tuần)

#### 1.1 Khởi tạo project
- [ ] Tạo Tauri 2.0 project với React + TypeScript template
- [ ] Cấu trúc thư mục:
  ```
  src/                    # React frontend
    components/
      tray/               # System tray popup UI
      settings/           # Settings window
      setup/              # Setup wizard
    hooks/                # React hooks (useUsage, useProfile, etc.)
    services/             # API services (TypeScript port)
    models/               # TypeScript interfaces/types
    stores/               # State management (Zustand hoặc Jotai)
    utils/                # Utility functions
    i18n/                 # Localization (9 languages)
  src-tauri/              # Rust backend
    src/
      credentials.rs      # Windows Credential Manager wrapper
      autostart.rs        # Registry-based auto-start
      tray.rs             # System tray management
      updater.rs          # Auto-update logic
  ```
- [ ] Setup build tooling: Vite, ESLint, Prettier, TypeScript strict mode
- [ ] Setup CI: GitHub Actions cho Windows build

#### 1.2 System Tray Integration
- [ ] Implement system tray icon với Tauri tray plugin
- [ ] Tạo tray popup window (thay thế NSPopover)
  - Click tray icon -> hiển thị popup window gần tray
  - Click outside -> đóng popup
- [ ] Implement icon rendering:
  - 5 icon styles: Battery, Progress Bar, Percentage, Icon+Bar, Compact
  - Dynamic icon update dựa trên usage percentage
  - 3 color modes: Multi-Color, Greyscale, Single Color

#### 1.3 Credential Storage
- [ ] Implement Windows Credential Manager wrapper (Rust side)
  - Thay thế macOS Keychain
  - Save/Load/Delete session keys
  - Encrypt sensitive data với DPAPI
- [ ] Implement credential migration nếu user đã có data

### Phase 2: Port Core Business Logic (1-2 tuần)

#### 2.1 Port Data Models (Swift -> TypeScript)
- [ ] `ClaudeUsage` — usage data với five_hour, seven_day, seven_day_opus
- [ ] `APIUsage` — API console usage data
- [ ] `Profile` — profile model với credentials, settings
- [ ] `MenuBarIconConfig` — icon configuration
- [ ] `NotificationSettings` — notification thresholds
- [ ] `UsageHistory` — historical data points
- [ ] `ClaudeStatus` — system status enum
- [ ] `PaceStatus` — 6-tier pace calculation
- [ ] `ValidationState` — session key validation states

#### 2.2 Port API Service
- [ ] `ClaudeAPIService` — 3 auth types:
  - Claude.ai session cookie (`sessionKey=...`)
  - CLI OAuth bearer token (`Authorization: Bearer ...`)
  - Console API session (`sessionKey=...` on different endpoint)
- [ ] `fetchUsageData()` — GET `claude.ai/api/organizations/{org_id}/usage`
- [ ] `fetchAPIUsageData()` — Console API endpoint
- [ ] `fetchOrganizationId()` — Get org ID from session key
- [ ] `sendInitializationMessage()` — Auto-start session
- [ ] `SessionKeyValidator` — validate session key format
- [ ] `URLBuilder` — construct API URLs safely
- [ ] Error handling: map to user-friendly messages

#### 2.3 Port Business Logic
- [ ] `UsageStatusCalculator` — tính usage status từ raw data
- [ ] `PaceStatus` — 6-tier pace calculation (Comfortable -> Runaway)
- [ ] `FormatterHelper` — format percentages, times, dates
- [ ] `FunnyNameGenerator` — auto-generate profile names
- [ ] Network connectivity monitoring

### Phase 3: Port Profile System (1 tuần)

#### 3.1 Profile Management
- [ ] `ProfileManager` — CRUD profiles, switch active profile
- [ ] `ProfileStore` — persist profiles to JSON file
  - macOS dùng UserDefaults, Windows dùng `%APPDATA%/Claude Usage Tracker/profiles.json`
- [ ] Per-profile isolated settings:
  - Credentials (session key, API key, CLI token)
  - Appearance (icon style, color mode)
  - Refresh interval
  - Notification thresholds
  - Auto-start session toggle
- [ ] Profile display modes: Single / Multi

#### 3.2 Claude Code CLI Integration
- [ ] Read CLI credentials từ:
  - `~/.claude/.credentials.json` (file-based, cross-platform)
  - Windows Credential Manager (fallback)
- [ ] Adapt paths cho Windows: `%USERPROFILE%\.claude\`
- [ ] Auto-switch CLI credentials khi switch profile
- [ ] Detect Claude Code installation

### Phase 4: UI Implementation (2-3 tuần)

#### 4.1 Tray Popup (thay thế PopoverContentView)
- [ ] Usage overview: session %, weekly %, Opus %
- [ ] Color-coded progress bars (10-level gradient)
- [ ] Pace markers (6-tier colored)
- [ ] Reset countdown timers (3-way display: time/remaining/both)
- [ ] API cost display
- [ ] Profile switcher dropdown
- [ ] Refresh button
- [ ] Settings button
- [ ] Claude system status indicator
- [ ] Dark/Light mode support

#### 4.2 Settings Window (thay thế SettingsView)
- [ ] Sidebar navigation với profile switcher
- [ ] **Profile-specific tabs:**
  - Claude.AI credentials (session key setup wizard)
  - API Console credentials
  - CLI Account (sync from Claude Code)
  - Appearance (icon style picker, color mode, pace marker)
  - General (refresh interval, auto-start, notifications)
  - Usage History (interactive charts)
- [ ] **App-wide tabs:**
  - Manage Profiles (create, rename, delete, display mode)
  - Language (9 languages)
  - Claude Code statusline
  - Updates
  - About

#### 4.3 Setup Wizard (first-run)
- [ ] 3-step wizard: test connection -> select org -> save
- [ ] Auto-detect Claude Code CLI credentials
- [ ] Browser sign-in option (WebView2)

#### 4.4 Localization
- [ ] Port 9 language files từ `.strings` format sang JSON/i18next format
- [ ] Languages: en, es, fr, de, it, pt, ja, ko, zh-CN
- [ ] Validation script tương đương `validate_localizations.sh`

### Phase 5: Windows-Specific Features (1 tuần)

#### 5.1 Auto-Start
- [ ] Registry key: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- [ ] Hoặc dùng Tauri autostart plugin

#### 5.2 Notifications
- [ ] Windows Toast Notifications (qua Tauri notification plugin)
- [ ] Threshold alerts: 75%, 90%, 95% + custom
- [ ] Custom notification sounds

#### 5.3 Global Keyboard Shortcuts
- [ ] Register global hotkeys (Tauri global-shortcut plugin)
- [ ] Configurable shortcuts (no admin permission needed)

#### 5.4 Auto-Update
- [ ] Tauri updater plugin
- [ ] Check updates from GitHub releases
- [ ] Background download + install

#### 5.5 Browser-Based Auth
- [ ] WebView2 (built into Tauri) cho sign-in flow
- [ ] Extract session key từ cookies sau khi sign-in
- [ ] Support cả Claude.ai và Anthropic Console

### Phase 6: Statusline Integration (1 tuần)

#### 6.1 Adapt Statusline cho Windows
- [ ] Thay đổi script paths: `%USERPROFILE%\.claude\`
- [ ] Thay Swift script bằng PowerShell hoặc Node.js script
  - `fetch-claude-usage.ps1` hoặc `fetch-claude-usage.js`
- [ ] Adapt `statusline-command.sh` -> `statusline-command.ps1` hoặc `.bat`
- [ ] Update `~/.claude/settings.json` cho Claude Code trên Windows
- [ ] Giữ nguyên: component selection, color modes, pace markers, label toggles

### Phase 7: Testing & Polish (1-2 tuần)

#### 7.1 Testing
- [ ] Unit tests cho tất cả business logic (Vitest)
- [ ] Port test cases từ `Claude UsageTests/`:
  - `SessionKeyValidatorTests` -> TypeScript
  - `URLBuilderTests` -> TypeScript
  - `UsageStatusCalculatorTests` -> TypeScript
  - `DateExtensionsTests` -> TypeScript
  - `SharedDataStoreTests` -> TypeScript
- [ ] Integration tests cho API calls (mock server)
- [ ] E2E tests cho critical flows (Playwright)

#### 7.2 Polish
- [ ] Windows 10 compatibility testing (tối thiểu Win 10 1809+)
- [ ] Windows 11 native look & feel
- [ ] High DPI / scaling support
- [ ] Multi-monitor support
- [ ] Dark/Light mode theo Windows system setting
- [ ] Installer: MSI hoặc NSIS
  - Portable version (no install)
  - Winget package
  - Scoop package

### Phase 8: CI/CD & Release (3-5 ngày)

#### 8.1 GitHub Actions
- [ ] Windows build workflow (tương đương `build.yml`)
- [ ] Release workflow: build -> sign (optional) -> create release
- [ ] Auto-update feed generation
- [ ] Winget manifest auto-update

#### 8.2 Distribution
- [ ] GitHub Releases: `.msi` installer + portable `.zip`
- [ ] Winget package submission
- [ ] Scoop bucket
- [ ] README update cho Windows installation instructions

---

## 4. Cấu trúc thư mục đề xuất (Tauri project)

```
claude-usage-tracker-windows/
├── src/                          # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── tray/
│   │   │   ├── TrayPopup.tsx     # Main popup (thay NSPopover)
│   │   │   ├── UsageCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── PaceMarker.tsx
│   │   ├── settings/
│   │   │   ├── SettingsWindow.tsx
│   │   │   ├── ProfileSidebar.tsx
│   │   │   ├── tabs/
│   │   │   │   ├── ClaudeAITab.tsx
│   │   │   │   ├── APIConsoleTab.tsx
│   │   │   │   ├── CLIAccountTab.tsx
│   │   │   │   ├── AppearanceTab.tsx
│   │   │   │   ├── GeneralTab.tsx
│   │   │   │   ├── UsageHistoryTab.tsx
│   │   │   │   ├── ManageProfilesTab.tsx
│   │   │   │   ├── LanguageTab.tsx
│   │   │   │   ├── ClaudeCodeTab.tsx
│   │   │   │   ├── UpdatesTab.tsx
│   │   │   │   └── AboutTab.tsx
│   │   │   └── components/
│   │   │       ├── IconStylePicker.tsx
│   │   │       ├── ShortcutRecorder.tsx
│   │   │       └── UsageCharts.tsx
│   │   └── setup/
│   │       └── SetupWizard.tsx
│   ├── services/
│   │   ├── claudeApi.ts          # Port of ClaudeAPIService
│   │   ├── profileManager.ts     # Port of ProfileManager
│   │   ├── statuslineService.ts  # Port of StatuslineService
│   │   ├── notificationService.ts
│   │   └── networkMonitor.ts
│   ├── models/
│   │   ├── usage.ts              # ClaudeUsage, APIUsage
│   │   ├── profile.ts            # Profile, ProfileDisplayMode
│   │   ├── config.ts             # MenuBarIconConfig, StatuslineColorMode
│   │   └── status.ts             # ClaudeStatus, PaceStatus
│   ├── stores/
│   │   ├── usageStore.ts         # Zustand store for usage data
│   │   ├── profileStore.ts       # Profile state
│   │   └── settingsStore.ts      # App settings
│   ├── utils/
│   │   ├── constants.ts          # Port of Constants.swift
│   │   ├── formatter.ts          # Port of FormatterHelper
│   │   ├── sessionKeyValidator.ts
│   │   ├── urlBuilder.ts
│   │   ├── usageCalculator.ts
│   │   └── funnyNameGenerator.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.json
│   │       ├── es.json
│   │       ├── fr.json
│   │       ├── de.json
│   │       ├── it.json
│   │       ├── pt.json
│   │       ├── ja.json
│   │       ├── ko.json
│   │       └── zh-CN.json
│   └── styles/
│       ├── globals.css
│       └── design-tokens.ts      # Port of DesignTokens.swift
├── src-tauri/                    # Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── credentials.rs        # Windows Credential Manager
│   │   ├── tray.rs               # System tray logic
│   │   ├── autostart.rs          # Registry auto-start
│   │   └── commands.rs           # Tauri IPC commands
│   └── icons/                    # App icons (.ico)
├── tests/
│   ├── unit/
│   │   ├── sessionKeyValidator.test.ts
│   │   ├── urlBuilder.test.ts
│   │   ├── usageCalculator.test.ts
│   │   └── formatter.test.ts
│   └── e2e/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 5. Mapping macOS -> Windows APIs

| Chức năng | macOS (hiện tại) | Windows (Tauri) |
|-----------|------------------|-----------------|
| System tray icon | `NSStatusBar` / `NSStatusItem` | `tauri-plugin-tray` |
| Tray popup | `NSPopover` | Custom Tauri window (positioned near tray) |
| Settings window | `NSWindow` + SwiftUI | Tauri WebView window |
| Secure storage | macOS Keychain (`Security`) | Windows Credential Manager (`windows-sys` crate) |
| Notifications | `UNUserNotificationCenter` | `tauri-plugin-notification` |
| Global shortcuts | `NSEvent.addGlobalMonitor` | `tauri-plugin-global-shortcut` |
| Auto-start | `LaunchAtLoginManager` (SMAppService) | `tauri-plugin-autostart` |
| Auto-update | Sparkle framework | `tauri-plugin-updater` |
| Browser auth | `WKWebView` | WebView2 (built into Tauri) |
| Settings storage | `UserDefaults` + App Groups | JSON files in `%APPDATA%` |
| Network monitor | `NWPathMonitor` | `tauri-plugin-network` hoặc OS events |
| File paths | `~/` , `~/.claude/` | `%USERPROFILE%\`, `%USERPROFILE%\.claude\` |
| Clipboard | `NSPasteboard` | `tauri-plugin-clipboard` |

---

## 6. Các rủi ro & giải pháp

| Rủi ro | Ảnh hưởng | Giải pháp |
|--------|-----------|-----------|
| System tray popup positioning khó chính xác trên Windows | UX kém | Dùng Tauri window API với `PhysicalPosition` tính toán từ tray icon bounds |
| Dynamic tray icon rendering (progress bar, battery) trên Windows | Icon thiếu chi tiết | Render icon bằng `<canvas>` -> convert sang `.ico` buffer -> set tray icon |
| Claude Code trên Windows dùng path khác | Statusline không hoạt động | Detect OS, dùng `%USERPROFILE%` thay `~/`, test kỹ trên Windows |
| WebView2 không có sẵn trên Windows 10 cũ | Auth flow fail | Bundle WebView2 bootstrapper, hiển thị hướng dẫn cài đặt |
| Session key format có thể khác theo browser trên Windows | Validation fail | Test với Chrome, Edge, Firefox trên Windows, update validator nếu cần |
| Windows Defender false positive | User không cài được | Code signing certificate (hoặc submit cho Microsoft SmartScreen) |

---

## 7. Timeline ước tính

| Phase | Thời gian | Mô tả |
|-------|-----------|-------|
| Phase 1 | 1-2 tuần | Setup project, tray, credentials |
| Phase 2 | 1-2 tuần | Port business logic & API |
| Phase 3 | 1 tuần | Profile system |
| Phase 4 | 2-3 tuần | UI implementation |
| Phase 5 | 1 tuần | Windows-specific features |
| Phase 6 | 1 tuần | Statusline integration |
| Phase 7 | 1-2 tuần | Testing & polish |
| Phase 8 | 3-5 ngày | CI/CD & release |
| **Tổng** | **~8-12 tuần** | |

---

## 8. Quyết định cần đưa ra trước khi bắt đầu

1. **Chọn tech stack cuối cùng**: Tauri (khuyến nghị) vs Electron vs .NET?
2. **Monorepo hay separate repo?**: Shared types package hay copy code?
3. **Minimum Windows version**: Windows 10 1809+ hay Windows 11 only?
4. **Code signing**: Mua certificate cho Windows hay self-signed?
5. **Có port cả macOS sang Tauri không?**: Nếu có, sẽ có 1 codebase chung cho cả 2 platform
6. **Tên app trên Windows**: Giữ "Claude Usage Tracker" hay đổi?
