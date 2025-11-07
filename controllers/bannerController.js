const Banner = require("../models/Banner");

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    const newBanner = new Banner(req.body);
    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findOne({ id: req.params.id });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a banner
exports.updateBanner = async (req, res) => {
  try {
    const updatedBanner = await Banner.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
    });
    if (!updatedBanner)
      return res.status(404).json({ message: "Banner not found" });
    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const deletedBanner = await Banner.findOneAndDelete({ id: req.params.id });
    if (!deletedBanner)
      return res.status(404).json({ message: "Banner not found" });
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all public banners
exports.getPublicBanners = async (req, res) => {
    try {
      const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1 });
      res.status(200).json(banners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  