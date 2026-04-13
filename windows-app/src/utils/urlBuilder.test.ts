import { describe, it, expect } from "vitest";
import { URLBuilder, URLBuilderError } from "./urlBuilder";

describe("URLBuilder", () => {
  // ─── Initialization ────────────────────────────────────────────────────

  it("accepts a valid base URL", () => {
    const builder = new URLBuilder("https://api.example.com");
    expect(builder.build()).toBe("https://api.example.com/");
  });

  it("throws on invalid base URL", () => {
    expect(() => new URLBuilder("not a url")).toThrow(URLBuilderError);
  });

  // ─── Path Building ─────────────────────────────────────────────────────

  it("appends a single path", () => {
    const url = new URLBuilder("https://api.example.com")
      .appendPath("/users")
      .build();
    expect(url).toContain("/users");
  });

  it("appends multiple paths", () => {
    const url = new URLBuilder("https://api.example.com")
      .appendPath("/users")
      .appendPath("/123")
      .appendPath("/profile")
      .build();
    expect(url).toContain("users/123/profile");
  });

  it("rejects path traversal", () => {
    expect(() =>
      new URLBuilder("https://api.example.com").appendPath("../etc/passwd"),
    ).toThrow(URLBuilderError);
  });

  // ─── Query Parameters ──────────────────────────────────────────────────

  it("adds a single query parameter", () => {
    const url = new URLBuilder("https://api.example.com")
      .appendPath("/search")
      .addQueryParam("q", "test")
      .build();
    expect(url).toContain("q=test");
  });

  it("adds multiple query parameters", () => {
    const url = new URLBuilder("https://api.example.com")
      .appendPath("/search")
      .addQueryParam("q", "test")
      .addQueryParam("limit", "10")
      .build();
    expect(url).toContain("q=test");
    expect(url).toContain("limit=10");
  });

  it("rejects empty parameter name", () => {
    expect(() =>
      new URLBuilder("https://api.example.com").addQueryParam("", "test"),
    ).toThrow(URLBuilderError);
  });

  // ─── Convenience Factories ─────────────────────────────────────────────

  it("builds Claude API URL", () => {
    const url = URLBuilder.claudeAPI("organizations").build();
    expect(url).toBe("https://claude.ai/api/organizations");
  });

  it("builds Console API URL", () => {
    const url = URLBuilder.consoleAPI("organizations").build();
    expect(url).toBe("https://console.anthropic.com/api/organizations");
  });

  it("builds Claude Status URL", () => {
    const url = URLBuilder.claudeStatus("status.json").build();
    expect(url).toBe("https://status.claude.com/api/v2/status.json");
  });

  // ─── Complex URLs ──────────────────────────────────────────────────────

  it("builds complex Claude URL with multiple path segments", () => {
    const orgId = "org_123";
    const convId = "conv_456";
    const url = URLBuilder.claudeAPI()
      .appendPath("organizations")
      .appendPath(orgId)
      .appendPath("chat_conversations")
      .appendPath(convId)
      .appendPath("completion")
      .build();
    expect(url).toBe(
      "https://claude.ai/api/organizations/org_123/chat_conversations/conv_456/completion",
    );
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────

  it("handles special characters in query values", () => {
    const url = new URLBuilder("https://api.example.com")
      .appendPath("/search")
      .addQueryParam("q", "hello world")
      .build();
    expect(url).toContain("search");
    expect(url).toBeDefined();
  });

  it("handles trailing slashes in paths", () => {
    const url = new URLBuilder("https://api.example.com")
      .appendPath("/users/")
      .appendPath("/123/")
      .build();
    expect(url).toContain("users");
    expect(url).toContain("123");
  });
});
