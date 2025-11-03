const News = require('../models/News');
const multer = require('multer');

// Configure multer for memory storage (to store files in MongoDB)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 11 // Maximum 11 files (1 thumb + 10 images)
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

// Get all news articles
const getAllNews = async (req, res) => {
  try {
    const news = await News.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all deleted news articles
const getDeletedNews = async (req, res) => {
  try {
    const news = await News.find({ isActive: false })
      .sort({ updatedAt: -1 });
    res.json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single news article
const getNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get news by category
const getNewsByCategory = async (req, res) => {
  try {
    const news = await News.find({
      category: req.params.categoryId,
      isActive: true
    })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get news by slug
const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({
      slug: req.params.slug,
      isActive: true
    });
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create news article
const createNews = async (req, res) => {
  try {
    const {
      page,
      category,
      slug,
      tag,
      title,
      excerpt,
      date,
      time,
      paragraphs,
      videoUrl
    } = req.body;

    // Check if slug already exists
    const existingNews = await News.findOne({ slug });
    if (existingNews) {
      return res.status(400).json({
        success: false,
        message: 'News article with this slug already exists'
      });
    }

    // Process uploaded files - separate thumb from images
    let processedThumb = null;
    let processedImages = [];

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
        } else if (file.fieldname === 'images') {
          // Process images
          processedImages.push({
            filename: file.filename || `${Date.now()}-${file.originalname}`,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            data: file.buffer,
            uploadedAt: new Date()
          });
        }
      });
    }

    const news = new News({
      page,
      category,
      slug,
      thumb: processedThumb,
      tag,
      title,
      excerpt,
      date,
      time,
      paragraphs: paragraphs ? (Array.isArray(paragraphs) ? paragraphs : [paragraphs]) : [],
      images: processedImages,
      videoUrl
    });

    await news.save();

    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      data: news
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'News article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update news article (supports partial updates - only provided fields are updated)
const updateNews = async (req, res) => {
  try {
    const allowedFields = [
      'page', 'category', 'slug', 'thumb', 'tag', 'title',
      'excerpt', 'date', 'time', 'paragraphs', 'images', 'videoUrl', 'isActive'
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

    const news = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    res.json({
      success: true,
      message: 'News article updated successfully',
      data: news
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'News article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete news article (soft delete by setting isActive to false)
const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    res.json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Hard delete news article (permanent deletion)
const hardDeleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    res.json({
      success: true,
      message: 'News article permanently deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get image by news ID and image index
const getNewsImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const news = await News.findById(id);

    if (!news || !news.images || !news.images[imageIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = news.images[imageIndex];

    // Set appropriate headers
    res.set({
      'Content-Type': image.mimetype,
      'Content-Length': image.size,
      'Content-Disposition': `inline; filename="${image.originalName}"`
    });

    // Send the image buffer
    res.send(image.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get thumbnail by news ID
const getNewsThumb = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news || !news.thumb) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    const thumb = news.thumb;

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
  getAllNews,
  getDeletedNews,
  getNews,
  getNewsByCategory,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  hardDeleteNews,
  getNewsImage,
  getNewsThumb,
  uploadFields
};
