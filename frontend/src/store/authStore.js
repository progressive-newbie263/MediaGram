import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/auth.service";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // ── Register ──────────────────────────────────────────────
      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authService.register(data);
          const { user, accessToken, refreshToken } = res.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          set({ user, accessToken, refreshToken, isAuthenticated: true });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.response?.data?.error || "Registration failed" };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Login ─────────────────────────────────────────────────
      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authService.login(data);
          const { user, accessToken, refreshToken } = res.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          set({ user, accessToken, refreshToken, isAuthenticated: true });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.response?.data?.error || "Login failed" };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Logout ────────────────────────────────────────────────
      logout: async () => {
        const rt = get().refreshToken || localStorage.getItem("refreshToken");
        try { await authService.logout(rt); } catch (_) {}
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      // ── Update local user ─────────────────────────────────────
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      // ── Hydrate user from API ─────────────────────────────────
      hydrateUser: async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
          const res = await authService.getMe();
          set({ user: res.data.user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "mediagram-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
