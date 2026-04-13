import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/profileStore";
import type { Profile } from "@/models/profile";
import { hasClaudeAI, hasAPIConsole } from "@/models/profile";

export function ProfilesTab() {
  const { t } = useTranslation();
  const { profiles, activeProfile, addProfile, deleteProfile, updateProfile, setActiveProfile } = useProfileStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleRename = (profile: Profile) => {
    setRenamingId(profile.id);
    setRenameValue(profile.name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      updateProfile(renamingId, { name: renameValue.trim() });
    }
    setRenamingId(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("profiles.title")}</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("profiles.subtitle")}
      </p>

      {/* About profiles */}
      <div style={infoBox}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>{t("profiles.about_title")}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <div>{t("profiles.about_description")}</div>
          <div>• {t("profiles.about_credentials")}</div>
          <div>• {t("profiles.about_api")}</div>
          <div>• {t("profiles.about_cli")}</div>
          <div>• {t("profiles.about_appearance")}</div>
          <div>• {t("profiles.about_notifications")}</div>
          <div>• {t("profiles.about_refresh")}</div>
        </div>
      </div>

      {/* Profile list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfile?.id;
          const isRenaming = profile.id === renamingId;

          return (
            <div
              key={profile.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: isActive ? "var(--bg-card)" : "var(--bg-secondary)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {isRenaming ? (
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => e.key === "Enter" && commitRename()}
                      autoFocus
                      style={{
                        fontSize: 13, fontWeight: 600, padding: "2px 6px",
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{profile.name}</span>
                  )}
                  {isActive && (
                    <span style={{
                      fontSize: 10, padding: "1px 6px",
                      background: "var(--accent)", color: "#fff",
                      borderRadius: "var(--radius-sm)", fontWeight: 600,
                    }}>
                      {t("profiles.active_badge")}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, display: "flex", gap: 8 }}>
                  {hasClaudeAI(profile) && <span>Claude.ai</span>}
                  {hasAPIConsole(profile) && <span>API Console</span>}
                  {profile.hasCliAccount && <span>CLI</span>}
                  {!hasClaudeAI(profile) && !hasAPIConsole(profile) && !profile.hasCliAccount && (
                    <span>{t("common.not_connected")}</span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 4 }}>
                {!isActive && (
                  <button onClick={() => setActiveProfile(profile.id)} style={iconBtn} title={t("profiles.activate")}>
                    &#x2713;
                  </button>
                )}
                <button onClick={() => handleRename(profile)} style={iconBtn} title={t("profiles.rename")}>
                  &#x270E;
                </button>
                {profiles.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(t("profiles.delete_confirm", { value0: profile.name }))) {
                        deleteProfile(profile.id);
                      }
                    }}
                    style={{ ...iconBtn, color: "#f87171" }}
                    title={t("profiles.delete")}
                  >
                    &#x2715;
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => addProfile()} style={addBtn}>
        + {t("profiles.create_new")}
      </button>
    </div>
  );
}

const infoBox: React.CSSProperties = {
  padding: 12, background: "var(--bg-secondary)", borderRadius: "var(--radius)",
  border: "1px solid var(--border)", marginBottom: 16,
};

const iconBtn: React.CSSProperties = {
  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
  background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)", cursor: "pointer", fontSize: 13,
};

const addBtn: React.CSSProperties = {
  width: "100%", padding: "8px 14px", fontSize: 13, fontWeight: 500,
  background: "var(--bg-secondary)", border: "1px dashed var(--border)",
  borderRadius: "var(--radius)", color: "var(--text-primary)", cursor: "pointer",
};
