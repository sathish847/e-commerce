const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// Get all subcategories (sorted by sortOrder)
const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().sort({ sortOrder: 1 });
    res.json({
      success: true,
      count: subCategories.length,
      data: subCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get subcategories by category name
const getSubCategoriesByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({
      category: { $regex: new RegExp(`^${req.params.categoryName}$`, 'i') },
      isActive: true
    }).sort({ sortOrder: 1 });

    res.json({
      success: true,
      count: subCategories.length,
      data: subCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single subcategory
const getSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found'
      });
    }

    res.json({
      success: true,
      data: subCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create subcategory
const createSubCategory = async (req, res) => {
  try {
    const { name, category, sortOrder, isActive } = req.body;

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

    // Check if subcategory already exists in this category
    const existingSubCategory = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category: { $regex: new RegExp(`^${category}$`, 'i') }
    });
    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory with this name already exists in the selected category'
      });
    }

    const subCategory = new SubCategory({
      name,
      category: categoryExists.name, // Use the exact name from database
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await subCategory.save();

    res.status(201).json({
      success: true,
      message: 'SubCategory created successfully',
      data: subCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update subcategory
const updateSubCategory = async (req, res) => {
  try {
    const { name, category, sortOrder, isActive } = req.body;

    // Get current subcategory to know the existing category
    const currentSubCategory = await SubCategory.findById(req.params.id);
    if (!currentSubCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found'
      });
    }

    let categoryName = currentSubCategory.category; // Default to current category

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

    // Check if name is being updated and if it conflicts
    if (name) {
      const existingSubCategory = await SubCategory.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingSubCategory) {
        return res.status(400).json({
          success: false,
          message: 'SubCategory with this name already exists in the selected category'
        });
      }
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category: categoryName,
        sortOrder,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found'
      });
    }

    res.json({
      success: true,
      message: 'SubCategory updated successfully',
      data: subCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete subcategory
const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found'
      });
    }

    res.json({
      success: true,
      message: 'SubCategory deleted successfully'
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
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
};
