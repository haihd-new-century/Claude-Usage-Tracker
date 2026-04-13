import { useTranslation } from "react-i18next";
import { Constants } from "@/utils/constants";

export function AboutTab() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("settings.about")}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("settings.about.description")}
      </p>

      {/* Version */}
      <div style={card}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Claude Usage Tracker</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {t("about.version", { value0: "3.0.3" })} (Windows)
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {t("about.copyright")}
        </div>
      </div>

      {/* Creator */}
      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{t("about.created_by")}</div>
        <div style={{ fontSize: 13 }}>{t("creator.name")}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t("creator.username")}</div>
      </div>

      {/* Links */}
      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{t("about.links")}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <LinkButton
            label={t("about.star_github")}
            onClick={() => window.open(Constants.githubRepoURL, "_blank")}
          />
          <LinkButton
            label={t("about.report_issue")}
            onClick={() => window.open(Constants.githubRepoURL + "/issues", "_blank")}
          />
          <LinkButton
            label={t("about.send_feedback")}
            onClick={() => window.open(Constants.githubRepoURL + "/discussions", "_blank")}
          />
        </div>
      </div>

      {/* License */}
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "var(--text-muted)" }}>
        {t("about.mit_license")}
      </div>
    </div>
  );
}

function LinkButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "8px 12px",
        fontSize: 12,
        textAlign: "left",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        color: "var(--accent)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

const card: React.CSSProperties = {
  padding: 14,
  background: "var(--bg-card)",
  borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
};
