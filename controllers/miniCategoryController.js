const MiniCategory = require('../models/MiniCategory');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// Get all mini categories (sorted by sortOrder)
const getAllMiniCategories = async (req, res) => {
  try {
    const miniCategories = await MiniCategory.find().sort({ sortOrder: 1 });
    res.json({
      success: true,
      count: miniCategories.length,
      data: miniCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get mini categories by category and subcategory
const getMiniCategoriesByCategoryAndSubCategory = async (req, res) => {
  try {
    const miniCategories = await MiniCategory.find({
      category: { $regex: new RegExp(`^${req.params.categoryName}$`, 'i') },
      subCategory: { $regex: new RegExp(`^${req.params.subCategoryName}$`, 'i') },
      status: true
    }).sort({ sortOrder: 1 });

    res.json({
      success: true,
      count: miniCategories.length,
      data: miniCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single mini category
const getMiniCategory = async (req, res) => {
  try {
    const miniCategory = await MiniCategory.findById(req.params.id);

    if (!miniCategory) {
      return res.status(404).json({
        success: false,
        message: 'MiniCategory not found'
      });
    }

    res.json({
      success: true,
      data: miniCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create mini category
const createMiniCategory = async (req, res) => {
  try {
    const { name, category, subCategory, sortOrder, status, image } = req.body;

    // Validate base64 image if provided
    if (image && !image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Image must be a valid base64 encoded image starting with data:image/'
      });
    }

    // Check if category exists by name
    const categoryExists = await Category.findOne({
      name: { $regex: new RegExp(`^${category}$`, 'i') }
    });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category does not exist'
      });
    }

    // Check if subcategory exists in the category
    const subCategoryExists = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${subCategory}$`, 'i') },
      category: { $regex: new RegExp(`^${category}$`, 'i') }
    });
    if (!subCategoryExists) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory does not exist in the specified category'
      });
    }

    // Check if mini category already exists in this category and subcategory
    const existingMiniCategory = await MiniCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category: { $regex: new RegExp(`^${category}$`, 'i') },
      subCategory: { $regex: new RegExp(`^${subCategory}$`, 'i') }
    });
    if (existingMiniCategory) {
      return res.status(400).json({
        success: false,
        message: 'MiniCategory with this name already exists in the specified category and subcategory'
      });
    }

    const miniCategory = new MiniCategory({
      name,
      category: categoryExists.name, // Use the exact name from database
      subCategory: subCategoryExists.name, // Use the exact name from database
      sortOrder: sortOrder || 0,
      status: status !== undefined ? status : true,
      image
    });

    await miniCategory.save();

    res.status(201).json({
      success: true,
      message: 'MiniCategory created successfully',
      data: miniCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update mini category
const updateMiniCategory = async (req, res) => {
  try {
    const { name, category, subCategory, sortOrder, status, image } = req.body;

    // Get current mini category to know the existing values
    const currentMiniCategory = await MiniCategory.findById(req.params.id);
    if (!currentMiniCategory) {
      return res.status(404).json({
        success: false,
        message: 'MiniCategory not found'
      });
    }

    let categoryName = currentMiniCategory.category; // Default to current category
    let subCategoryName = currentMiniCategory.subCategory; // Default to current subcategory

    // Check if category is being updated
    if (category) {
      const categoryExists = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, 'i') }
      });
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category does not exist'
        });
      }
      categoryName = categoryExists.name; // Use the exact name from database
    }

    // Check if subcategory is being updated
    if (subCategory) {
      const subCategoryExists = await SubCategory.findOne({
        name: { $regex: new RegExp(`^${subCategory}$`, 'i') },
        category: { $regex: new RegExp(`^${categoryName}$`, 'i') }
      });
      if (!subCategoryExists) {
        return res.status(400).json({
          success: false,
          message: 'SubCategory does not exist in the specified category'
        });
      }
      subCategoryName = subCategoryExists.name; // Use the exact name from database
    }

    // Check if name is being updated and if it conflicts
    if (name) {
      const existingMiniCategory = await MiniCategory.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
        subCategory: { $regex: new RegExp(`^${subCategoryName}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingMiniCategory) {
        return res.status(400).json({
          success: false,
          message: 'MiniCategory with this name already exists in the specified category and subcategory'
        });
      }
    }

    const miniCategory = await MiniCategory.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category: categoryName,
        subCategory: subCategoryName,
        sortOrder,
        status,
        image
      },
      { new: true, runValidators: true }
    );

    if (!miniCategory) {
      return res.status(404).json({
        success: false,
        message: 'MiniCategory not found'
      });
    }

    res.json({
      success: true,
      message: 'MiniCategory updated successfully',
      data: miniCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete mini category
const deleteMiniCategory = async (req, res) => {
  try {
    const miniCategory = await MiniCategory.findByIdAndDelete(req.params.id);

    if (!miniCategory) {
      return res.status(404).json({
        success: false,
        message: 'MiniCategory not found'
      });
    }

    res.json({
      success: true,
      message: 'MiniCategory deleted successfully'
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
  getAllMiniCategories,
  getMiniCategoriesByCategoryAndSubCategory,
  getMiniCategory,
  createMiniCategory,
  updateMiniCategory,
  deleteMiniCategory
};
