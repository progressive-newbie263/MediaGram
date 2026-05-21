import { create } from "zustand";
import { messageService } from "../services/message.service";
import useAuthStore from "./authStore";
import toast from "react-hot-toast";

const mergeUniqueById = (existing = [], incoming = []) => {
  const merged = [...existing, ...incoming];
  return Array.from(new Map(merged.map((item) => [item.id, item])).values());
};

const mergeConversationList = (conversations = []) => {
  const byParticipant = new Map();

  for (const conversation of conversations) {
    const participantId = conversation.participant?.id;
    if (!participantId) continue;

    const existing = byParticipant.get(participantId);
    if (!existing) {
      byParticipant.set(participantId, conversation);
      continue;
    }

    const existingTime = new Date(existing.lastMessageAt || existing.lastMessage?.createdAt || existing.updatedAt || 0).getTime();
    const currentTime = new Date(conversation.lastMessageAt || conversation.lastMessage?.createdAt || conversation.updatedAt || 0).getTime();

    if (currentTime >= existingTime) {
      byParticipant.set(participantId, conversation);
    }
  }

  return Array.from(byParticipant.values()).sort((a, b) => {
    const aTime = new Date(a.lastMessageAt || a.lastMessage?.createdAt || 0).getTime();
    const bTime = new Date(b.lastMessageAt || b.lastMessage?.createdAt || 0).getTime();
    return bTime - aTime;
  });
};

const upsertToFrontById = (items = [], item) => {
  if (!item) return items;
  return [item, ...items.filter((current) => current.id !== item.id)];
};

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
      set({ conversations: mergeConversationList(res.data.conversations) });
    } catch (error) {
      void error;
    }
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
        const nextConversation = {
          ...(state.conversations.find((c) => c.id === conv.id) || formatted),
          participant: participant || state.conversations.find((c) => c.id === conv.id)?.participant || null,
        };

        const conversations = mergeConversationList([
          nextConversation,
          ...state.conversations.filter((c) => c.id !== conv.id),
        ]);

        const activeConversation = conversations.find((c) => c.id === nextConversation.id) || nextConversation;

        return {
          conversations,
          activeConversation,
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
        messages: loadMore
          ? mergeUniqueById(messages, state.messages)
          : mergeUniqueById([], messages),
        messagesPage: page + 1,
        hasMoreMessages: hasMore,
      }));
    } catch (error) {
      void error;
    } finally {
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
        messages: mergeUniqueById(state.messages, [msg]),
        conversations: upsertToFrontById(
          state.conversations,
          {
            ...(state.conversations.find((c) => c.id === conv.id) || conv),
            lastMessage: { content: content || "📷 Image", createdAt: msg.createdAt },
          }
        ),
      }));
    } catch {
      toast.error("Failed to send message");
    }
  },

  // ── Real-time: receive message ────────────────────────────────
  receiveMessage: (message) => {
    const active = get().activeConversation;
    const currentUserId = useAuthStore.getState()?.user?.id;
    const isOwnMessage = currentUserId && message.senderId === currentUserId;

    if (active?.id === message.conversationId) {
      set((state) => ({
        messages: mergeUniqueById(state.messages, [message]),
      }));
    }
    set((state) => ({
      conversations: upsertToFrontById(
        state.conversations,
        {
          ...(state.conversations.find((c) => c.id === message.conversationId) || { id: message.conversationId }),
          lastMessage: { content: message.content, createdAt: message.createdAt },
          unreadCount: active?.id === message.conversationId || isOwnMessage
            ? 0
            : (state.conversations.find((c) => c.id === message.conversationId)?.unreadCount || 0) + 1,
        }
      ),
    }));
  },
}));

export default useChatStore;
