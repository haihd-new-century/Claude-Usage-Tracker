import type { ClaudeUsage, APIUsage } from "./usage";

// ─── Reset Type ─────────────────────────────────────────────────────────────

export type ResetType = "sessionReset" | "weeklyReset" | "billingCycle";

// ─── Usage Snapshot ─────────────────────────────────────────────────────────

export interface UsageSnapshot {
  id: string;
  timestamp: string; // ISO 8601
  resetType: ResetType;

  // Claude.ai session usage data
  sessionTokensUsed: number | null;
  sessionPercentage: number | null;

  // Claude.ai weekly usage data
  weeklyTokensUsed: number | null;
  weeklyPercentage: number | null;
  opusWeeklyTokensUsed: number | null;
  opusWeeklyPercentage: number | null;
  sonnetWeeklyTokensUsed: number | null;
  sonnetWeeklyPercentage: number | null;

  // API billing data
  apiSpendCents: number | null;
  apiPrepaidCreditsCents: number | null;
  apiCurrency: string | null;

  // The reset time that triggered this snapshot
  triggeringResetTime: string; // ISO 8601
}

export function createSnapshot(
  resetType: ResetType,
  fields: Partial<Omit<UsageSnapshot, "id" | "timestamp" | "resetType">>,
): UsageSnapshot {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    resetType,
    sessionTokensUsed: null,
    sessionPercentage: null,
    weeklyTokensUsed: null,
    weeklyPercentage: null,
    opusWeeklyTokensUsed: null,
    opusWeeklyPercentage: null,
    sonnetWeeklyTokensUsed: null,
    sonnetWeeklyPercentage: null,
    apiSpendCents: null,
    apiPrepaidCreditsCents: null,
    apiCurrency: null,
    triggeringResetTime: new Date().toISOString(),
    ...fields,
  };
}

export function snapshotFromSessionReset(usage: ClaudeUsage, resetTime: string): UsageSnapshot {
  return createSnapshot("sessionReset", {
    sessionTokensUsed: usage.sessionTokensUsed,
    sessionPercentage: usage.sessionPercentage,
    triggeringResetTime: resetTime,
  });
}

export function snapshotFromWeeklyReset(usage: ClaudeUsage, resetTime: string): UsageSnapshot {
  return createSnapshot("weeklyReset", {
    weeklyTokensUsed: usage.weeklyTokensUsed,
    weeklyPercentage: usage.weeklyPercentage,
    opusWeeklyTokensUsed: usage.opusWeeklyTokensUsed,
    opusWeeklyPercentage: usage.opusWeeklyPercentage,
    sonnetWeeklyTokensUsed: usage.sonnetWeeklyTokensUsed,
    sonnetWeeklyPercentage: usage.sonnetWeeklyPercentage,
    triggeringResetTime: resetTime,
  });
}

export function snapshotFromBillingReset(usage: APIUsage, resetTime: string): UsageSnapshot {
  return createSnapshot("billingCycle", {
    apiSpendCents: usage.currentSpendCents,
    apiPrepaidCreditsCents: usage.prepaidCreditsCents,
    apiCurrency: usage.currency,
    triggeringResetTime: resetTime,
  });
}

// ─── Usage History Data ─────────────────────────────────────────────────────

export interface UsageHistoryData {
  snapshots: UsageSnapshot[];
}

export function emptyHistory(): UsageHistoryData {
  return { snapshots: [] };
}

export function filterByResetType(history: UsageHistoryData, resetType: ResetType): UsageSnapshot[] {
  const tolerance = 60_000; // 1 minute
  return history.snapshots
    .filter((s) => s.resetType === resetType)
    .filter((s) => new Date(s.triggeringResetTime).getTime() <= new Date(s.timestamp).getTime() + tolerance)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function sessionSnapshots(history: UsageHistoryData): UsageSnapshot[] {
  return filterByResetType(history, "sessionReset");
}

export function weeklySnapshots(history: UsageHistoryData): UsageSnapshot[] {
  return filterByResetType(history, "weeklyReset");
}

export function billingSnapshots(history: UsageHistoryData): UsageSnapshot[] {
  return filterByResetType(history, "billingCycle");
}

/** Export history to JSON */
export function exportToJSON(history: UsageHistoryData, resetType?: ResetType): string {
  const data = resetType
    ? { snapshots: history.snapshots.filter((s) => s.resetType === resetType) }
    : history;
  return JSON.stringify(data, null, 2);
}

/** Export history to CSV */
export function exportToCSV(history: UsageHistoryData, resetType?: ResetType): string {
  const header = "Timestamp,Reset Type,Session %,Session Tokens,Weekly %,Weekly Tokens,Opus %,Sonnet %,API Spend,Currency\n";
  const snapshots = resetType
    ? history.snapshots.filter((s) => s.resetType === resetType)
    : history.snapshots;

  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const rows = sorted.map((s) => {
    const ts = s.timestamp.replace("T", " ").substring(0, 19);
    const sessionPct = s.sessionPercentage != null ? s.sessionPercentage.toFixed(1) : "";
    const sessionTok = s.sessionTokensUsed != null ? String(s.sessionTokensUsed) : "";
    const weeklyPct = s.weeklyPercentage != null ? s.weeklyPercentage.toFixed(1) : "";
    const weeklyTok = s.weeklyTokensUsed != null ? String(s.weeklyTokensUsed) : "";
    const opusPct = s.opusWeeklyPercentage != null ? s.opusWeeklyPercentage.toFixed(1) : "";
    const sonnetPct = s.sonnetWeeklyPercentage != null ? s.sonnetWeeklyPercentage.toFixed(1) : "";
    const apiSpend = s.apiSpendCents != null ? String(s.apiSpendCents / 100) : "";
    const currency = s.apiCurrency ?? "";
    return `${ts},${s.resetType},${sessionPct},${sessionTok},${weeklyPct},${weeklyTok},${opusPct},${sonnetPct},${apiSpend},${currency}`;
  });

  return header + rows.join("\n") + "\n";
}
