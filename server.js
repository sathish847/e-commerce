const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const DOMPurify = require('isomorphic-dompurify');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Passport
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// CORS configuration - allow all origins
const corsOptions = {
  origin: '*', // Allow all origins
  credentials: false, // Must be false when using * origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Authorization']
};

// Security middleware
app.use(helmet()); // Security headers

// Rate limiting - limit requests per window (commented out for development)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api/', limiter);

// Prevent parameter pollution
app.use(hpp());

app.use(compression()); // Response compression
app.use(cors(corsOptions));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS Protection Middleware
const xssSanitize = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key], { ALLOWED_TAGS: [] });
      }
    }
  }

  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = DOMPurify.sanitize(req.query[key], { ALLOWED_TAGS: [] });
      }
    }
  }

  // Sanitize route parameters
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = DOMPurify.sanitize(req.params[key], { ALLOWED_TAGS: [] });
      }
    }
  }

  next();
};

app.use(xssSanitize); // XSS protection

// MongoDB connection with proper options
const mongooseOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  heartbeatFrequencyMS: 10000, // Send heartbeats every 10 seconds
  minPoolSize: 2 // Minimum number of connections in pool
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/express-backend', mongooseOptions)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Close the Mongoose connection when the app is terminated
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

// Import cache middleware
const { httpCacheMiddleware } = require('./middleware/cache');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const publicCategoryRoutes = require('./routes/publicCategories');
const subCategoryRoutes = require('./routes/subCategories');
const publicSubCategoryRoutes = require('./routes/publicSubCategories');
const miniCategoryRoutes = require('./routes/miniCategories');
const publicMiniCategoryRoutes = require('./routes/publicMiniCategories');
const productRoutes = require('./routes/products');
const tabRoutes = require('./routes/tabs');
const publicTabRoutes = require('./routes/publicTabs');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');
const heroSliderRoutes = require('./routes/heroSliders');
const publicHeroSliderRoutes = require('./routes/publicHeroSliders');
const bannerRoutes = require('./routes/banners');
const publicBannerRoutes = require('./routes/publicBanners');
const publicProductRoutes = require('./routes/publicProducts');
const reviewRoutes = require('./routes/reviews');

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Express Backend API',
    secure: req.secure,
    protocol: req.protocol
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/public/categories', httpCacheMiddleware(600), publicCategoryRoutes); // 10 minutes cache
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/public/subcategories', httpCacheMiddleware(600), publicSubCategoryRoutes);
app.use('/api/minicategories', miniCategoryRoutes);
app.use('/api/public/minicategories', httpCacheMiddleware(600), publicMiniCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tabs', tabRoutes);
app.use('/api/public/tabs', httpCacheMiddleware(600), publicTabRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/herosliders', heroSliderRoutes);
app.use('/api/public/herosliders', httpCacheMiddleware(300), publicHeroSliderRoutes); // 5 minutes cache
app.use('/api/banners', bannerRoutes);
app.use('/api/public/banners', httpCacheMiddleware(300), publicBannerRoutes);
app.use('/api/public/products', httpCacheMiddleware(180), publicProductRoutes); // 3 minutes cache

app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      status: dbState === 1 ? 'OK' : 'Database connection issue',
      timestamp: new Date().toISOString(),
      secure: req.secure,
      database: {
        status: dbStatus[dbState],
        name: mongoose.connection.name,
        host: mongoose.connection.host
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    message: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start HTTPS server only in development (if certificates exist)
if (process.env.NODE_ENV !== 'production') {
  try {
    const sslKeyPath = path.join(__dirname, 'ssl', 'key.pem');
    const sslCertPath = path.join(__dirname, 'ssl', 'cert.pem');

    if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
      const sslOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
      };

      const httpsServer = https.createServer(sslOptions, app);
      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
      });
    } else {
      console.log('SSL certificates not found. HTTPS server not started.');
      console.log('To enable HTTPS, place key.pem and cert.pem in the ssl/ directory');
    }
  } catch (error) {
    console.error('Error starting HTTPS server:', error.message);
  }
}

module.exports = app;
