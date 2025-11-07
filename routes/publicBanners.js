const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");

// Public route - no authentication required
router.get("/", bannerController.getPublicBanners);

module.exports = router;
