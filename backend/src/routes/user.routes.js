const router = require("express").Router();
const {
  getUserProfile, updateProfile, updateAvatar, updateCoverImage,
  getUserPosts, getFollowers, getFollowing, getSuggestedUsers,
} = require("../controllers/user.controller");
const { protect, optionalAuth } = require("../middlewares/auth");

router.get("/suggested", protect, getSuggestedUsers);
router.get("/:username", optionalAuth, getUserProfile);
router.put("/me/profile", protect, updateProfile);
router.put("/me/avatar", protect, updateAvatar);
router.put("/me/cover", protect, updateCoverImage);
router.get("/:username/posts", optionalAuth, getUserPosts);
router.get("/:username/followers", optionalAuth, getFollowers);
router.get("/:username/following", optionalAuth, getFollowing);

module.exports = router;
