const TrendingNews = require('../models/TrendingNews');
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

// Get all trending news articles
const getAllTrendingNews = async (req, res) => {
  try {
    const trendingNews = await TrendingNews.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: trendingNews.length,
      data: trendingNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all deleted trending news articles
const getDeletedTrendingNews = async (req, res) => {
  try {
    const trendingNews = await TrendingNews.find({ isActive: false })
      .sort({ updatedAt: -1 });
    res.json({
      success: true,
      count: trendingNews.length,
      data: trendingNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single trending news article
const getTrendingNews = async (req, res) => {
  try {
    const trendingNews = await TrendingNews.findById(req.params.id);
    if (!trendingNews) {
      return res.status(404).json({
        success: false,
        message: 'TrendingNews article not found'
      });
    }
    res.json({
      success: true,
      data: trendingNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get trending news by slug
const getTrendingNewsBySlug = async (req, res) => {
  try {
    const trendingNews = await TrendingNews.findOne({
      slug: req.params.slug,
      isActive: true
    });
    if (!trendingNews) {
      return res.status(404).json({
        success: false,
        message: 'TrendingNews article not found'
      });
    }
    res.json({
      success: true,
      data: trendingNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create trending news article
const createTrendingNews = async (req, res) => {
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
    const existingTrendingNews = await TrendingNews.findOne({ slug });
    if (existingTrendingNews) {
      return res.status(400).json({
        success: false,
        message: 'TrendingNews article with this slug already exists'
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

    const trendingNews = new TrendingNews({
      slug,
      thumb: processedThumb,
      title,
      excerpt,
      date,
      time,
      paragraphs: paragraphs ? (Array.isArray(paragraphs) ? paragraphs : [paragraphs]) : [],
      videoUrl
    });

    await trendingNews.save();

    res.status(201).json({
      success: true,
      message: 'TrendingNews article created successfully',
      data: trendingNews
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'TrendingNews article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update trending news article (supports partial updates - only provided fields are updated)
const updateTrendingNews = async (req, res) => {
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

    const trendingNews = await TrendingNews.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!trendingNews) {
      return res.status(404).json({
        success: false,
        message: 'TrendingNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'TrendingNews article updated successfully',
      data: trendingNews
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'TrendingNews article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete trending news article (soft delete by setting isActive to false)
const deleteTrendingNews = async (req, res) => {
  try {
    const trendingNews = await TrendingNews.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!trendingNews) {
      return res.status(404).json({
        success: false,
        message: 'TrendingNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'TrendingNews article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Hard delete trending news article (permanent deletion)
const hardDeleteTrendingNews = async (req, res) => {
  try {
    const trendingNews = await TrendingNews.findByIdAndDelete(req.params.id);

    if (!trendingNews) {
      return res.status(404).json({
        success: false,
        message: 'TrendingNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'TrendingNews article permanently deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get thumbnail by trending news ID
const getTrendingNewsThumb = async (req, res) => {
  try {
    const { id } = req.params;
    const trendingNews = await TrendingNews.findById(id);

    if (!trendingNews || !trendingNews.thumb) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    const thumb = trendingNews.thumb;

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
  getAllTrendingNews,
  getDeletedTrendingNews,
  getTrendingNews,
  getTrendingNewsBySlug,
  createTrendingNews,
  updateTrendingNews,
  deleteTrendingNews,
  hardDeleteTrendingNews,
  getTrendingNewsThumb,
  uploadFields
};
