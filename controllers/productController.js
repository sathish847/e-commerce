const Product = require('../models/Product');
const multer = require('multer');

// Configure multer for memory storage (to convert to base64)
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files
  }
});

// Get all products (public - only active)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all products for admin (including inactive)
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: { $in: [new RegExp(`^${req.params.categoryName}$`, 'i')] },
      status: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get products by tag
const getProductsByTag = async (req, res) => {
  try {
    const products = await Product.find({
      tag: { $in: [new RegExp(`^${req.params.tagName}$`, 'i')] },
      status: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create product with form-data and file uploads
const createProduct = (req, res) => {
  // Use multer upload middleware
  upload.array('images', 10)(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB per file.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 images allowed.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      // Extract form fields
      const {
        sku,
        name,
        price,
        discount,
        new: isNew,
        rating,
        saleCount,
        category,
        tag,
        stock,
        shortDescription,
        fullDescription,
        status
      } = req.body;

      // Validate required fields
      if (!sku || !name || !price || !stock) {
        return res.status(400).json({
          success: false,
          message: 'SKU, name, price, and stock are required fields'
        });
      }

      // Check if SKU already exists
      const existingProduct = await Product.findOne({
        sku: { $regex: new RegExp(`^${sku}$`, 'i') }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }

      // Process uploaded files to base64 strings
      let imageBase64Array = [];
      if (req.files && req.files.length > 0) {
        imageBase64Array = req.files.map(file => {
          // Convert buffer to base64
          const base64 = file.buffer.toString('base64');
          return `data:${file.mimetype};base64,${base64}`;
        });
      }

      // Parse array fields (they come as strings from form-data)
      let categoryArray = [];
      let tagArray = [];

      if (category) {
        categoryArray = Array.isArray(category) ? category : category.split(',').map(c => c.trim());
      }

      if (tag) {
        tagArray = Array.isArray(tag) ? tag : tag.split(',').map(t => t.trim());
      }

      const product = new Product({
        sku: sku.trim(),
        name: name.trim(),
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : 0,
        new: isNew === 'true' || isNew === true,
        rating: rating ? parseFloat(rating) : 0,
        saleCount: saleCount ? parseInt(saleCount) : 0,
        category: categoryArray,
        tag: tagArray,
        stock: parseInt(stock),
        image: imageBase64Array,
        shortDescription: shortDescription ? shortDescription.trim() : '',
        fullDescription: fullDescription ? fullDescription.trim() : '',
        status: status !== 'false' && status !== false
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  });
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      price,
      discount,
      new: isNew,
      rating,
      saleCount,
      category,
      tag,
      stock,
      image,
      shortDescription,
      fullDescription,
      status
    } = req.body;

    // Check if SKU is being updated and if it conflicts
    if (sku) {
      const existingProduct = await Product.findOne({
        sku: { $regex: new RegExp(`^${sku}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        sku,
        name,
        price,
        discount,
        new: isNew,
        rating,
        saleCount,
        category,
        tag,
        stock,
        image,
        shortDescription,
        fullDescription,
        status
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
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
  getAllProducts,
  getAllProductsAdmin,
  getProduct,
  getProductsByCategory,
  getProductsByTag,
  createProduct,
  updateProduct,
  deleteProduct
};
