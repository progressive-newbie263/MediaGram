const prisma = require("../config/db");
const { getIO } = require("../config/socket");

// ─── Toggle Follow ────────────────────────────────────────────────
const toggleFollow = async (req, res, next) => {
  try {
    const { userId: targetId } = req.params;
    const followerId = req.user.id;

    if (followerId === targetId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) return res.status(404).json({ error: "User not found" });

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: targetId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return res.json({ following: false, message: "Unfollowed" });
    }

    await prisma.follow.create({ data: { followerId, followingId: targetId } });

    // Notification
    const notification = await prisma.notification.create({
      data: { type: "FOLLOW", userId: targetId, actorId: followerId },
      include: {
        actor: { select: { id: true, username: true, avatar: true, displayName: true } },
      },
    });

    try {
      getIO().to(`user:${targetId}`).emit("notification:new", notification);
    } catch (_) {}

    res.json({ following: true, message: "Followed" });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleFollow };
