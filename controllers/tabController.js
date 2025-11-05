const Tab = require('../models/Tab');

// Get all tabs (sorted by sortOrder)
const getAllTabs = async (req, res) => {
  try {
    const tabs = await Tab.find().sort({ sortOrder: 1 });
    res.json({
      success: true,
      count: tabs.length,
      data: tabs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single tab
const getTab = async (req, res) => {
  try {
    const tab = await Tab.findById(req.params.id);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found'
      });
    }

    res.json({
      success: true,
      data: tab
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create tab
const createTab = async (req, res) => {
  try {
    const { name, status, sortOrder } = req.body;

    // Check if tab already exists
    const existingTab = await Tab.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingTab) {
      return res.status(400).json({
        success: false,
        message: 'Tab with this name already exists'
      });
    }

    const tab = new Tab({
      name,
      status: status !== undefined ? status : true,
      sortOrder: sortOrder || 0
    });

    await tab.save();

    res.status(201).json({
      success: true,
      message: 'Tab created successfully',
      data: tab
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update tab
const updateTab = async (req, res) => {
  try {
    const { name, status, sortOrder } = req.body;

    // Check if name is being updated and if it conflicts
    if (name) {
      const existingTab = await Tab.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingTab) {
        return res.status(400).json({
          success: false,
          message: 'Tab with this name already exists'
        });
      }
    }

    const tab = await Tab.findByIdAndUpdate(
      req.params.id,
      {
        name,
        status,
        sortOrder
      },
      { new: true, runValidators: true }
    );

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found'
      });
    }

    res.json({
      success: true,
      message: 'Tab updated successfully',
      data: tab
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete tab
const deleteTab = async (req, res) => {
  try {
    const tab = await Tab.findByIdAndDelete(req.params.id);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found'
      });
    }

    res.json({
      success: true,
      message: 'Tab deleted successfully'
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
  getAllTabs,
  getTab,
  createTab,
  updateTab,
  deleteTab
};
