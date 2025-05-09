// src/controllers/auth.controller.js
const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Register user
    const result = await authService.register(req.body);
    
    // Return response
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Login user
    const result = await authService.login(email, password);
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // Get current user
    const user = await authService.getCurrentUser(req.user._id);
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};