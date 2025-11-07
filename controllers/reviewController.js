const Review = require('../models/Review');
const Product = require('../models/Product');

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get reviews for a specific product
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product by frontend ID to get its ObjectId
    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const reviews = await Review.find({ productId: product._id })
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      count: reviews.length,
      averageRating: parseFloat(averageRating),
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single review
const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('productId', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create review
const createReview = async (req, res) => {
  try {
    const { name, email, message, productId, rating } = req.body;

    // Validate product exists (using frontend product ID)
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ email, productId: product._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = new Review({
      name,
      email,
      message,
      productId: product._id, // Store the ObjectId
      productName: product.name, // Store the product name
      rating
    });

    await review.save();

    // Calculate and update product rating
    const allReviews = await Review.find({ productId: product._id });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    // Update product rating
    await Product.findByIdAndUpdate(product._id, {
      rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
    });

    // Populate product info
    await review.populate('productId', 'name');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;

    // Get the review before updating to know which product it belongs to
    const existingReview = await Review.findById(req.params.id);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { name, email, message, rating },
      { new: true, runValidators: true }
    ).populate('productId', 'name');

    // Recalculate and update product rating
    const allReviews = await Review.find({ productId: existingReview.productId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    await Product.findByIdAndUpdate(existingReview.productId, {
      rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    // Get the review before deleting to know which product it belongs to
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const productId = review.productId;

    // Delete the review
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate and update product rating
    const allReviews = await Review.find({ productId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAllReviews,
  getReviewsByProduct,
  getReview,
  createReview,
  updateReview,
  deleteReview
};
