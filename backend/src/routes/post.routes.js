const router = require("express").Router();
const { createPost, getFeed, getExplorePosts, getPost, deletePost } = require("../controllers/post.controller");
const { protect, optionalAuth } = require("../middlewares/auth");

router.post("/", protect, createPost);
router.get("/feed", protect, getFeed);
router.get("/explore", optionalAuth, getExplorePosts);
router.get("/:postId", optionalAuth, getPost);
router.delete("/:postId", protect, deletePost);

module.exports = router;
