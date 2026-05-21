import { create } from "zustand";
import { notificationService } from "../services/notification.service";

const useNotifStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  hasMore: true,
  page: 1,

  fetchNotifications: async (reset = false) => {
    const page = reset ? 1 : get().page;
    try {
      const res = await notificationService.getNotifications(page);
      const { notifications, hasMore, unreadCount } = res.data;
      set((state) => ({
        notifications: reset ? notifications : [...state.notifications, ...notifications],
        hasMore,
        unreadCount,
        page: page + 1,
      }));
    } catch (error) {
      void error;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationService.getUnreadCount();
      set({ unreadCount: res.data.count });
    } catch (error) {
      void error;
    }
  },

  markAllRead: async () => {
    try {
      await notificationService.markAllRead();
      set((state) => ({
        unreadCount: 0,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (error) {
      void error;
    }
  },

  addNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
}));

export default useNotifStore;
