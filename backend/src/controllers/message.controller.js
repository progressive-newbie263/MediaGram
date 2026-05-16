const prisma = require("../config/db");
const { getIO } = require("../config/socket");
const { uploadToCloudinary } = require("../utils/helpers");

// ─── Get Conversations ────────────────────────────────────────────
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: {
          where: { userId: { not: userId } },
          include: {
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true, senderId: true, read: true },
        },
        _count: {
          select: {
            messages: { where: { receiverId: userId, read: false } },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const formatted = conversations.map((c) => ({
      id: c.id,
      participant: c.participants[0]?.user,
      lastMessage: c.messages[0] || null,
      lastMessageAt: c.lastMessageAt,
      unreadCount: c._count.messages,
    }));

    res.json({ conversations: formatted });
  } catch (err) {
    next(err);
  }
};

// ─── Get or Create Conversation ───────────────────────────────────
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId: otherId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === otherId) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    const other = await prisma.user.findUnique({ where: { id: otherId } });
    if (!other) return res.status(404).json({ error: "User not found" });

    // Check if conversation exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: otherId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
      },
    });

    if (existing) return res.json({ conversation: existing });

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: currentUserId }, { userId: otherId }],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
      },
    });

    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
};

// ─── Get Messages ─────────────────────────────────────────────────
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) return res.status(403).json({ error: "Not authorized" });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, username: true, avatar: true, displayName: true } },
        },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Mark received messages as read
    await prisma.message.updateMany({
      where: { conversationId, receiverId: userId, read: false },
      data: { read: true },
    });

    res.json({ messages: messages.reverse(), total, page, hasMore: skip + limit < total });
  } catch (err) {
    next(err);
  }
};

// ─── Send Message ─────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, image, receiverId } = req.body;
    const senderId = req.user.id;

    if (!content && !image) {
      return res.status(400).json({ error: "Message content or image required" });
    }

    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: senderId } },
    });
    if (!participant) return res.status(403).json({ error: "Not authorized" });

    let imageUrl = null;
    if (image) {
      const { url } = await uploadToCloudinary(image, "mediagram/messages");
      imageUrl = url;
    }

    const message = await prisma.message.create({
      data: {
        content: content || "",
        image: imageUrl,
        senderId,
        receiverId,
        conversationId,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true, displayName: true } },
      },
    });

    // Update conversation lastMessage
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: content || "📷 Image", lastMessageAt: new Date() },
    });

    // Emit via Socket.io
    try {
      getIO().to(`conversation:${conversationId}`).emit("message:new", message);
      getIO().to(`user:${receiverId}`).emit("message:notification", {
        conversationId,
        message,
        sender: message.sender,
      });
    } catch (_) {}

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage };
