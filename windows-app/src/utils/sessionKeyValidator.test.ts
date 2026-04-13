import { describe, it, expect, beforeEach } from "vitest";
import { SessionKeyValidator, SessionKeyValidationError } from "./sessionKeyValidator";

describe("SessionKeyValidator", () => {
  let validator: SessionKeyValidator;

  beforeEach(() => {
    validator = new SessionKeyValidator();
  });

  // ─── Valid Keys ──────────────────────────────────────────────────────────

  it("accepts a valid session key", () => {
    const key = "sk-ant-sid01-abcdefghijklmnopqrstuvwxyz1234567890";
    expect(() => validator.validate(key)).not.toThrow();
    expect(validator.isValid(key)).toBe(true);
  });

  it("accepts a valid key with underscores", () => {
    const key = "sk-ant-sid01_abcdefghijklmnopqrstuvwxyz_1234567890";
    expect(() => validator.validate(key)).not.toThrow();
  });

  it("accepts a valid key with hyphens", () => {
    const key = "sk-ant-sid01-abcd-efgh-ijkl-mnop-qrst";
    expect(() => validator.validate(key)).not.toThrow();
  });

  // ─── Empty / Whitespace ─────────────────────────────────────────────────

  it("rejects empty string", () => {
    expect(() => validator.validate("")).toThrow(SessionKeyValidationError);
  });

  it("rejects whitespace-only string", () => {
    expect(() => validator.validate("   ")).toThrow(SessionKeyValidationError);
  });

  it("trims leading and trailing whitespace", () => {
    const key = "  sk-ant-sid01-abcdefghijklmnopqrstuvwxyz  ";
    const result = validator.validate(key);
    expect(result).not.toMatch(/^\s/);
    expect(result).not.toMatch(/\s$/);
  });

  // ─── Prefix Tests ───────────────────────────────────────────────────────

  it("rejects invalid prefix", () => {
    expect(() =>
      validator.validate("invalid-prefix-abcdefghijklmnopqrstuvwxyz"),
    ).toThrow(SessionKeyValidationError);
  });

  it("rejects missing prefix", () => {
    expect(() =>
      validator.validate("abcdefghijklmnopqrstuvwxyz1234567890"),
    ).toThrow(SessionKeyValidationError);
  });

  it("rejects mixed-case prefix", () => {
    expect(() =>
      validator.validate("SK-ANT-sid01-abcdefghijklmnopqrstuvwxyz"),
    ).toThrow(SessionKeyValidationError);
  });

  // ─── Length Tests ───────────────────────────────────────────────────────

  it("rejects too-short keys", () => {
    expect(() => validator.validate("sk-ant-abc")).toThrow(SessionKeyValidationError);
  });

  it("rejects too-long keys", () => {
    const key = "sk-ant-" + "a".repeat(1000);
    expect(() => validator.validate(key)).toThrow(SessionKeyValidationError);
  });

  // ─── Character Tests ────────────────────────────────────────────────────

  it("rejects invalid characters", () => {
    expect(() =>
      validator.validate("sk-ant-sid01-hello@world!#$%"),
    ).toThrow(SessionKeyValidationError);
  });

  it("rejects internal whitespace", () => {
    expect(() =>
      validator.validate("sk-ant-sid01 abcd efgh"),
    ).toThrow(SessionKeyValidationError);
  });

  it("rejects unicode characters", () => {
    expect(() =>
      validator.validate("sk-ant-sid01-héllo-wörld"),
    ).toThrow(SessionKeyValidationError);
  });

  // ─── Security Tests ─────────────────────────────────────────────────────

  it("rejects null bytes", () => {
    expect(() =>
      validator.validate("sk-ant-sid01-abc\0def"),
    ).toThrow(SessionKeyValidationError);
  });

  it("rejects path traversal", () => {
    expect(() =>
      validator.validate("sk-ant-sid01-../etc/passwd"),
    ).toThrow(SessionKeyValidationError);
  });

  it("rejects script injection", () => {
    expect(() =>
      validator.validate("sk-ant-sid01-<script>alert('xss')</script>"),
    ).toThrow();
  });

  // ─── Format Tests ───────────────────────────────────────────────────────

  it("accepts valid format with separators", () => {
    const key = "sk-ant-sid01-abc-def-ghi-jkl";
    expect(() => validator.validate(key)).not.toThrow();
  });

  it("rejects no separators after prefix", () => {
    expect(() =>
      validator.validate("sk-ant-abcdefghijklmnopqrstuvwxyz"),
    ).toThrow(SessionKeyValidationError);
  });

  // ─── Validation Status ──────────────────────────────────────────────────

  it("returns valid status for good key", () => {
    const key = "sk-ant-sid01-abcdefghijklmnopqrstuvwxyz";
    const status = validator.validationStatus(key);
    expect(status.isValid).toBe(true);
    expect(status.errorMessage).toBeUndefined();
  });

  it("returns invalid status with error message", () => {
    const status = validator.validationStatus("invalid-key");
    expect(status.isValid).toBe(false);
    expect(status.errorMessage).toBeDefined();
  });

  // ─── Real-World Scenarios ───────────────────────────────────────────────

  it("handles typical user copy-paste with whitespace", () => {
    const key = "  sk-ant-sid01-abcdefghijklmnopqrstuvwxyz1234567890-ABCDEFG  ";
    expect(() => validator.validate(key)).not.toThrow();
  });

  it("rejects typical user mistakes", () => {
    const mistakes = [
      "sk-ant",
      "sk ant sid01 abcd",
      "sessionKey=sk-ant-sid01-abcd",
    ];
    for (const key of mistakes) {
      expect(validator.isValid(key)).toBe(false);
    }
  });

  // ─── Relaxed Config ─────────────────────────────────────────────────────

  it("accepts shorter keys with relaxed config", () => {
    const relaxed = new SessionKeyValidator({ minLength: 10, strictMode: false });
    expect(() => relaxed.validate("sk-ant-s-hort")).not.toThrow();
  });
});
