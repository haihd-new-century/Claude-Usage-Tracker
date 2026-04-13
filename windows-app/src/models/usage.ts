/** Usage status level for color coding */
export enum UsageStatusLevel {
  /** Used mode: 0-50% used | Remaining mode: >20% remaining */
  Safe = "safe",
  /** Used mode: 50-80% used | Remaining mode: 10-20% remaining */
  Moderate = "moderate",
  /** Used mode: 80-100% used | Remaining mode: <10% remaining */
  Critical = "critical",
}

/** Main data model representing Claude usage statistics */
export interface ClaudeUsage {
  // Session data (5-hour rolling window)
  sessionTokensUsed: number;
  sessionLimit: number;
  sessionPercentage: number;
  sessionResetTime: string; // ISO 8601

  // Weekly data (all models)
  weeklyTokensUsed: number;
  weeklyLimit: number;
  weeklyPercentage: number;
  weeklyResetTime: string; // ISO 8601

  // Weekly data (Opus only)
  opusWeeklyTokensUsed: number;
  opusWeeklyPercentage: number;

  // Weekly data (Sonnet only)
  sonnetWeeklyTokensUsed: number;
  sonnetWeeklyPercentage: number;
  sonnetWeeklyResetTime: string | null;

  // Extra usage data
  costUsed: number | null;
  costLimit: number | null;
  costCurrency: string | null;

  // Overage credit grant balance
  overageBalance: number | null;
  overageBalanceCurrency: string | null;

  // Metadata
  lastUpdated: string; // ISO 8601
}

/** Returns 0% if session expired, otherwise the raw percentage */
export function effectiveSessionPercentage(usage: ClaudeUsage): number {
  return new Date(usage.sessionResetTime) < new Date() ? 0.0 : usage.sessionPercentage;
}

/** Remaining percentage (100 - used) */
export function remainingPercentage(usage: ClaudeUsage): number {
  return Math.max(0, 100 - effectiveSessionPercentage(usage));
}

export function emptyUsage(): ClaudeUsage {
  const now = new Date();
  return {
    sessionTokensUsed: 0,
    sessionLimit: 0,
    sessionPercentage: 0,
    sessionResetTime: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
    weeklyTokensUsed: 0,
    weeklyLimit: 1_000_000,
    weeklyPercentage: 0,
    weeklyResetTime: now.toISOString(),
    opusWeeklyTokensUsed: 0,
    opusWeeklyPercentage: 0,
    sonnetWeeklyTokensUsed: 0,
    sonnetWeeklyPercentage: 0,
    sonnetWeeklyResetTime: null,
    costUsed: null,
    costLimit: null,
    costCurrency: null,
    overageBalance: null,
    overageBalanceCurrency: null,
    lastUpdated: now.toISOString(),
  };
}

// ─── API Usage ──────────────────────────────────────────────────────────────

export enum APICostSourceType {
  CLI = "cli",
  API = "api",
  Unknown = "unknown",
}

export function detectCostSourceType(keyName: string): APICostSourceType {
  const lower = keyName.toLowerCase();
  if (lower.includes("claude code") || lower.includes("claude-code") || lower.includes("cli")) {
    return APICostSourceType.CLI;
  }
  if (
    lower.includes("api") || lower.includes("sdk") || lower.includes("server") ||
    lower.includes("bot") || lower.includes("app") || lower.includes("prod") ||
    lower.includes("dev") || lower.includes("staging") || lower.includes("test")
  ) {
    return APICostSourceType.API;
  }
  return APICostSourceType.Unknown;
}

export interface APICostSource {
  keyId: string;
  keyName: string;
  sourceType: APICostSourceType;
  totalCents: number;
  costByModel: Record<string, number>;
}

export interface APIUsage {
  currentSpendCents: number;
  resetsAt: string; // ISO 8601
  prepaidCreditsCents: number;
  currency: string;
  apiTokenCostCents: number | null;
  apiCostByModel: Record<string, number> | null;
  costBySource: APICostSource[] | null;
  dailyCostCents: Record<string, number> | null;
}

export function apiUsageAmount(usage: APIUsage): number {
  return usage.currentSpendCents / 100.0;
}

export function apiRemainingAmount(usage: APIUsage): number {
  return usage.prepaidCreditsCents / 100.0;
}

export function apiTotalCredits(usage: APIUsage): number {
  return apiUsageAmount(usage) + apiRemainingAmount(usage);
}

export function apiUsagePercentage(usage: APIUsage): number {
  const total = apiTotalCredits(usage);
  return total > 0 ? (apiUsageAmount(usage) / total) * 100.0 : 0;
}

export function formatCents(cents: number, currency: string): string {
  const amount = cents / 100.0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// ─── API Organization ───────────────────────────────────────────────────────

export interface APIOrganization {
  id: string;
  name: string;
}

export function orgDisplayName(org: APIOrganization): string {
  return org.name || org.id;
}
