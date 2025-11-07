const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Use aggregation pipeline for better performance - filter active products at database level
    const wishlist = await Wishlist.aggregate([
      { $match: { userEmail } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $project: {
          items: {
            $filter: {
              input: {
                $map: {
                  input: '$items',
                  as: 'item',
                  in: {
                    $mergeObjects: [
                      '$$item',
                      {
                        productId: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$productDetails',
                                as: 'product',
                                cond: { $eq: ['$$product._id', '$$item.productId'] }
                              }
                            },
                            0
                          ]
                        }
                      }
                    ]
                  }
                }
              },
              as: 'item',
              cond: {
                $and: [
                  { $ne: ['$$item.productId', null] },
                  { $eq: ['$$item.productId.status', true] }
                ]
              }
            }
          }
        }
      }
    ]);

    if (!wishlist || wishlist.length === 0 || !wishlist[0].items || wishlist[0].items.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Calculate discounted prices
    const itemsWithDiscount = wishlist[0].items.map(item => {
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

    const productIdNum = parseInt(productId);

    // Find product and check if user already has it in wishlist in one query
    const product = await Product.findOne({ id: productIdNum, status: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    // Use atomic update to add or update wishlist item
    const result = await Wishlist.findOneAndUpdate(
      { userEmail },
      {
        $setOnInsert: { userEmail },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Check if product already exists and update or add
    const existingItemIndex = result.items.findIndex(
      item => item.productId.toString() === product._id.toString()
    );

    if (existingItemIndex > -1) {
      // Update existing item
      result.items[existingItemIndex].quantity = quantity;
      result.items[existingItemIndex].addedAt = new Date();
    } else {
      // Add new item
      result.items.push({
        productId: product._id,
        quantity,
        addedAt: new Date()
      });
    }

    await result.save();

    // Create response item with product details (avoid extra populate query)
    const discountedPrice = product.discount > 0
      ? product.price - (product.price * product.discount / 100)
      : product.price;

    const responseItem = {
      productId: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        discount: product.discount,
        image: product.image,
        shortDescription: product.shortDescription,
        stock: product.stock,
        status: product.status,
        discountedPrice: Math.round(discountedPrice * 100) / 100
      },
      quantity,
      addedAt: new Date()
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
