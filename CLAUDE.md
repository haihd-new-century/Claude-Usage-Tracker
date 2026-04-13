# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Usage Tracker is a native macOS menu bar application (Swift/SwiftUI) for real-time monitoring of Claude AI usage limits. It tracks 5-hour session windows, weekly usage, Opus-specific consumption, and API console costs across multiple profiles.

Current version: 3.0.3. macOS 14.0+ (Sonoma) required. The app runs as a menu bar accessory (no dock icon).

## Build & Run

```bash
# Open in Xcode (requires Xcode 15+ on macOS 14+)
open "Claude Usage.xcodeproj"
# Build and run: Cmd+R (select "Claude Usage" scheme)

# CI build (no code signing)
xcodebuild build \
  -project "Claude Usage.xcodeproj" \
  -scheme "Claude Usage" \
  -configuration Debug \
  -derivedDataPath build \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO

# Run tests
xcodebuild test \
  -project "Claude Usage.xcodeproj" \
  -scheme "Claude Usage" \
  -configuration Debug \
  -derivedDataPath build \
  -destination "platform=macOS" \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO

# Validate localizations (all 9 languages have matching keys)
bash scripts/validate_localizations.sh
```

## Architecture

**Pattern**: MVVM with Protocol-Oriented Design and Coordinator pattern.

### Lifecycle Flow
`ClaudeUsageTrackerApp` (SwiftUI entry) -> `AppDelegate` (NSApplicationDelegate) -> `MenuBarManager` (central coordinator) -> `StatusBarUIManager` + `UsageRefreshCoordinator` + `WindowCoordinator`

The app hides its dock icon (`NSApp.setActivationPolicy(.accessory)`) and lives entirely in the menu bar. On first launch, a setup wizard appears; otherwise `MenuBarManager.setup()` initializes the status bar items.

### Key Layers

- **MenuBar/** — Status bar UI, popover management, icon rendering, refresh coordination. `MenuBarManager` is the central hub that owns the refresh timer, API service, profile observation, and window management.
- **Shared/Services/** — All business logic. `ClaudeAPIService` handles both Claude.ai web API and Console API with three auth types (session cookie, CLI OAuth bearer, console session). `ProfileManager` manages unlimited profiles with isolated credentials. `StatuslineService` generates and installs shell scripts to `~/.claude/` for terminal integration. `ClaudeCodeSyncService` reads CLI credentials from `~/.claude/.credentials.json` or system Keychain.
- **Shared/Models/** — Pure data structs (`ClaudeUsage`, `APIUsage`, `Profile`, `MenuBarIconConfig`, etc.)
- **Shared/Storage/** — `DataStore` (per-profile UserDefaults), `SharedDataStore` (app-wide UserDefaults), `ProfileStore` (profile persistence)
- **Shared/Protocols/** — `APIServiceProtocol`, `StorageProvider`, `NotificationServiceProtocol` for dependency injection and testability
- **Views/** — SwiftUI views organized as Settings/{App,Profile,Credentials,Components,DesignSystem} and top-level views

### Multi-Profile System
`ProfileManager` (singleton, `@MainActor`) holds all profiles. Each `Profile` has isolated credentials (Claude.ai session key, API console key, CLI OAuth token), appearance settings, refresh intervals, and notification thresholds. Profile credentials are stored in macOS Keychain via `KeychainService`. When switching profiles, CLI credentials auto-update via `ClaudeCodeSyncService`.

### API Integration
Two main endpoints:
- `https://claude.ai/api/organizations/{org_id}/usage` — web usage (session cookie auth)
- `https://console.anthropic.com/api/...` — API console usage (API session key auth)

Both are accessed through `ClaudeAPIService` which implements `APIServiceProtocol`.

### Statusline System
`StatuslineService` generates a Swift script (`fetch-claude-usage.swift`) and bash script (`statusline-command.sh`) installed to `~/.claude/`. Session keys and org IDs are injected into the Swift script at install time. The statusline reads cached usage data for instant rendering.

## Conventions

- **Commit messages**: Conventional Commits format — `feat(scope):`, `fix(scope):`, `refactor(scope):`, etc.
- **Branch naming**: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/` prefixes
- **Code style**: Swift API Design Guidelines, MARK comments for code sections, prefer `async/await`, structs for data models, enums for constants
- **Localization**: 9 languages in `Claude Usage/Resources/{lang}.lproj/Localizable.strings`. English is the base. Run `scripts/validate_localizations.sh` to verify key parity.
- **Singletons**: Most services use `static let shared` pattern (`ProfileManager.shared`, `KeychainService.shared`, `LoggingService.shared`, etc.)

## Release Process

1. Bump `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` in `Claude Usage.xcodeproj/project.pbxproj`
2. Update `CHANGELOG.md`
3. Commit, tag `vX.Y.Z`, push tag
4. CI workflows: build -> sign -> notarize -> draft GitHub release -> generate appcast -> update Homebrew cask

## Testing

Test files are in `Claude UsageTests/`. Tests cover: session key validation, URL building, usage status calculation, date extensions, shared data store. Tests run via Xcode's test runner or `xcodebuild test` CLI.

To test specific launch scenarios, use launch arguments:
- `--show-github-prompt` — force GitHub star prompt
- `--show-feedback-prompt` — force feedback prompt

## Platform Dependencies

The app deeply integrates with macOS-specific APIs:
- `NSStatusBar` / `NSStatusItem` (menu bar)
- `NSPopover` (usage popover)
- macOS Keychain (`Security` framework)
- `NSEvent` global monitors (click-away-to-close)
- `NSScreen` (multi-display, headless support)
- `UNUserNotificationCenter` (notifications)
- `NSApp.setActivationPolicy(.accessory)` (dock hiding)
- `WKWebView` (browser-based auth)
- Sparkle framework (auto-updates)
- `UserDefaults` with App Groups
- `LaunchAtLoginManager` (login item)
