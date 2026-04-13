import { describe, it, expect } from "vitest";
import { calculateStatus, getDisplayPercentage, usageBarColor, statusColor } from "./usageCalculator";
import { UsageStatusLevel } from "@/models/usage";

describe("UsageStatusCalculator", () => {
  // ─── Used-Based Thresholds (showRemaining = false) ─────────────────────

  describe("used-based thresholds", () => {
    it("returns Safe for 0-49% used", () => {
      expect(calculateStatus(0, false)).toBe(UsageStatusLevel.Safe);
      expect(calculateStatus(25, false)).toBe(UsageStatusLevel.Safe);
      expect(calculateStatus(49, false)).toBe(UsageStatusLevel.Safe);
    });

    it("returns Moderate for 50-79% used", () => {
      expect(calculateStatus(50, false)).toBe(UsageStatusLevel.Moderate);
      expect(calculateStatus(65, false)).toBe(UsageStatusLevel.Moderate);
      expect(calculateStatus(79, false)).toBe(UsageStatusLevel.Moderate);
    });

    it("returns Critical for 80-100% used", () => {
      expect(calculateStatus(80, false)).toBe(UsageStatusLevel.Critical);
      expect(calculateStatus(95, false)).toBe(UsageStatusLevel.Critical);
      expect(calculateStatus(100, false)).toBe(UsageStatusLevel.Critical);
    });

    it("handles exact boundary values", () => {
      expect(calculateStatus(49.9, false)).toBe(UsageStatusLevel.Safe);
      expect(calculateStatus(50.0, false)).toBe(UsageStatusLevel.Moderate);
      expect(calculateStatus(79.9, false)).toBe(UsageStatusLevel.Moderate);
      expect(calculateStatus(80.0, false)).toBe(UsageStatusLevel.Critical);
    });
  });

  // ─── Remaining-Based Thresholds (showRemaining = true) ─────────────────

  describe("remaining-based thresholds", () => {
    it("returns Safe for >20% remaining", () => {
      expect(calculateStatus(0, true)).toBe(UsageStatusLevel.Safe);
      expect(calculateStatus(50, true)).toBe(UsageStatusLevel.Safe);
      expect(calculateStatus(79, true)).toBe(UsageStatusLevel.Safe);
    });

    it("returns Moderate for 10-19% remaining", () => {
      expect(calculateStatus(81, true)).toBe(UsageStatusLevel.Moderate);
      expect(calculateStatus(85, true)).toBe(UsageStatusLevel.Moderate);
      expect(calculateStatus(90, true)).toBe(UsageStatusLevel.Moderate);
    });

    it("returns Critical for <10% remaining", () => {
      expect(calculateStatus(91, true)).toBe(UsageStatusLevel.Critical);
      expect(calculateStatus(95, true)).toBe(UsageStatusLevel.Critical);
      expect(calculateStatus(100, true)).toBe(UsageStatusLevel.Critical);
    });

    it("handles exact boundary values", () => {
      // 20% remaining (80% used) = safe
      expect(calculateStatus(80, true)).toBe(UsageStatusLevel.Safe);
      // 19% remaining (81% used) = moderate
      expect(calculateStatus(81, true)).toBe(UsageStatusLevel.Moderate);
      // 10% remaining (90% used) = moderate
      expect(calculateStatus(90, true)).toBe(UsageStatusLevel.Moderate);
      // 9% remaining (91% used) = critical
      expect(calculateStatus(91, true)).toBe(UsageStatusLevel.Critical);
    });
  });

  // ─── Display Percentage ────────────────────────────────────────────────

  describe("getDisplayPercentage", () => {
    it("returns used value in used mode", () => {
      expect(getDisplayPercentage(65, false)).toBe(65.0);
      expect(getDisplayPercentage(0, false)).toBe(0.0);
      expect(getDisplayPercentage(100, false)).toBe(100.0);
    });

    it("returns remaining value in remaining mode", () => {
      expect(getDisplayPercentage(65, true)).toBe(35.0);
      expect(getDisplayPercentage(0, true)).toBe(100.0);
      expect(getDisplayPercentage(100, true)).toBe(0.0);
    });

    it("handles negative percentage", () => {
      expect(getDisplayPercentage(-10, true)).toBe(110.0);
    });

    it("handles over 100%", () => {
      expect(getDisplayPercentage(110, true)).toBe(0.0);
    });
  });

  // ─── Bar Color ─────────────────────────────────────────────────────────

  describe("usageBarColor", () => {
    it("returns green for low usage", () => {
      expect(usageBarColor(5)).toBe("#166534");
      expect(usageBarColor(15)).toBe("#15803d");
    });

    it("returns yellow for moderate usage", () => {
      expect(usageBarColor(55)).toBe("#eab308");
    });

    it("returns red for high usage", () => {
      expect(usageBarColor(85)).toBe("#dc2626");
      expect(usageBarColor(95)).toBe("#991b1b");
    });
  });

  // ─── Status Color ─────────────────────────────────────────────────────

  describe("statusColor", () => {
    it("maps Safe to green", () => {
      expect(statusColor(UsageStatusLevel.Safe)).toBe("#22c55e");
    });

    it("maps Moderate to orange", () => {
      expect(statusColor(UsageStatusLevel.Moderate)).toBe("#f97316");
    });

    it("maps Critical to red", () => {
      expect(statusColor(UsageStatusLevel.Critical)).toBe("#ef4444");
    });
  });
});
