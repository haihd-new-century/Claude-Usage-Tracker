import { describe, it, expect } from "vitest";
import { formatPercentage } from "./formatter";

describe("Formatter", () => {
  describe("formatPercentage", () => {
    it("formats whole numbers without decimal", () => {
      expect(formatPercentage(50)).toBe("50%");
      expect(formatPercentage(0)).toBe("0%");
      expect(formatPercentage(100)).toBe("100%");
    });

    it("rounds fractional percentages >= 1 to whole numbers", () => {
      expect(formatPercentage(33.3)).toBe("33%");
      expect(formatPercentage(99.9)).toBe("100%");
      expect(formatPercentage(66.7)).toBe("67%");
    });

    it("handles very small percentages", () => {
      expect(formatPercentage(0.1)).toBe("0.1%");
    });
  });
});
