import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import useSettingsStore from "../store/settingsStore";
import useTranslation from "../hooks/useTranslation";

const timezones = [
  "system",
  "UTC",
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
];

const SettingsPage = () => {
  const { t } = useTranslation();
  const { language, timezone, theme, setLanguage, setTimezone, setTheme } = useSettingsStore();
  const [draft, setDraft] = useState({ language, timezone, theme });
  const now = new Date();

  useEffect(() => {
    setDraft({ language, timezone, theme });
  }, [language, timezone, theme]);

  const hasChanges = useMemo(
    () => draft.language !== language || draft.timezone !== timezone || draft.theme !== theme,
    [draft.language, draft.timezone, draft.theme, language, timezone, theme]
  );

  const handleSave = () => {
    setLanguage(draft.language);
    setTimezone(draft.timezone);
    setTheme(draft.theme);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 lg:py-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card p-6 space-y-6"
      >
        <div>
          <p className="section-kicker">{t("sidebar.settings")}</p>
          <h1 className="font-display mt-3 text-3xl font-bold text-white">{t("settings.title")}</h1>
          <p className="mt-2 text-sm text-white/55">{t("settings.subtitle")}</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">{t("settings.theme")}</label>
            <p className="mb-3 text-xs text-white/45">{t("settings.themeHelp")}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "blue-black",
                  label: t("settings.blueBlackTheme"),
                  previewClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white",
                  accentClass: "bg-sky-400",
                },
                {
                  value: "white",
                  label: t("settings.whiteTheme"),
                  previewClass: "bg-white text-slate-900",
                  accentClass: "bg-sky-500",
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, theme: item.value }))}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    draft.theme === item.value
                      ? "border-brand-400 bg-brand-500/15 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8"
                  }`}
                >
                    <div className={`mb-3 h-10 w-full rounded-xl border ${item.value === "white" ? "border-slate-200" : "border-white/10"} ${item.previewClass}`}>
                      <div className={`h-full w-1/2 rounded-xl opacity-60 ${item.accentClass}`} />
                  </div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-xs text-white/45">{item.value === "white" ? t("settings.whiteThemeHint") : t("settings.blueBlackThemeHint")}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">{t("settings.language")}</label>
            <p className="mb-3 text-xs text-white/45">{t("settings.languageHelp")}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "eng", label: "English" },
                { value: "vie", label: "Tiếng Việt" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, language: item.value }))}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                    draft.language === item.value
                      ? "border-brand-400 bg-brand-500/15 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8"
                  }`}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-xs text-white/45">{item.value.toUpperCase()}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">{t("settings.timezone")}</label>
            <p className="mb-3 text-xs text-white/45">{t("settings.timezoneHelp")}</p>
            <select
              value={draft.timezone}
              onChange={(e) => setDraft((current) => ({ ...current, timezone: e.target.value }))}
              className="input-field"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz === "system" ? t("settings.systemTimezone") : tz}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-white/45">{t("settings.timezoneHint")}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">{t("settings.preview")}</p>
            <p className="mt-2 text-sm text-white/80">{t("settings.previewText")}</p>
            <div className={`mt-3 rounded-2xl border p-4 ${draft.theme === "white" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-surface-950/60 text-white"}`}>
              <p className={`text-xs uppercase tracking-[0.18em] ${draft.theme === "white" ? "text-slate-500" : "text-white/45"}`}>{draft.theme === "white" ? t("settings.whiteTheme") : t("settings.blueBlackTheme")}</p>
              <p className={`mt-2 text-xs ${draft.theme === "white" ? "text-slate-600" : "text-white/55"}`}>
                {draft.language === "vie" ? "Ngôn ngữ hiện tại" : "Current language"}: {draft.language.toUpperCase()}
              </p>
              <p className={`mt-1 text-xs ${draft.theme === "white" ? "text-slate-600" : "text-white/55"}`}>
                {now.toLocaleString(draft.language === "vie" ? "vi-VN" : "en-US", {
                  timeZone: draft.timezone === "system" ? Intl.DateTimeFormat().resolvedOptions().timeZone : draft.timezone,
                dateStyle: "medium",
                timeStyle: "short",
              })}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/45">{t("settings.saveHint")}</p>
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={handleSave} disabled={!hasChanges}>
              {t("common.save")}
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default SettingsPage;