const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Use aggregation pipeline for better performance - filter active products at database level
    const cart = await Cart.aggregate([
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

    if (!cart || cart.length === 0 || !cart[0].items || cart[0].items.length === 0) {
      return res.json({
        success: true,
        count: 0,
        items: [],
        totals: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
          totalItems: 0
        }
      });
    }

    // Calculate discounted prices and totals
    const itemsWithDiscount = cart[0].items.map(item => {
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

    // Calculate totals efficiently
    let subtotal = 0;
    let totalItems = 0;

    itemsWithDiscount.forEach(item => {
      const price = item.productId.discountedPrice;
      subtotal += price * item.quantity;
      totalItems += item.quantity;
    });

    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    const totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100,
      totalItems
    };

    res.json({
      success: true,
      count: itemsWithDiscount.length,
      items: itemsWithDiscount,
      totals
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
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

    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 99'
      });
    }

    const productIdNum = parseInt(productId);

    // Find product with status and stock validation in one query
    const product = await Product.findOne({
      id: productIdNum,
      status: true,
      stock: { $gte: quantity }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found, not available, or insufficient stock'
      });
    }

    // Use atomic update to add or update cart item
    const result = await Cart.findOneAndUpdate(
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

    let newQuantity = quantity;
    if (existingItemIndex > -1) {
      // Update existing item
      newQuantity = result.items[existingItemIndex].quantity + quantity;

      if (newQuantity > 99) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 99 items allowed per product'
        });
      }

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }

      result.items[existingItemIndex].quantity = newQuantity;
      result.items[existingItemIndex].updatedAt = new Date();
    } else {
      // Add new item
      result.items.push({
        productId: product._id,
        quantity,
        addedAt: new Date(),
        updatedAt: new Date()
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
      quantity: newQuantity,
      addedAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate cart count efficiently
    const cartCount = result.items.reduce((total, item) => {
      // We need to check if product is still active, but for count we can approximate
      // In a real scenario, you might want to filter by active products
      return total + item.quantity;
    }, 0);

    res.status(201).json({
      success: true,
      message: existingItemIndex > -1 ? 'Cart item quantity updated successfully' : 'Item added to cart successfully',
      data: responseItem,
      cartCount
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { productId } = req.params; // This is the frontend product ID (number)
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 99'
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

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    const cart = await Cart.findOne({ userEmail });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item by MongoDB _id
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === product._id.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].updatedAt = new Date();

    await cart.save();

    // Populate product details for response
    await cart.populate({
      path: 'items.productId',
      select: 'id sku name price discount image shortDescription stock status'
    });

    const updatedItem = cart.items[itemIndex];
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

    // Calculate updated totals
    const cartInstance = new Cart({ items: cart.items });
    await cartInstance.populate('items.productId');
    const totals = cartInstance.calculateTotals();

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: responseItem,
      cartCount: totals.totalItems
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
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

    const cart = await Cart.findOne({ userEmail });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item by MongoDB _id
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === product._id.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Calculate updated totals
    const cartInstance = new Cart({ items: cart.items });
    await cartInstance.populate('items.productId');
    const totals = cartInstance.calculateTotals();

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cartCount: totals.totalItems
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await Cart.findOneAndUpdate(
      { userEmail },
      { $set: { items: [] } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cartCount: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get cart item count
const getCartCount = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Use aggregation pipeline for efficient count calculation
    const result = await Cart.aggregate([
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
          validItems: {
            $filter: {
              input: {
                $map: {
                  input: '$items',
                  as: 'item',
                  in: {
                    $mergeObjects: [
                      '$$item',
                      {
                        productStatus: {
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
                  { $eq: ['$$item.productStatus.status', true] }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          count: {
            $sum: '$validItems.quantity'
          }
        }
      }
    ]);

    const count = result.length > 0 ? result[0].count : 0;

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
};
