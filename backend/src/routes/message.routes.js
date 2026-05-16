const router = require("express").Router();
const {
  getConversations, getOrCreateConversation, getMessages, sendMessage,
} = require("../controllers/message.controller");
const { protect } = require("../middlewares/auth");

router.get("/", protect, getConversations);
router.post("/conversation/:userId", protect, getOrCreateConversation);
router.get("/:conversationId", protect, getMessages);
router.post("/:conversationId", protect, sendMessage);

module.exports = router;
