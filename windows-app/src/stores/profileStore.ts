import { create } from "zustand";
import type { Profile, ProfileDisplayMode } from "@/models/profile";
import { createDefaultProfile } from "@/models/profile";
import { getRandomName } from "@/utils/funnyNameGenerator";
import { getAppDataDir, readFile, writeFile, fileExists } from "@/services/tauriBridge";

interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  displayMode: ProfileDisplayMode;

  loadProfiles: () => Promise<void>;
  saveProfiles: () => Promise<void>;
  setActiveProfile: (id: string) => void;
  addProfile: () => void;
  deleteProfile: (id: string) => void;
  updateProfile: (id: string, patch: Partial<Profile>) => void;
  setDisplayMode: (mode: ProfileDisplayMode) => void;
}

async function profilesFilePath(): Promise<string> {
  const dir = await getAppDataDir();
  return `${dir}\\profiles.json`;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,
  displayMode: "single",

  loadProfiles: async () => {
    try {
      const path = await profilesFilePath();
      const exists = await fileExists(path);
      if (exists) {
        const raw = await readFile(path);
        const data = JSON.parse(raw) as {
          profiles: Profile[];
          activeProfileId: string | null;
          displayMode: ProfileDisplayMode;
        };
        const profiles = data.profiles ?? [];
        const activeId = data.activeProfileId;
        const active = profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null;
        set({
          profiles,
          activeProfile: active,
          displayMode: data.displayMode ?? "single",
        });
        return;
      }
    } catch {
      // File doesn't exist or is invalid — create default
    }

    const defaultProfile = createDefaultProfile(getRandomName([]));
    set({
      profiles: [defaultProfile],
      activeProfile: defaultProfile,
      displayMode: "single",
    });
    await get().saveProfiles();
  },

  saveProfiles: async () => {
    const { profiles, activeProfile, displayMode } = get();
    const data = {
      profiles,
      activeProfileId: activeProfile?.id ?? null,
      displayMode,
    };
    const path = await profilesFilePath();
    await writeFile(path, JSON.stringify(data, null, 2));
  },

  setActiveProfile: (id: string) => {
    const profile = get().profiles.find((p) => p.id === id) ?? null;
    set({ activeProfile: profile });
    get().saveProfiles();
  },

  addProfile: () => {
    const existing = get().profiles.map((p) => p.name);
    const name = getRandomName(existing);
    const profile = createDefaultProfile(name);
    set((s) => ({ profiles: [...s.profiles, profile] }));
    get().saveProfiles();
  },

  deleteProfile: (id: string) => {
    const { profiles, activeProfile } = get();
    if (profiles.length <= 1) return; // Must have at least 1
    const filtered = profiles.filter((p) => p.id !== id);
    const newActive = activeProfile?.id === id ? filtered[0] ?? null : activeProfile;
    set({ profiles: filtered, activeProfile: newActive });
    get().saveProfiles();
  },

  updateProfile: (id: string, patch: Partial<Profile>) => {
    set((s) => {
      const profiles = s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p));
      const activeProfile =
        s.activeProfile?.id === id
          ? { ...s.activeProfile, ...patch }
          : s.activeProfile;
      return { profiles, activeProfile };
    });
    get().saveProfiles();
  },

  setDisplayMode: (mode: ProfileDisplayMode) => {
    set({ displayMode: mode });
    get().saveProfiles();
  },
}));
