const mongoose = require('mongoose');

const mainNewsSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  thumb: {
    filename: {
      type: String,
      trim: true
    },
    originalName: {
      type: String,
      trim: true
    },
    mimetype: {
      type: String,
      trim: true
    },
    size: {
      type: Number
    },
    data: {
      type: Buffer
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  paragraphs: [{
    type: String,
    trim: true
  }],
  // images: [{
  //   filename: {
  //     type: String,
  //     trim: true
  //   },
  //   originalName: {
  //     type: String,
  //     trim: true
  //   },
  //   mimetype: {
  //     type: String,
  //     trim: true
  //   },
  //   size: {
  //     type: Number
  //   },
  //   data: {
  //     type: Buffer
  //   },
  //   uploadedAt: {
  //     type: Date,
  //     default: Date.now
  //   }
  // }],
  videoUrl: {
    type: String,
    trim: true
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

// Update the updatedAt field before saving
mainNewsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
mainNewsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index for better query performance
mainNewsSchema.index({ isActive: 1, createdAt: -1 });
mainNewsSchema.index({ slug: 1 });

module.exports = mongoose.model('MainNews', mainNewsSchema);
