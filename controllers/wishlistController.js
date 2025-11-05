const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const wishlist = await Wishlist.findOne({ userEmail })
      .populate({
        path: 'items.productId',
        select: 'id sku name price discount image shortDescription stock status'
      })
      .lean();

    if (!wishlist) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Filter out items where product is not found or inactive
    const validItems = wishlist.items.filter(item =>
      item.productId && item.productId.status === true
    );

    // Calculate discounted price for each item
    const itemsWithDiscount = validItems.map(item => {
      const product = item.productId;
      const discountedPrice = product.discount > 0
        ? product.price - (product.price * product.discount / 100)
        : product.price;

      return {
        ...item,
        productId: {
          ...product,
          discountedPrice: Math.round(discountedPrice * 100) / 100
        }
      };
    });

    res.json({
      success: true,
      count: itemsWithDiscount.length,
      data: itemsWithDiscount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { productId, quantity = 1 } = req.body;

    // Validate required fields
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Find product by the auto-incremented id field (not MongoDB _id)
    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.status) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ userEmail });

    if (!wishlist) {
      wishlist = new Wishlist({ userEmail, items: [] });
    }

    // Check if product already exists in wishlist (compare MongoDB _id)
    const existingItemIndex = wishlist.items.findIndex(
      item => item.productId.toString() === product._id.toString()
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      wishlist.items[existingItemIndex].quantity = quantity;
      wishlist.items[existingItemIndex].addedAt = new Date();
    } else {
      // Add new item to wishlist using MongoDB _id
      wishlist.items.push({
        productId: product._id,
        quantity,
        addedAt: new Date()
      });
    }

    await wishlist.save();

    // Populate product details for response
    await wishlist.populate({
      path: 'items.productId',
      select: 'id sku name price discount image shortDescription stock status'
    });

    // Get the added/updated item
    const updatedItem = wishlist.items.find(
      item => item.productId._id.toString() === product._id.toString()
    );

    const discountedPrice = updatedItem.productId.discount > 0
      ? updatedItem.productId.price - (updatedItem.productId.price * updatedItem.productId.discount / 100)
      : updatedItem.productId.price;

    const responseItem = {
      ...updatedItem.toObject(),
      productId: {
        ...updatedItem.productId.toObject(),
        discountedPrice: Math.round(discountedPrice * 100) / 100
      }
    };

    res.status(201).json({
      success: true,
      message: existingItemIndex > -1 ? 'Wishlist item updated successfully' : 'Item added to wishlist successfully',
      data: responseItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update wishlist item (quantity)
const updateWishlistItem = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { productId } = req.params; // This is the frontend product ID (number)
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Find the product by frontend ID
    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const wishlist = await Wishlist.findOne({ userEmail });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Find item by MongoDB _id
    const itemIndex = wishlist.items.findIndex(
      item => item.productId.toString() === product._id.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    wishlist.items[itemIndex].quantity = quantity;
    wishlist.items[itemIndex].addedAt = new Date();

    await wishlist.save();

    // Populate product details for response
    await wishlist.populate({
      path: 'items.productId',
      select: 'id sku name price discount image shortDescription stock status'
    });

    const updatedItem = wishlist.items[itemIndex];
    const discountedPrice = updatedItem.productId.discount > 0
      ? updatedItem.productId.price - (updatedItem.productId.price * updatedItem.productId.discount / 100)
      : updatedItem.productId.price;

    const responseItem = {
      ...updatedItem.toObject(),
      productId: {
        ...updatedItem.productId.toObject(),
        discountedPrice: Math.round(discountedPrice * 100) / 100
      }
    };

    res.json({
      success: true,
      message: 'Wishlist item updated successfully',
      data: responseItem
    });
  } catch (error) {
    console.error('Update wishlist item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { productId } = req.params; // This is the frontend product ID (number)

    // Find the product by frontend ID
    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const wishlist = await Wishlist.findOne({ userEmail });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Find item by MongoDB _id
    const itemIndex = wishlist.items.findIndex(
      item => item.productId.toString() === product._id.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await Wishlist.findOneAndUpdate(
      { userEmail },
      { $set: { items: [] } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Check if product is in wishlist
const checkWishlistStatus = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { productId } = req.params; // This is the frontend product ID (number)

    // Find the product by frontend ID
    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) {
      return res.json({
        success: true,
        inWishlist: false,
        productId
      });
    }

    // Check if product's MongoDB _id is in wishlist
    const wishlist = await Wishlist.findOne({
      userEmail,
      'items.productId': product._id
    });

    res.json({
      success: true,
      inWishlist: !!wishlist,
      productId
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus
};
