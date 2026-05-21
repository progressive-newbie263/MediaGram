import { formatDistanceToNow, format, differenceInCalendarDays } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import useSettingsStore from "../store/settingsStore";

const getLocale = () => (useSettingsStore.getState().language === "vie" ? vi : enUS);
const getTimezone = () => useSettingsStore.getState().timezone || "system";

const toTimezoneDate = (date) => {
  const timezone = getTimezone();
  const parsed = new Date(date);
  if (timezone === "system") return parsed;
  return new Date(parsed.toLocaleString("en-US", { timeZone: timezone, hour12: false }));
};

export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: getLocale() });

export const formatMessageClock = (date) => format(toTimezoneDate(date), "HH:mm");

export const formatChatDaySeparator = (date) => {
  const language = useSettingsStore.getState().language;
  const currentDate = toTimezoneDate(new Date());
  const targetDate = toTimezoneDate(date);
  const dayDifference = differenceInCalendarDays(currentDate, targetDate);

  if (dayDifference === 0) return language === "vie" ? "Hôm nay" : "Today";
  if (dayDifference === 1) return language === "vie" ? "Hôm qua" : "Yesterday";

  if (dayDifference > 1 && dayDifference <= 6) {
    if (language === "vie") {
      return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][targetDate.getDay()];
    }
    return format(targetDate, "EEE", { locale: getLocale() });
  }

  return language === "vie"
    ? format(targetDate, "dd/MM/yyyy")
    : format(targetDate, "MM/dd/yyyy");
};

export const isSameChatDay = (leftDate, rightDate) =>
  differenceInCalendarDays(toTimezoneDate(leftDate), toTimezoneDate(rightDate)) === 0;

export const formatChatTime = (date) => {
  const d = toTimezoneDate(date);
  const dayDifference = differenceInCalendarDays(toTimezoneDate(new Date()), d);
  if (dayDifference === 0) return formatMessageClock(date);
  if (dayDifference === 1) return useSettingsStore.getState().language === "vie" ? "Hôm qua" : "Yesterday";
  return useSettingsStore.getState().language === "vie" ? format(d, "dd/MM") : format(d, "MM/dd");
};

export const formatFullDate = (date) =>
  useSettingsStore.getState().language === "vie"
    ? format(toTimezoneDate(date), "dd/MM/yyyy · HH:mm", { locale: getLocale() })
    : format(toTimezoneDate(date), "MM/dd/yyyy · HH:mm", { locale: getLocale() });

export const truncate = (str, n = 150) =>
  str && str.length > n ? str.slice(0, n) + "…" : str;

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const formatNumber = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
};
