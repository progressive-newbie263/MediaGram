import translations from "../i18n/translations";
import useSettingsStore from "../store/settingsStore";

const resolveKey = (source, key) =>
  key.split(".").reduce((value, part) => (value && value[part] != null ? value[part] : null), source);

const useTranslation = () => {
  const language = useSettingsStore((state) => state.language);
  const dictionary = translations[language] || translations.eng;

  const t = (key, fallback = "") => {
    const value = resolveKey(dictionary, key);
    if (typeof value === "string") return value;
    return fallback || key;
  };

  return { t, language, dictionary };
};

export default useTranslation;