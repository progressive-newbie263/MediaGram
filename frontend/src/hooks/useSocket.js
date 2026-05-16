import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import useNotifStore from "../store/notifStore";

let socket = null;

const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { receiveMessage, addOnlineUser, removeOnlineUser, setOnlineUsers } = useChatStore();
  const { addNotification, fetchUnreadCount } = useNotifStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || initialized.current) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

    socket = io(SOCKET_URL, {
      query: { userId: user.id },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      initialized.current = true;
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      initialized.current = false;
    });

    // Online presence
    socket.on("users:online", (userIds) => setOnlineUsers(userIds));
    socket.on("user:online", ({ userId }) => addOnlineUser(userId));
    socket.on("user:offline", ({ userId }) => removeOnlineUser(userId));

    // Chat
    socket.on("message:new", (message) => receiveMessage(message));

    // Notifications
    socket.on("notification:new", (notif) => {
      addNotification(notif);
      fetchUnreadCount();
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        initialized.current = false;
      }
    };
  }, [isAuthenticated, user?.id]);

  return socket;
};

export const getSocket = () => socket;

export default useSocket;
