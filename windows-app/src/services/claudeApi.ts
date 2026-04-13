import type { ClaudeUsage, APIUsage, APIOrganization } from "@/models/usage";
import { URLBuilder } from "@/utils/urlBuilder";
import { SessionKeyValidator } from "@/utils/sessionKeyValidator";

// ─── Auth Types ─────────────────────────────────────────────────────────────

type AuthType =
  | { type: "claudeSession"; sessionKey: string }
  | { type: "cliOAuth"; accessToken: string }
  | { type: "consoleSession"; sessionKey: string };

// ─── Error ──────────────────────────────────────────────────────────────────

export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ClaudeAPIError";
  }
}

// ─── Service ────────────────────────────────────────────────────────────────

const validator = new SessionKeyValidator();

function buildHeaders(auth: AuthType): HeadersInit {
  switch (auth.type) {
    case "claudeSession":
      return {
        Cookie: `sessionKey=${auth.sessionKey}`,
        Accept: "application/json",
      };
    case "cliOAuth":
      return {
        Authorization: `Bearer ${auth.accessToken}`,
        "anthropic-beta": "rate-limit-headers",
        Accept: "application/json",
      };
    case "consoleSession":
      return {
        Cookie: `sessionKey=${auth.sessionKey}`,
        Accept: "application/json",
      };
  }
}

/** Fetch organization ID from a Claude.ai session key */
export async function fetchOrganizationId(sessionKey: string): Promise<string> {
  const validated = validator.validate(sessionKey);
  const url = URLBuilder.claudeAPI("organizations").build();

  const res = await fetch(url, {
    headers: buildHeaders({ type: "claudeSession", sessionKey: validated }),
  });

  if (!res.ok) {
    throw new ClaudeAPIError(`Failed to fetch organizations: ${res.status}`, res.status);
  }

  const data: Array<{ uuid: string; name: string }> = await res.json();
  if (!data.length) {
    throw new ClaudeAPIError("No organizations found");
  }
  return data[0]!.uuid;
}

/** Fetch usage data from Claude.ai */
export async function fetchUsageData(
  auth: AuthType,
  organizationId: string,
): Promise<ClaudeUsage> {
  const url = URLBuilder.claudeAPI(`organizations/${organizationId}/usage`).build();

  const res = await fetch(url, { headers: buildHeaders(auth) });
  if (!res.ok) {
    throw new ClaudeAPIError(`Failed to fetch usage: ${res.status}`, res.status);
  }

  const json = await res.json();
  const now = new Date().toISOString();

  // Parse five_hour
  const fiveHour = json.five_hour ?? {};
  const sevenDay = json.seven_day ?? {};
  const sevenDayOpus = json.seven_day_opus ?? {};
  const sonnet = json.seven_day_sonnet ?? {};
  const extra = json.extra_usage ?? {};

  return {
    sessionTokensUsed: fiveHour.utilization ?? 0,
    sessionLimit: 100,
    sessionPercentage: fiveHour.utilization_pct ?? fiveHour.utilization ?? 0,
    sessionResetTime: fiveHour.resets_at ?? new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    weeklyTokensUsed: sevenDay.utilization ?? 0,
    weeklyLimit: 1_000_000,
    weeklyPercentage: sevenDay.utilization_pct ?? sevenDay.utilization ?? 0,
    weeklyResetTime: sevenDay.resets_at ?? now,
    opusWeeklyTokensUsed: sevenDayOpus.utilization ?? 0,
    opusWeeklyPercentage: sevenDayOpus.utilization_pct ?? sevenDayOpus.utilization ?? 0,
    sonnetWeeklyTokensUsed: sonnet.utilization ?? 0,
    sonnetWeeklyPercentage: sonnet.utilization_pct ?? sonnet.utilization ?? 0,
    sonnetWeeklyResetTime: sonnet.resets_at ?? null,
    costUsed: extra.current_spending ?? null,
    costLimit: extra.budget_limit ?? null,
    costCurrency: extra.currency ?? null,
    overageBalance: extra.overage_balance ?? null,
    overageBalanceCurrency: extra.overage_currency ?? null,
    lastUpdated: now,
  };
}

/** Fetch console API usage */
export async function fetchConsoleOrganizations(
  apiSessionKey: string,
): Promise<APIOrganization[]> {
  const url = URLBuilder.consoleAPI("organizations").build();

  const res = await fetch(url, {
    headers: buildHeaders({ type: "consoleSession", sessionKey: apiSessionKey }),
  });

  if (!res.ok) {
    throw new ClaudeAPIError(`Failed to fetch console orgs: ${res.status}`, res.status);
  }

  const json = await res.json();
  const orgs: Array<{ id: string; name: string }> = json.data ?? json;
  return orgs.map((o) => ({ id: o.id, name: o.name }));
}

/** Fetch API console usage data */
export async function fetchAPIUsageData(
  organizationId: string,
  apiSessionKey: string,
): Promise<APIUsage> {
  const url = URLBuilder.consoleAPI(`organizations/${organizationId}/usage`).build();

  const res = await fetch(url, {
    headers: buildHeaders({ type: "consoleSession", sessionKey: apiSessionKey }),
  });

  if (!res.ok) {
    throw new ClaudeAPIError(`Failed to fetch API usage: ${res.status}`, res.status);
  }

  const json = await res.json();
  return {
    currentSpendCents: json.current_spend_cents ?? 0,
    resetsAt: json.resets_at ?? new Date().toISOString(),
    prepaidCreditsCents: json.prepaid_credits_cents ?? 0,
    currency: json.currency ?? "USD",
    apiTokenCostCents: json.api_token_cost_cents ?? null,
    apiCostByModel: json.api_cost_by_model ?? null,
    costBySource: json.cost_by_source ?? null,
    dailyCostCents: json.daily_cost_cents ?? null,
  };
}

/** Send initialization message (auto-start session) */
export async function sendInitializationMessage(
  auth: AuthType,
  organizationId: string,
): Promise<void> {
  const url = URLBuilder.claudeAPI(`organizations/${organizationId}/chat_conversations`).build();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...buildHeaders(auth),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "" }),
  });

  if (!res.ok) {
    throw new ClaudeAPIError(`Failed to initialize session: ${res.status}`, res.status);
  }
}

/** Fetch Claude system status */
export async function fetchClaudeStatus(): Promise<{
  indicator: string;
  description: string;
}> {
  try {
    const url = URLBuilder.claudeStatus("status.json").build();
    const res = await fetch(url);
    if (!res.ok) return { indicator: "unknown", description: "Status Unknown" };
    const json = await res.json();
    return {
      indicator: json.status?.indicator ?? "unknown",
      description: json.status?.description ?? "Status Unknown",
    };
  } catch {
    return { indicator: "unknown", description: "Status Unknown" };
  }
}
