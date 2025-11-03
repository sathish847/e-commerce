const MainNews = require('../models/MainNews');
const multer = require('multer');

// Configure multer for memory storage (to store files in MongoDB)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 1 // Maximum 1 file (thumb only)
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Export multer middleware for use in routes
const uploadFields = upload.any();

// Get all main news articles
const getAllMainNews = async (req, res) => {
  try {
    const mainNews = await MainNews.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: mainNews.length,
      data: mainNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all deleted main news articles
const getDeletedMainNews = async (req, res) => {
  try {
    const mainNews = await MainNews.find({ isActive: false })
      .sort({ updatedAt: -1 });
    res.json({
      success: true,
      count: mainNews.length,
      data: mainNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single main news article
const getMainNews = async (req, res) => {
  try {
    const mainNews = await MainNews.findById(req.params.id);
    if (!mainNews) {
      return res.status(404).json({
        success: false,
        message: 'MainNews article not found'
      });
    }
    res.json({
      success: true,
      data: mainNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};



// Get main news by slug
const getMainNewsBySlug = async (req, res) => {
  try {
    const mainNews = await MainNews.findOne({
      slug: req.params.slug,
      isActive: true
    });
    if (!mainNews) {
      return res.status(404).json({
        success: false,
        message: 'MainNews article not found'
      });
    }
    res.json({
      success: true,
      data: mainNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create main news article
const createMainNews = async (req, res) => {
  try {
    const {
      slug,
      title,
      excerpt,
      date,
      time,
      paragraphs,
      videoUrl
    } = req.body;

    // Check if slug already exists
    const existingMainNews = await MainNews.findOne({ slug });
    if (existingMainNews) {
      return res.status(400).json({
        success: false,
        message: 'MainNews article with this slug already exists'
      });
    }

    // Process uploaded files - only thumb
    let processedThumb = null;

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'thumb') {
          // Process thumbnail
          processedThumb = {
            filename: file.filename || `${Date.now()}-thumb-${file.originalname}`,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            data: file.buffer,
            uploadedAt: new Date()
          };
        }
      });
    }

    const mainNews = new MainNews({
      slug,
      thumb: processedThumb,
      title,
      excerpt,
      date,
      time,
      paragraphs: paragraphs ? (Array.isArray(paragraphs) ? paragraphs : [paragraphs]) : [],
      videoUrl
    });

    await mainNews.save();

    res.status(201).json({
      success: true,
      message: 'MainNews article created successfully',
      data: mainNews
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'MainNews article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update main news article (supports partial updates - only provided fields are updated)
const updateMainNews = async (req, res) => {
  try {
    const allowedFields = [
      'slug', 'thumb', 'title',
      'excerpt', 'date', 'time', 'paragraphs', 'videoUrl', 'isActive'
    ];

    // Build update object with only provided fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // If no valid fields provided, return error
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const mainNews = await MainNews.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!mainNews) {
      return res.status(404).json({
        success: false,
        message: 'MainNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'MainNews article updated successfully',
      data: mainNews
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'MainNews article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete main news article (soft delete by setting isActive to false)
const deleteMainNews = async (req, res) => {
  try {
    const mainNews = await MainNews.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!mainNews) {
      return res.status(404).json({
        success: false,
        message: 'MainNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'MainNews article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Hard delete main news article (permanent deletion)
const hardDeleteMainNews = async (req, res) => {
  try {
    const mainNews = await MainNews.findByIdAndDelete(req.params.id);

    if (!mainNews) {
      return res.status(404).json({
        success: false,
        message: 'MainNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'MainNews article permanently deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get thumbnail by main news ID
const getMainNewsThumb = async (req, res) => {
  try {
    const { id } = req.params;
    const mainNews = await MainNews.findById(id);

    if (!mainNews || !mainNews.thumb) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    const thumb = mainNews.thumb;

    // Set appropriate headers
    res.set({
      'Content-Type': thumb.mimetype,
      'Content-Length': thumb.size,
      'Content-Disposition': `inline; filename="${thumb.originalName}"`
    });

    // Send the thumbnail buffer
    res.send(thumb.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAllMainNews,
  getDeletedMainNews,
  getMainNews,
  getMainNewsBySlug,
  createMainNews,
  updateMainNews,
  deleteMainNews,
  hardDeleteMainNews,
  getMainNewsThumb,
  uploadFields
};
