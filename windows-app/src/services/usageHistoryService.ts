import type { ClaudeUsage, APIUsage } from "@/models/usage";
import type { UsageHistoryData, UsageSnapshot } from "@/models/usageHistory";
import {
  emptyHistory,
  snapshotFromSessionReset,
  snapshotFromWeeklyReset,
  snapshotFromBillingReset,
  createSnapshot,
  sessionSnapshots,
  weeklySnapshots,
} from "@/models/usageHistory";
import { getAppDataDir, readFile, writeFile, fileExists } from "./tauriBridge";

const MAX_SESSION_SNAPSHOTS = 1000;
const MAX_WEEKLY_SNAPSHOTS = 500;
const SESSION_RECORDING_INTERVAL = 10 * 60 * 1000; // 10 minutes
const WEEKLY_RECORDING_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

// In-memory cache for last record times
const lastSessionRecordTimes = new Map<string, number>();
const lastWeeklyRecordTimes = new Map<string, number>();

async function historyFilePath(profileId: string): Promise<string> {
  const dir = await getAppDataDir();
  return `${dir}\\history_${profileId}.json`;
}

export async function loadHistory(profileId: string): Promise<UsageHistoryData> {
  try {
    const path = await historyFilePath(profileId);
    if (await fileExists(path)) {
      const raw = await readFile(path);
      return JSON.parse(raw) as UsageHistoryData;
    }
  } catch {
    // Corrupted or missing file
  }
  return emptyHistory();
}

export async function saveHistory(profileId: string, history: UsageHistoryData): Promise<void> {
  const path = await historyFilePath(profileId);
  await writeFile(path, JSON.stringify(history, null, 2));
}

function pruneSnapshots(
  history: UsageHistoryData,
  getter: (h: UsageHistoryData) => UsageSnapshot[],
  max: number,
): void {
  const filtered = getter(history);
  if (filtered.length > max) {
    const toRemove = filtered.length - max;
    const oldest = filtered.slice(-toRemove);
    const idsToRemove = new Set(oldest.map((s) => s.id));
    history.snapshots = history.snapshots.filter((s) => !idsToRemove.has(s.id));
  }
}

export async function recordSessionReset(
  profileId: string,
  previousUsage: ClaudeUsage | null,
  resetTime: string,
): Promise<void> {
  if (!previousUsage) return;
  if (previousUsage.sessionTokensUsed <= 0 && previousUsage.sessionPercentage <= 0) return;

  const snapshot = snapshotFromSessionReset(previousUsage, resetTime);
  const history = await loadHistory(profileId);
  history.snapshots.push(snapshot);
  pruneSnapshots(history, sessionSnapshots, MAX_SESSION_SNAPSHOTS);
  await saveHistory(profileId, history);
}

export async function recordWeeklyReset(
  profileId: string,
  previousUsage: ClaudeUsage | null,
  resetTime: string,
): Promise<void> {
  if (!previousUsage) return;
  if (previousUsage.weeklyTokensUsed <= 0 && previousUsage.weeklyPercentage <= 0) return;

  const snapshot = snapshotFromWeeklyReset(previousUsage, resetTime);
  const history = await loadHistory(profileId);
  history.snapshots.push(snapshot);
  await saveHistory(profileId, history);
}

export async function recordBillingReset(
  profileId: string,
  previousUsage: APIUsage | null,
  resetTime: string,
): Promise<void> {
  if (!previousUsage) return;
  if (previousUsage.currentSpendCents <= 0) return;

  const snapshot = snapshotFromBillingReset(previousUsage, resetTime);
  const history = await loadHistory(profileId);
  history.snapshots.push(snapshot);
  await saveHistory(profileId, history);
}

export async function recordSessionPeriodic(
  profileId: string,
  usage: ClaudeUsage,
): Promise<void> {
  const now = Date.now();
  const last = lastSessionRecordTimes.get(profileId) ?? 0;
  if (now - last < SESSION_RECORDING_INTERVAL) return;

  const snapshot = createSnapshot("sessionReset", {
    sessionTokensUsed: usage.sessionTokensUsed,
    sessionPercentage: usage.sessionPercentage,
    triggeringResetTime: new Date().toISOString(),
  });

  const history = await loadHistory(profileId);
  history.snapshots.push(snapshot);
  pruneSnapshots(history, sessionSnapshots, MAX_SESSION_SNAPSHOTS);
  await saveHistory(profileId, history);
  lastSessionRecordTimes.set(profileId, now);
}

export async function recordWeeklyPeriodic(
  profileId: string,
  usage: ClaudeUsage,
): Promise<void> {
  const now = Date.now();
  const last = lastWeeklyRecordTimes.get(profileId) ?? 0;
  if (now - last < WEEKLY_RECORDING_INTERVAL) return;

  const snapshot = createSnapshot("weeklyReset", {
    weeklyTokensUsed: usage.weeklyTokensUsed,
    weeklyPercentage: usage.weeklyPercentage,
    opusWeeklyTokensUsed: usage.opusWeeklyTokensUsed,
    opusWeeklyPercentage: usage.opusWeeklyPercentage,
    sonnetWeeklyTokensUsed: usage.sonnetWeeklyTokensUsed,
    sonnetWeeklyPercentage: usage.sonnetWeeklyPercentage,
    triggeringResetTime: new Date().toISOString(),
  });

  const history = await loadHistory(profileId);
  history.snapshots.push(snapshot);
  pruneSnapshots(history, weeklySnapshots, MAX_WEEKLY_SNAPSHOTS);
  await saveHistory(profileId, history);
  lastWeeklyRecordTimes.set(profileId, now);
}

export async function clearHistory(profileId: string, resetType?: string): Promise<void> {
  const history = await loadHistory(profileId);
  if (resetType) {
    history.snapshots = history.snapshots.filter((s) => s.resetType !== resetType);
  } else {
    history.snapshots = [];
  }
  await saveHistory(profileId, history);
}

export async function deleteHistory(profileId: string): Promise<void> {
  await saveHistory(profileId, emptyHistory());
}
