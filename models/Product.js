const mongoose = require('mongoose');
const Counter = require('./Counter');

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  new: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  saleCount: {
    type: Number,
    default: 0,
    min: 0
  },
  category: [{
    type: String,
    trim: true
  }],
  tag: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: [{
    type: String,
    trim: true
  }],
  shortDescription: {
    type: String,
    trim: true
  },
  fullDescription: {
    type: String,
    trim: true
  },
  status: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-increment id and update the updatedAt field before saving
productSchema.pre('save', async function(next) {
  try {
    // Only increment if this is a new document
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'productId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.sequence_value;
    }
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Product', productSchema);
