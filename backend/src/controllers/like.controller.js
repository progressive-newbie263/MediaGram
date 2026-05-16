const prisma = require("../config/db");
const { getIO } = require("../config/socket");

// ─── Toggle Like ──────────────────────────────────────────────────
const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { postId } });
      return res.json({ liked: false, likesCount: count });
    }

    await prisma.like.create({ data: { userId, postId } });
    const count = await prisma.like.count({ where: { postId } });

    // Send notification to post owner (not to self)
    if (post.userId !== userId) {
      const notification = await prisma.notification.create({
        data: { type: "LIKE", userId: post.userId, actorId: userId, postId },
        include: {
          actor: { select: { id: true, username: true, avatar: true, displayName: true } },
          post: { select: { id: true, content: true } },
        },
      });

      try {
        getIO().to(`user:${post.userId}`).emit("notification:new", notification);
      } catch (_) {}
    }

    res.json({ liked: true, likesCount: count });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleLike };
