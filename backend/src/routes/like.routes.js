const router = require("express").Router();
const { toggleLike } = require("../controllers/like.controller");
const { protect } = require("../middlewares/auth");

router.post("/:postId", protect, toggleLike);

module.exports = router;
