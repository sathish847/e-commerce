const mongoose = require('mongoose');
const Counter = require('./Counter');

const bannerSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  backgroundImage: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sortOrder: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  isActive: {
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
bannerSchema.pre('save', async function(next) {
  try {
    // Only increment if this is a new document
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'bannerId' },
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

module.exports = mongoose.model('Banner', bannerSchema);