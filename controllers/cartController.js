const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const cart = await Cart.findOne({ userEmail })
      .populate({
        path: 'items.productId',
        select: 'id sku name price discount image shortDescription stock status'
      })
      .lean();

    if (!cart) {
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

    // Filter out items where product is not found or inactive
    const validItems = cart.items.filter(item =>
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

    // Calculate totals
    const cartInstance = new Cart({ items: itemsWithDiscount });
    const totals = cartInstance.calculateTotals();

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

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ userEmail });

    if (!cart) {
      cart = new Cart({ userEmail, items: [] });
    }

    // Check if product already exists in cart (compare MongoDB _id)
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === product._id.toString()
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

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

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].updatedAt = new Date();
    } else {
      // Add new item to cart using MongoDB _id
      cart.items.push({
        productId: product._id,
        quantity,
        addedAt: new Date(),
        updatedAt: new Date()
      });
    }

    await cart.save();

    // Populate product details for response
    await cart.populate({
      path: 'items.productId',
      select: 'id sku name price discount image shortDescription stock status'
    });

    // Get the added/updated item
    const updatedItem = cart.items.find(
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

    // Calculate updated totals
    const cartInstance = new Cart({ items: cart.items });
    await cartInstance.populate('items.productId');
    const totals = cartInstance.calculateTotals();

    res.status(201).json({
      success: true,
      message: existingItemIndex > -1 ? 'Cart item quantity updated successfully' : 'Item added to cart successfully',
      data: responseItem,
      cartCount: totals.totalItems
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

    const cart = await Cart.findOne({ userEmail })
      .populate({
        path: 'items.productId',
        select: 'status'
      })
      .lean();

    if (!cart) {
      return res.json({
        success: true,
        count: 0
      });
    }

    // Count only valid items
    const validItemsCount = cart.items.filter(item =>
      item.productId && item.productId.status === true
    ).reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      count: validItemsCount
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
