# Sprint 6: Testing, Polish & Release

> Timeline: Phase 7-8 of Windows Migration Plan
> Status: **COMPLETED**
> Last updated: 2026-04-13

## Goals

- Unit tests for all business logic
- CI/CD pipeline for Windows
- Build configuration

## Tasks

### 6.1 Unit Tests (Vitest)

- [x] Port `SessionKeyValidatorTests` → 24 tests
- [x] Port `URLBuilderTests` → 14 tests
- [x] Port `UsageStatusCalculatorTests` → 18 tests
- [x] Port `FormatterTests` → 3 tests
- [x] Port `UsageHistoryTests` → 10 tests
- [x] Port `UsageModelTests` → 14 tests
- [x] **Total: 83 tests, all passing**

### 6.2 Vitest Configuration

- [x] `vitest.config.ts` — Node environment, path aliases, glob pattern
- [x] Test files co-located with source (`*.test.ts`)

### 6.3 CI/CD

- [x] `windows-build.yml` — PR/push: TypeScript check + Vitest + Tauri build
- [x] `windows-release.yml` — Tag push: build, test, create GitHub draft release
- [x] Artifact upload for MSI and NSIS installers
- [x] Rust cache for faster CI builds

### 6.4 Deferred to Future

- [ ] E2E tests (requires running app + WebDriver)
- [ ] Windows 10 / 11 manual compatibility testing
- [ ] High DPI / scaling validation
- [ ] Portable ZIP distribution
- [ ] Winget package submission

## Test Results

```
✓ src/utils/sessionKeyValidator.test.ts    (24 tests)
✓ src/utils/urlBuilder.test.ts             (14 tests)
✓ src/utils/usageCalculator.test.ts        (18 tests)
✓ src/utils/formatter.test.ts              (3 tests)
✓ src/models/usageHistory.test.ts          (10 tests)
✓ src/models/usage.test.ts                 (14 tests)

Test Files  6 passed (6)
Tests       83 passed (83)
```

## Notes

- All tests run in < 600ms
- CI uses pnpm with frozen lockfile for reproducibility
- Release workflow creates draft GitHub release with MSI + NSIS installers
