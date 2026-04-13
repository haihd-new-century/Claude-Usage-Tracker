import { create } from "zustand";
import type { ClaudeUsage, APIUsage } from "@/models/usage";
import type { ClaudeStatus } from "@/models/status";
import { emptyUsage } from "@/models/usage";
import { unknownStatus } from "@/models/status";
import { fetchUsageData, fetchClaudeStatus } from "@/services/claudeApi";
import { useProfileStore } from "./profileStore";

interface UsageState {
  usage: ClaudeUsage;
  apiUsage: APIUsage | null;
  status: ClaudeStatus;
  isRefreshing: boolean;
  lastError: string | null;
  consecutiveFailures: number;

  refresh: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  usage: emptyUsage(),
  apiUsage: null,
  status: unknownStatus,
  isRefreshing: false,
  lastError: null,
  consecutiveFailures: 0,

  refresh: async () => {
    if (get().isRefreshing) return;
    set({ isRefreshing: true });

    const profile = useProfileStore.getState().activeProfile;
    if (!profile) {
      set({ isRefreshing: false, lastError: "No active profile" });
      return;
    }

    try {
      let auth: { type: "claudeSession"; sessionKey: string } | { type: "cliOAuth"; accessToken: string };

      if (profile.claudeSessionKey && profile.organizationId) {
        auth = { type: "claudeSession", sessionKey: profile.claudeSessionKey };
      } else if (profile.cliCredentialsJSON) {
        const creds = JSON.parse(profile.cliCredentialsJSON);
        const token = creds?.claudeAiOauth?.accessToken;
        if (token) {
          auth = { type: "cliOAuth", accessToken: token };
        } else {
          throw new Error("No valid credentials");
        }
      } else {
        throw new Error("No credentials configured");
      }

      const orgId = profile.organizationId ?? "";
      const usage = await fetchUsageData(auth, orgId);

      set({
        usage,
        isRefreshing: false,
        lastError: null,
        consecutiveFailures: 0,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set((s) => ({
        isRefreshing: false,
        lastError: msg,
        consecutiveFailures: s.consecutiveFailures + 1,
      }));
    }
  },

  refreshStatus: async () => {
    try {
      const result = await fetchClaudeStatus();
      set({
        status: {
          indicator: result.indicator as ClaudeStatus["indicator"],
          description: result.description,
        },
      });
    } catch {
      set({ status: unknownStatus });
    }
  },
}));
