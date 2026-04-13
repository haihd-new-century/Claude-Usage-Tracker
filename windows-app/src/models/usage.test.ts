import { describe, it, expect } from "vitest";
import {
  effectiveSessionPercentage,
  remainingPercentage,
  emptyUsage,
  apiUsageAmount,
  apiRemainingAmount,
  apiTotalCredits,
  apiUsagePercentage,
  formatCents,
  detectCostSourceType,
  APICostSourceType,
} from "./usage";

describe("ClaudeUsage", () => {
  describe("effectiveSessionPercentage", () => {
    it("returns 0 when session has expired", () => {
      const usage = {
        ...emptyUsage(),
        sessionPercentage: 75,
        sessionResetTime: new Date(Date.now() - 60_000).toISOString(), // 1 min ago
      };
      expect(effectiveSessionPercentage(usage)).toBe(0);
    });

    it("returns actual percentage when session is active", () => {
      const usage = {
        ...emptyUsage(),
        sessionPercentage: 75,
        sessionResetTime: new Date(Date.now() + 3600_000).toISOString(), // 1 hr from now
      };
      expect(effectiveSessionPercentage(usage)).toBe(75);
    });
  });

  describe("remainingPercentage", () => {
    it("returns 100 - used when session is active", () => {
      const usage = {
        ...emptyUsage(),
        sessionPercentage: 30,
        sessionResetTime: new Date(Date.now() + 3600_000).toISOString(),
      };
      expect(remainingPercentage(usage)).toBe(70);
    });

    it("returns 100 when session has expired", () => {
      const usage = {
        ...emptyUsage(),
        sessionPercentage: 75,
        sessionResetTime: new Date(Date.now() - 60_000).toISOString(),
      };
      expect(remainingPercentage(usage)).toBe(100);
    });
  });

  describe("emptyUsage", () => {
    it("returns zero values", () => {
      const usage = emptyUsage();
      expect(usage.sessionPercentage).toBe(0);
      expect(usage.weeklyPercentage).toBe(0);
      expect(usage.costUsed).toBeNull();
    });
  });
});

describe("APIUsage", () => {
  const apiUsage = {
    currentSpendCents: 5000,
    resetsAt: new Date().toISOString(),
    prepaidCreditsCents: 15000,
    currency: "USD",
    apiTokenCostCents: null,
    apiCostByModel: null,
    costBySource: null,
    dailyCostCents: null,
  };

  it("calculates usage amount", () => {
    expect(apiUsageAmount(apiUsage)).toBe(50);
  });

  it("calculates remaining amount", () => {
    expect(apiRemainingAmount(apiUsage)).toBe(150);
  });

  it("calculates total credits", () => {
    expect(apiTotalCredits(apiUsage)).toBe(200);
  });

  it("calculates usage percentage", () => {
    expect(apiUsagePercentage(apiUsage)).toBe(25);
  });

  it("returns 0% when no credits", () => {
    const empty = { ...apiUsage, currentSpendCents: 0, prepaidCreditsCents: 0 };
    expect(apiUsagePercentage(empty)).toBe(0);
  });
});

describe("formatCents", () => {
  it("formats cents to currency string", () => {
    const result = formatCents(5000, "USD");
    expect(result).toContain("50");
  });
});

describe("detectCostSourceType", () => {
  it("detects CLI sources", () => {
    expect(detectCostSourceType("claude code")).toBe(APICostSourceType.CLI);
    expect(detectCostSourceType("Claude-Code key")).toBe(APICostSourceType.CLI);
    expect(detectCostSourceType("CLI token")).toBe(APICostSourceType.CLI);
  });

  it("detects API sources", () => {
    expect(detectCostSourceType("my-api-key")).toBe(APICostSourceType.API);
    expect(detectCostSourceType("prod-server")).toBe(APICostSourceType.API);
  });

  it("returns Unknown for unrecognized", () => {
    expect(detectCostSourceType("random-name")).toBe(APICostSourceType.Unknown);
  });
});
