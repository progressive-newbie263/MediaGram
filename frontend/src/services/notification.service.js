import api from "./api";

export const notificationService = {
  getNotifications: (page = 1) => api.get(`/notifications?page=${page}`),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAllRead: () => api.patch("/notifications/read-all"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

