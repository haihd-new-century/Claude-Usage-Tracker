import { describe, it, expect } from "vitest";
import {
  createSnapshot,
  snapshotFromSessionReset,
  snapshotFromWeeklyReset,
  snapshotFromBillingReset,
  emptyHistory,
  sessionSnapshots,
  weeklySnapshots,
  billingSnapshots,
  exportToJSON,
  exportToCSV,
} from "./usageHistory";
import type { ClaudeUsage, APIUsage } from "./usage";
import { emptyUsage } from "./usage";

describe("UsageHistory", () => {
  describe("createSnapshot", () => {
    it("creates a snapshot with defaults", () => {
      const snap = createSnapshot("sessionReset", {});
      expect(snap.id).toBeTruthy();
      expect(snap.resetType).toBe("sessionReset");
      expect(snap.sessionTokensUsed).toBeNull();
    });

    it("merges provided fields", () => {
      const snap = createSnapshot("weeklyReset", {
        weeklyPercentage: 42.5,
        weeklyTokensUsed: 500000,
      });
      expect(snap.weeklyPercentage).toBe(42.5);
      expect(snap.weeklyTokensUsed).toBe(500000);
    });
  });

  describe("snapshotFromSessionReset", () => {
    it("captures session data from ClaudeUsage", () => {
      const usage: ClaudeUsage = {
        ...emptyUsage(),
        sessionTokensUsed: 1000,
        sessionPercentage: 75.5,
      };
      const snap = snapshotFromSessionReset(usage, "2026-01-01T00:00:00Z");
      expect(snap.resetType).toBe("sessionReset");
      expect(snap.sessionTokensUsed).toBe(1000);
      expect(snap.sessionPercentage).toBe(75.5);
      expect(snap.triggeringResetTime).toBe("2026-01-01T00:00:00Z");
    });
  });

  describe("snapshotFromWeeklyReset", () => {
    it("captures weekly data from ClaudeUsage", () => {
      const usage: ClaudeUsage = {
        ...emptyUsage(),
        weeklyTokensUsed: 500000,
        weeklyPercentage: 50,
        opusWeeklyTokensUsed: 200000,
        opusWeeklyPercentage: 20,
      };
      const snap = snapshotFromWeeklyReset(usage, "2026-01-07T00:00:00Z");
      expect(snap.resetType).toBe("weeklyReset");
      expect(snap.weeklyTokensUsed).toBe(500000);
      expect(snap.opusWeeklyTokensUsed).toBe(200000);
    });
  });

  describe("snapshotFromBillingReset", () => {
    it("captures billing data from APIUsage", () => {
      const usage: APIUsage = {
        currentSpendCents: 5000,
        resetsAt: "2026-02-01T00:00:00Z",
        prepaidCreditsCents: 10000,
        currency: "USD",
        apiTokenCostCents: null,
        apiCostByModel: null,
        costBySource: null,
        dailyCostCents: null,
      };
      const snap = snapshotFromBillingReset(usage, "2026-02-01T00:00:00Z");
      expect(snap.resetType).toBe("billingCycle");
      expect(snap.apiSpendCents).toBe(5000);
      expect(snap.apiCurrency).toBe("USD");
    });
  });

  describe("filtering", () => {
    it("filters snapshots by reset type", () => {
      const history = emptyHistory();
      const now = new Date().toISOString();
      history.snapshots.push(
        createSnapshot("sessionReset", { sessionPercentage: 50, triggeringResetTime: now }),
        createSnapshot("weeklyReset", { weeklyPercentage: 30, triggeringResetTime: now }),
        createSnapshot("sessionReset", { sessionPercentage: 75, triggeringResetTime: now }),
        createSnapshot("billingCycle", { apiSpendCents: 1000, triggeringResetTime: now }),
      );

      expect(sessionSnapshots(history)).toHaveLength(2);
      expect(weeklySnapshots(history)).toHaveLength(1);
      expect(billingSnapshots(history)).toHaveLength(1);
    });

    it("returns empty for no matching type", () => {
      const history = emptyHistory();
      expect(sessionSnapshots(history)).toHaveLength(0);
    });
  });

  describe("export", () => {
    it("exports to JSON", () => {
      const history = emptyHistory();
      const now = new Date().toISOString();
      history.snapshots.push(
        createSnapshot("sessionReset", { sessionPercentage: 50, triggeringResetTime: now }),
      );
      const json = exportToJSON(history);
      const parsed = JSON.parse(json);
      expect(parsed.snapshots).toHaveLength(1);
    });

    it("exports to CSV with header", () => {
      const history = emptyHistory();
      const now = new Date().toISOString();
      history.snapshots.push(
        createSnapshot("sessionReset", { sessionPercentage: 50, triggeringResetTime: now }),
      );
      const csv = exportToCSV(history);
      expect(csv).toContain("Timestamp,Reset Type");
      expect(csv).toContain("sessionReset");
    });

    it("filters export by reset type", () => {
      const history = emptyHistory();
      const now = new Date().toISOString();
      history.snapshots.push(
        createSnapshot("sessionReset", { sessionPercentage: 50, triggeringResetTime: now }),
        createSnapshot("weeklyReset", { weeklyPercentage: 30, triggeringResetTime: now }),
      );
      const json = exportToJSON(history, "sessionReset");
      const parsed = JSON.parse(json);
      expect(parsed.snapshots).toHaveLength(1);
      expect(parsed.snapshots[0].resetType).toBe("sessionReset");
    });
  });
});
