// src/routes/auth.routes.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Register new user
router.post(
  '/register',
  [
    body('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Name is required')
      .isLength({ max: 50 })
      .withMessage('Name cannot be more than 50 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Password is required')
  ],
  authController.login
);

// Get current user
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;