import { useTranslation } from "react-i18next";
import { languages, changeLanguage } from "@/i18n";

export function LanguageTab() {
  const { t, i18n } = useTranslation();

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{t("language.title")}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)" }}>
        {t("language.subtitle")}
      </p>

      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
        {t("language.available")} ({languages.length})
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {languages.map((lang) => {
          const isActive = i18n.language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: isActive ? "var(--accent)" : "var(--bg-secondary)",
                color: isActive ? "#fff" : "var(--text-primary)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                cursor: "pointer",
                fontSize: 13,
                textAlign: "left",
              }}
            >
              <span>{lang.name}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{lang.code}</span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 10,
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius)",
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        {t("language.restart_message")}
      </div>
    </div>
  );
}
