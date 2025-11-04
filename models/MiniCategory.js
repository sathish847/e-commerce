const mongoose = require('mongoose');

const miniCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    required: true,
    trim: true
  },
  sortOrder: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    trim: true
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

// Compound index to ensure unique mini category names within the same category and subcategory
miniCategorySchema.index({ name: 1, category: 1, subCategory: 1 }, { unique: true });

// Update the updatedAt field before saving
miniCategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MiniCategory', miniCategorySchema);
