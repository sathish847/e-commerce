const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// All banner routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

// Create a new banner
router.post("/", bannerController.createBanner);

// Get all banners
router.get("/", bannerController.getBanners);

// Get a single banner by ID
router.get("/:id", bannerController.getBannerById);

// Update a banner
router.put("/:id", bannerController.updateBanner);

// Delete a banner
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;
