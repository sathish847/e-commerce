const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  items: [wishlistItemSchema],
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
wishlistSchema.index({ userEmail: 1 });

// Update the updatedAt field before saving
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find or create wishlist for user
wishlistSchema.statics.findOrCreateByEmail = async function(userEmail) {
  let wishlist = await this.findOne({ userEmail: userEmail.toLowerCase().trim() });
  if (!wishlist) {
    wishlist = new this({ userEmail: userEmail.toLowerCase().trim() });
    await wishlist.save();
  }
  return wishlist;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
