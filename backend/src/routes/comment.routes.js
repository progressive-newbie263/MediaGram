const router = require("express").Router();
const { createComment, getComments, deleteComment } = require("../controllers/comment.controller");
const { protect, optionalAuth } = require("../middlewares/auth");

router.post("/:postId", protect, createComment);
router.get("/:postId", optionalAuth, getComments);
router.delete("/:commentId", protect, deleteComment);

module.exports = router;
