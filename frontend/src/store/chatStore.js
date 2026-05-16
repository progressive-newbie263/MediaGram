import { create } from "zustand";
import { messageService } from "../services/message.service";
import toast from "react-hot-toast";

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  messagesPage: 1,
  hasMoreMessages: true,
  loadingMessages: false,
  onlineUsers: [],

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),

  removeOnlineUser: (userId) =>
    set((state) => ({ onlineUsers: state.onlineUsers.filter((id) => id !== userId) })),

  isOnline: (userId) => get().onlineUsers.includes(userId),

  // ── Conversations ────────────────────────────────────────────
  fetchConversations: async () => {
    try {
      const res = await messageService.getConversations();
      set({ conversations: res.data.conversations });
    } catch { }
  },

  setActiveConversation: async (conversation) => {
    set({ activeConversation: conversation, messages: [], messagesPage: 1, hasMoreMessages: true });
    if (conversation) get().fetchMessages(conversation.id);
  },

  openConversationWith: async (userId) => {
    try {
      const res = await messageService.getOrCreateConversation(userId);
      const conv = res.data.conversation;
      const participant = conv.participants
        ?.map((p) => p.user)
        .find((u) => u?.id === userId);
      const formatted = { id: conv.id, participant, lastMessage: null, unreadCount: 0 };
      set((state) => {
        const exists = state.conversations.find((c) => c.id === conv.id);
        return {
          conversations: exists ? state.conversations : [formatted, ...state.conversations],
          activeConversation: formatted,
          messages: [],
          messagesPage: 1,
          hasMoreMessages: true,
        };
      });
      get().fetchMessages(conv.id);
    } catch {
      toast.error("Could not open conversation");
    }
  },

  // ── Messages ─────────────────────────────────────────────────
  fetchMessages: async (conversationId, loadMore = false) => {
    const page = loadMore ? get().messagesPage : 1;
    set({ loadingMessages: true });
    try {
      const res = await messageService.getMessages(conversationId, page);
      const { messages, hasMore } = res.data;
      set((state) => ({
        messages: loadMore ? [...messages, ...state.messages] : messages,
        messagesPage: page + 1,
        hasMoreMessages: hasMore,
      }));
    } catch { } finally {
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (content, image = null) => {
    const conv = get().activeConversation;
    if (!conv) return;
    try {
      const res = await messageService.sendMessage(conv.id, {
        content,
        image,
        receiverId: conv.participant?.id,
      });
      const msg = res.data.message;
      set((state) => ({
        messages: [...state.messages, msg],
        conversations: state.conversations.map((c) =>
          c.id === conv.id
            ? { ...c, lastMessage: { content, createdAt: msg.createdAt } }
            : c
        ),
      }));
    } catch {
      toast.error("Failed to send message");
    }
  },

  // ── Real-time: receive message ────────────────────────────────
  receiveMessage: (message) => {
    const active = get().activeConversation;
    if (active?.id === message.conversationId) {
      set((state) => ({ messages: [...state.messages, message] }));
    }
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === message.conversationId
          ? {
              ...c,
              lastMessage: { content: message.content, createdAt: message.createdAt },
              unreadCount: active?.id === message.conversationId ? 0 : (c.unreadCount || 0) + 1,
            }
          : c
      ),
    }));
  },
}));

export default useChatStore;
