const prisma = require("../config/db");
const { getIO } = require("../config/socket");

// ─── Create Comment ───────────────────────────────────────────────
const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent) return res.status(404).json({ error: "Parent comment not found" });
    }

    const comment = await prisma.comment.create({
      data: { content: content.trim(), userId, postId, parentId: parentId || null },
      include: {
        user: { select: { id: true, username: true, avatar: true, displayName: true } },
        replies: {
          include: {
            user: { select: { id: true, username: true, avatar: true, displayName: true } },
          },
        },
      },
    });

    // Notify post owner
    const notifType = parentId ? "REPLY" : "COMMENT";
    const targetUserId = parentId
      ? (await prisma.comment.findUnique({ where: { id: parentId } }))?.userId
      : post.userId;

    if (targetUserId && targetUserId !== userId) {
      const notification = await prisma.notification.create({
        data: { type: notifType, userId: targetUserId, actorId: userId, postId },
        include: {
          actor: { select: { id: true, username: true, avatar: true, displayName: true } },
          post: { select: { id: true, content: true } },
        },
      });
      try {
        getIO().to(`user:${targetUserId}`).emit("notification:new", notification);
      } catch (_) {}
    }

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

// ─── Get Comments for Post ────────────────────────────────────────
const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId, parentId: null },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true, avatar: true, displayName: true } },
          replies: {
            include: {
              user: { select: { id: true, username: true, avatar: true, displayName: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: { select: { replies: true } },
        },
      }),
      prisma.comment.count({ where: { postId, parentId: null } }),
    ]);

    res.json({ comments, total, page, hasMore: skip + limit < total });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Comment ───────────────────────────────────────────────
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId !== userId)
      return res.status(403).json({ error: "Not authorized" });

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createComment, getComments, deleteComment };
