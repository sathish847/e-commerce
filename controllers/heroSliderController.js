const HeroSlider = require('../models/HeroSlider');

// Get all hero sliders (sorted by sortOrder)
const getAllHeroSliders = async (req, res) => {
  try {
    const heroSliders = await HeroSlider.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({
      success: true,
      count: heroSliders.length,
      data: heroSliders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single hero slider
const getHeroSlider = async (req, res) => {
  try {
    const heroSlider = await HeroSlider.findById(req.params.id);
    if (!heroSlider) {
      return res.status(404).json({
        success: false,
        message: 'Hero slider not found'
      });
    }
    res.json({
      success: true,
      data: heroSlider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create hero slider
const createHeroSlider = async (req, res) => {
  try {
    const { backgroundImage, category, discount, sortOrder, isActive } = req.body;

    // Validate base64 image
    if (!backgroundImage || !backgroundImage.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Background image must be a valid base64 encoded image starting with data:image/'
      });
    }

    // Validate required fields
    if (!category || discount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category and discount are required'
      });
    }

    const heroSlider = new HeroSlider({
      backgroundImage,
      category,
      discount,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await heroSlider.save();

    res.status(201).json({
      success: true,
      message: 'Hero slider created successfully',
      data: heroSlider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update hero slider
const updateHeroSlider = async (req, res) => {
  try {
    const { backgroundImage, category, discount, sortOrder, isActive } = req.body;

    // Validate base64 image if provided
    if (backgroundImage && !backgroundImage.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Background image must be a valid base64 encoded image starting with data:image/'
      });
    }

    const heroSlider = await HeroSlider.findByIdAndUpdate(
      req.params.id,
      { backgroundImage, category, discount, sortOrder, isActive },
      { new: true, runValidators: true }
    );

    if (!heroSlider) {
      return res.status(404).json({
        success: false,
        message: 'Hero slider not found'
      });
    }

    res.json({
      success: true,
      message: 'Hero slider updated successfully',
      data: heroSlider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete hero slider
const deleteHeroSlider = async (req, res) => {
  try {
    const heroSlider = await HeroSlider.findByIdAndDelete(req.params.id);

    if (!heroSlider) {
      return res.status(404).json({
        success: false,
        message: 'Hero slider not found'
      });
    }

    res.json({
      success: true,
      message: 'Hero slider deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all hero sliders for admin (including inactive)
const getAllHeroSlidersAdmin = async (req, res) => {
  try {
    const heroSliders = await HeroSlider.find().sort({ sortOrder: 1 });
    res.json({
      success: true,
      count: heroSliders.length,
      data: heroSliders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAllHeroSliders,
  getHeroSlider,
  createHeroSlider,
  updateHeroSlider,
  deleteHeroSlider,
  getAllHeroSlidersAdmin
};
