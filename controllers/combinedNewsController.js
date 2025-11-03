const MainNews = require('../models/MainNews');
const News = require('../models/News');
const SubNews = require('../models/SubNews');
const MiniNews = require('../models/MiniNews');
const TrendingNews = require('../models/TrendingNews');

// Get all news from all models combined (optimized for speed)
const getAllCombinedNews = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Default 50 items per page
    const skip = (page - 1) * limit;

    // Fetch all active news from each model, selecting only needed fields
    const [mainNews, news, subNews, miniNews, trendingNews] = await Promise.all([
      MainNews.find({ isActive: true }).select('_id slug title excerpt content date time paragraphs videoUrl category tags isActive createdAt updatedAt thumb images.filename images.originalName images.mimetype images.size images.uploadedAt').sort({ createdAt: -1 }).lean(),
      News.find({ isActive: true }).select('_id slug title excerpt content date time paragraphs videoUrl category tags isActive createdAt updatedAt thumb images.filename images.originalName images.mimetype images.size images.uploadedAt').sort({ createdAt: -1 }).lean(),
      SubNews.find({ isActive: true }).select('_id slug title excerpt content date time paragraphs videoUrl category tags isActive createdAt updatedAt thumb images.filename images.originalName images.mimetype images.size images.uploadedAt').sort({ createdAt: -1 }).lean(),
      MiniNews.find({ isActive: true }).select('_id slug title excerpt content date time paragraphs videoUrl category tags isActive createdAt updatedAt thumb images.filename images.originalName images.mimetype images.size images.uploadedAt').sort({ createdAt: -1 }).lean(),
      TrendingNews.find({ isActive: true }).select('_id slug title excerpt content date time paragraphs videoUrl category tags isActive createdAt updatedAt thumb images.filename images.originalName images.mimetype images.size images.uploadedAt').sort({ createdAt: -1 }).lean()
    ]);

    // Combine all news with type indicators
    const combinedNews = [
      ...mainNews.map(item => ({ ...item, newsType: 'main' })),
      ...news.map(item => ({ ...item, newsType: 'regular' })),
      ...subNews.map(item => ({ ...item, newsType: 'sub' })),
      ...miniNews.map(item => ({ ...item, newsType: 'mini' })),
      ...trendingNews.map(item => ({ ...item, newsType: 'trending' }))
    ];

    // Sort combined news by createdAt date (most recent first)
    combinedNews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const totalCount = combinedNews.length;
    const paginatedData = combinedNews.slice(skip, skip + limit);

    // Return response
    res.json({
      success: true,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: paginatedData,
      breakdown: {
        main: mainNews.length,
        regular: news.length,
        sub: subNews.length,
        mini: miniNews.length,
        trending: trendingNews.length
      }
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
  getAllCombinedNews
};
