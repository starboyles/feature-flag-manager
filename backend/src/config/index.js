// src/config/index.js
require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  mongoURI: process.env.MONGODB_URL,
  mongoURITest: process.env.MONGODB_URL_TEST,
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};