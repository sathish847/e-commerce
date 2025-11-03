const SubNews = require('../models/SubNews');
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

// Get all subnews articles
const getAllSubNews = async (req, res) => {
  try {
    const subNews = await SubNews.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: subNews.length,
      data: subNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all deleted subnews articles
const getDeletedSubNews = async (req, res) => {
  try {
    const subNews = await SubNews.find({ isActive: false })
      .sort({ updatedAt: -1 });
    res.json({
      success: true,
      count: subNews.length,
      data: subNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single subnews article
const getSubNews = async (req, res) => {
  try {
    const subNews = await SubNews.findById(req.params.id);
    if (!subNews) {
      return res.status(404).json({
        success: false,
        message: 'SubNews article not found'
      });
    }
    res.json({
      success: true,
      data: subNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get subnews by category
const getSubNewsByCategory = async (req, res) => {
  try {
    const subNews = await SubNews.find({
      category: req.params.categoryId,
      isActive: true
    })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: subNews.length,
      data: subNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};



// Get subnews by slug
const getSubNewsBySlug = async (req, res) => {
  try {
    const subNews = await SubNews.findOne({
      slug: req.params.slug,
      isActive: true
    });
    if (!subNews) {
      return res.status(404).json({
        success: false,
        message: 'SubNews article not found'
      });
    }
    res.json({
      success: true,
      data: subNews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create subnews article
const createSubNews = async (req, res) => {
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
    const existingSubNews = await SubNews.findOne({ slug });
    if (existingSubNews) {
      return res.status(400).json({
        success: false,
        message: 'SubNews article with this slug already exists'
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

    const subNews = new SubNews({
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
      videoUrl
    });

    await subNews.save();

    res.status(201).json({
      success: true,
      message: 'SubNews article created successfully',
      data: subNews
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SubNews article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update subnews article (supports partial updates - only provided fields are updated)
const updateSubNews = async (req, res) => {
  try {
    const allowedFields = [
      'page', 'category', 'slug', 'thumb', 'tag', 'title',
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

    const subNews = await SubNews.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!subNews) {
      return res.status(404).json({
        success: false,
        message: 'SubNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'SubNews article updated successfully',
      data: subNews
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SubNews article with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete subnews article (soft delete by setting isActive to false)
const deleteSubNews = async (req, res) => {
  try {
    const subNews = await SubNews.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!subNews) {
      return res.status(404).json({
        success: false,
        message: 'SubNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'SubNews article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Hard delete subnews article (permanent deletion)
const hardDeleteSubNews = async (req, res) => {
  try {
    const subNews = await SubNews.findByIdAndDelete(req.params.id);

    if (!subNews) {
      return res.status(404).json({
        success: false,
        message: 'SubNews article not found'
      });
    }

    res.json({
      success: true,
      message: 'SubNews article permanently deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};



// Get thumbnail by subnews ID
const getSubNewsThumb = async (req, res) => {
  try {
    const { id } = req.params;
    const subNews = await SubNews.findById(id);

    if (!subNews || !subNews.thumb) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    const thumb = subNews.thumb;

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
  getAllSubNews,
  getDeletedSubNews,
  getSubNews,
  getSubNewsByCategory,
  getSubNewsBySlug,
  createSubNews,
  updateSubNews,
  deleteSubNews,
  hardDeleteSubNews,
  getSubNewsThumb,
  uploadFields
};
