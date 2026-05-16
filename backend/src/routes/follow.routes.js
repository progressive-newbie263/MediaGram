const router = require("express").Router();
const { toggleFollow } = require("../controllers/follow.controller");
const { protect } = require("../middlewares/auth");

router.post("/:userId", protect, toggleFollow);

module.exports = router;
