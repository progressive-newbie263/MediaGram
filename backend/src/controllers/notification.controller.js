const prisma = require("../config/db");

// ─── Get Notifications ────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, username: true, avatar: true, displayName: true } },
          post: { select: { id: true, content: true, images: true } },
        },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    res.json({ notifications, total, page, unreadCount, hasMore: skip + limit < total });
  } catch (err) {
    next(err);
  }
};

// ─── Mark All as Read ─────────────────────────────────────────────
const markAllRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// ─── Mark Single as Read ──────────────────────────────────────────
const markRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: req.user.id },
      data: { read: true },
    });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
};

// ─── Get Unread Count ─────────────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAllRead, markRead, getUnreadCount };
