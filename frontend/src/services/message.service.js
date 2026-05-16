import api from "./api";

export const messageService = {
  getConversations: () => api.get("/messages"),
  getOrCreateConversation: (userId) => api.post(`/messages/conversation/${userId}`),
  getMessages: (conversationId, page = 1) => api.get(`/messages/${conversationId}?page=${page}`),
  sendMessage: (conversationId, data) => api.post(`/messages/${conversationId}`, data),
};
