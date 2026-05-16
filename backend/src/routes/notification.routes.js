const router = require("express").Router();
const { getNotifications, markAllRead, markRead, getUnreadCount } = require("../controllers/notification.controller");
const { protect } = require("../middlewares/auth");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/read-all", protect, markAllRead);
router.patch("/:notificationId/read", protect, markRead);

module.exports = router;
