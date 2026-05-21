import { create } from "zustand";
import { persist } from "zustand/middleware";

const getSystemTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "system";

const useSettingsStore = create(
  persist(
    (set) => ({
      language: "eng",
      timezone: getSystemTimezone(),
      theme: "blue-black",

      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setTheme: (theme) => set({ theme }),
      resetSettings: () => set({ language: "eng", timezone: getSystemTimezone(), theme: "blue-black" }),
    }),
    {
      name: "mediagram-settings",
      partialize: (state) => ({
        language: state.language,
        timezone: state.timezone,
        theme: state.theme,
      }),
    }
  )
);

export default useSettingsStore;