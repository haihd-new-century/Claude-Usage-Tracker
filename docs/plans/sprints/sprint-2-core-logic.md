# Sprint 2: Port Core Business Logic

> Timeline: Phase 2 of Windows Migration Plan
> Status: **COMPLETED**
> Last updated: 2026-04-13

## Goals

- Port all data models from Swift to TypeScript
- Port API service with 3 auth types
- Port business logic utilities

## Tasks

### 2.1 Data Models (Swift -> TypeScript)

- [x] `ClaudeUsage` — five_hour, seven_day, seven_day_opus, extra_usage → `models/usage.ts`
- [x] `APIUsage` — API console usage data → `models/usage.ts`
- [x] `Profile` — profile model with credentials, settings → `models/profile.ts`
- [x] `MenuBarIconConfig` — icon configuration → `models/config.ts`
- [x] `NotificationSettings` — notification thresholds → `models/notifications.ts`
- [ ] `UsageHistory` — historical data points (Sprint 4)
- [x] `ClaudeStatus` — system status enum → `models/status.ts`
- [x] `PaceStatus` — 6-tier pace calculation → `models/status.ts`
- [ ] `ValidationState` — session key validation states (Sprint 4)

### 2.2 API Service

- [x] `ClaudeAPIService` — 3 auth types (session cookie, CLI OAuth, console session) → `services/claudeApi.ts`
- [x] `fetchUsageData()` — GET claude.ai usage endpoint
- [x] `fetchAPIUsageData()` — Console API endpoint
- [x] `fetchOrganizationId()` — Get org ID from session key
- [x] `sendInitializationMessage()` — Auto-start session
- [x] `fetchClaudeStatus()` — System status check
- [x] Error handling with `ClaudeAPIError` class

### 2.3 Utilities

- [x] `SessionKeyValidator` — validate session key format → `utils/sessionKeyValidator.ts`
- [x] `URLBuilder` — construct API URLs safely → `utils/urlBuilder.ts`
- [x] `UsageStatusCalculator` — compute status from raw data → `utils/usageCalculator.ts`
- [x] `FormatterHelper` — format percentages, times, dates → `utils/formatter.ts`
- [x] `FunnyNameGenerator` — auto-generate profile names → `utils/funnyNameGenerator.ts`
- [x] `Constants` — app-wide constants → `utils/constants.ts`

## Notes

- All models are JSON-serializable (using ISO 8601 strings for dates)
- API service uses browser `fetch()` — works in Tauri's WebView
- SessionKeyValidator includes full security checks (null bytes, control chars, injection patterns)
