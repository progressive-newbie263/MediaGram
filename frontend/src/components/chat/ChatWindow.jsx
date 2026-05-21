import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import MessageBubble from "./MessageBubble";
import { IconSend, IconImage } from "../common/Icons";
import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";
import { getSocket } from "../../hooks/useSocket";
import { fileToBase64 } from "../../utils/timeFormat";
import LoadingSpinner from "../common/LoadingSpinner";
import useTranslation from "../../hooks/useTranslation";
import { formatChatDaySeparator, isSameChatDay } from "../../utils/timeFormat";

const MessageDateDivider = ({ label }) => (
  <div className="chat-date-divider my-4 flex items-center gap-3 px-2">
    <div className="chat-date-divider-line h-px flex-1" />
    <span className="chat-date-divider-label rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
      {label}
    </span>
    <div className="chat-date-divider-line h-px flex-1" />
  </div>
);

const ChatWindow = ({ conversation }) => {
  const { user } = useAuthStore();
  const {
    messages, sendMessage, fetchMessages, hasMoreMessages,
    loadingMessages, isOnline,
  } = useChatStore();
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimeout = useRef(null);
  const { t } = useTranslation();

  const participant = conversation?.participant;

  useEffect(() => {
    if (!conversation?.id) return;
    const socket = getSocket();
    socket?.emit("conversation:join", conversation.id);
    return () => socket?.emit("conversation:leave", conversation.id);
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversation?.id) return;
    const onTypingStart = ({ userId }) => {
      if (userId === participant?.id) setTyping(true);
    };
    const onTypingStop = ({ userId }) => {
      if (userId === participant?.id) setTyping(false);
    };
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    return () => {
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [conversation?.id, participant?.id]);

  const emitTyping = (active) => {
    const socket = getSocket();
    if (!socket || !conversation?.id) return;
    socket.emit(active ? "typing:start" : "typing:stop", {
      conversationId: conversation.id,
      userId: user.id,
    });
  };

  const handleChange = (e) => {
    setText(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleSend = async (image = null) => {
    if (!text.trim() && !image) return;
    setSending(true);
    emitTyping(false);
    await sendMessage(text.trim(), image);
    setText("");
    setSending(false);
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    await handleSend(b64);
    e.target.value = "";
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40">
        <p>{t("common.selectConversation", "Select a conversation to start chatting")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-[calc(100vh-80px)] lg:min-h-screen">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 glass sticky top-0 z-10">
        <Link to={`/profile/${participant?.username}`}>
          <Avatar
            src={participant?.avatar}
            alt={participant?.username}
            size="md"
            online={isOnline(participant?.id)}
          />
        </Link>
        <div>
          <Link to={`/profile/${participant?.username}`} className="font-semibold hover:underline">
            {participant?.displayName || participant?.username}
          </Link>
          <p className="text-xs text-white/40">
            {isOnline(participant?.id) ? "Online" : "Offline"}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {hasMoreMessages && (
          <button
            onClick={() => fetchMessages(conversation.id, true)}
            className="w-full text-center text-sm text-brand-400 py-2 mb-4"
          >
            {loadingMessages ? <LoadingSpinner size="sm" /> : t("common.loadOlderMessages", "Load older messages")}
          </button>
        )}
        {messages.map((msg, index) => {
          const previousMessage = messages[index - 1];
          const currentLabel = formatChatDaySeparator(msg.createdAt);
          const showDivider = !previousMessage || !isSameChatDay(previousMessage.createdAt, msg.createdAt);

          return (
            <div key={msg.id}>
              {showDivider && <MessageDateDivider label={currentLabel} />}
              <MessageBubble message={msg} isOwn={msg.senderId === user.id} />
            </div>
          );
        })}
        {typing && (
          <div className="flex gap-1 px-4 py-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="p-4 border-t border-white/5">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2 text-brand-400 hover:bg-white/5 rounded-xl"
          >
            <IconImage />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("common.typeMessage", "Type a message…")}
            rows={1}
            className="flex-1 input-field resize-none max-h-32 py-2.5"
          />
          <button
            onClick={() => handleSend()}
            disabled={sending || !text.trim()}
            className="btn-primary p-2.5 rounded-xl"
          >
            <IconSend />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;
