const router = require("express").Router();
const { search, getTrending } = require("../controllers/search.controller");
const { optionalAuth } = require("../middlewares/auth");

router.get("/", optionalAuth, search);
router.get("/trending", getTrending);

module.exports = router;
