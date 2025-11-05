const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
    max: 99 // Maximum 99 items per product
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
cartSchema.index({ userEmail: 1 });

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Update item timestamps
  this.items.forEach(item => {
    if (item.isModified()) {
      item.updatedAt = new Date();
    }
  });
  next();
});

// Static method to find or create cart for user
cartSchema.statics.findOrCreateByEmail = async function(userEmail) {
  let cart = await this.findOne({ userEmail: userEmail.toLowerCase().trim() });
  if (!cart) {
    cart = new this({ userEmail: userEmail.toLowerCase().trim() });
    await cart.save();
  }
  return cart;
};

// Instance method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  let totalItems = 0;

  this.items.forEach(item => {
    if (item.productId && item.productId.status) {
      const price = item.productId.discount > 0
        ? item.productId.price - (item.productId.price * item.productId.discount / 100)
        : item.productId.price;
      subtotal += price * item.quantity;
      totalItems += item.quantity;
    }
  });

  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
    totalItems
  };
};

module.exports = mongoose.model('Cart', cartSchema);
