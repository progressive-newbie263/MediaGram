const { Server } = require("socket.io");

let io;
// Map userId -> Set of socketIds (support multiple devices)
const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:3000",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`🔌 Socket connected: ${socket.id} | User: ${userId}`);

    // ── Join user room ──────────────────────────────────────────
    if (userId) {
      socket.join(`user:${userId}`);

      // Track online users
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      // Broadcast online status
      socket.broadcast.emit("user:online", { userId });
      console.log(`👥 Online users: ${onlineUsers.size}`);
    }

    // ── Send current online users to new connection ─────────────
    socket.emit("users:online", Array.from(onlineUsers.keys()));

    // ── Chat: Join conversation room ────────────────────────────
    socket.on("conversation:join", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ── Typing indicators ────────────────────────────────────────
    socket.on("typing:start", ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", { userId });
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id} | User: ${userId}`);
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("user:offline", { userId });
        }
      }
    });
  });

  console.log("⚡ Socket.io initialized");
  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

const isUserOnline = (userId) => onlineUsers.has(userId);

module.exports = { initSocket, getIO, isUserOnline };
