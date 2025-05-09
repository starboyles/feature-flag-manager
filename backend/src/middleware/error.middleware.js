// src/middleware/error.middleware.js
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Global error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    err.message = Object.values(err.errors).map(val => val.message).join(', ');
    err.statusCode = 400;
  }
  
  if (err.code === 11000) {
    // Mongoose duplicate key error
    const field = Object.keys(err.keyValue)[0];
    err.message = `Duplicate field value: ${field}. Please use another value`;
    err.statusCode = 400;
  }
  
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token. Please log in again';
    err.statusCode = 401;
  }
  
  if (err.name === 'TokenExpiredError') {
    err.message = 'Your token has expired. Please log in again';
    err.statusCode = 401;
  }

  // Development error response (with stack trace)
  if (config.nodeEnv === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  
  // Production error response (without stack trace)
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

module.exports = errorMiddleware;