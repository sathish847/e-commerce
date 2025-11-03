const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// CORS configuration - allow all origins for multiple frontend URLs
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow all origins with *
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

// Rate limiting - limit requests per window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Prevent parameter pollution
app.use(hpp());

// XSS Protection Middleware
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const xssSanitize = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = purify.sanitize(req.body[key], { ALLOWED_TAGS: [] });
      }
    }
  }

  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = purify.sanitize(req.query[key], { ALLOWED_TAGS: [] });
      }
    }
  }

  // Sanitize route parameters
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = purify.sanitize(req.params[key], { ALLOWED_TAGS: [] });
      }
    }
  }

  next();
};

app.use(xssSanitize); // XSS protection

app.use(compression()); // Response compression
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/express-backend')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    secure: req.secure
  });
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
  console.log(`HTTP Server is running on port ${PORT}`);
});

// Start HTTPS server (if certificates exist)
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

module.exports = app;
