// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');

/**
 * Register a new user
 */
exports.register = async (userData) => {
  const { name, email, password } = userData;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password
  });
  
  // Generate token
  const token = generateToken(user._id);
  
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

/**
 * Login user
 */
exports.login = async (email, password) => {
  // Check if email and password exists
  if (!email || !password) {
    const error = new Error('Please provide email and password');
    error.statusCode = 400;
    throw error;
  }
  
  // Find user in database
  const user = await User.findOne({ email }).select('+password');
  
  // Check if user exists
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }
  
  // Check if password matches
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }
  
  // Generate token
  const token = generateToken(user._id);
  
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

/**
 * Get current user profile
 */
exports.getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};