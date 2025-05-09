// src/routes/sdk.routes.js
const express = require('express');
const { body } = require('express-validator');
const sdkController = require('../controllers/sdk.controller');
const { verifyApiKey } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes with API key
router.use('/:environment', verifyApiKey);

// Get all flags for client
router.get('/:environment/flags', sdkController.getClientFlags);

// Evaluate a flag
router.post(
  '/:environment/evaluate',
  [
    body('flagKey')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Flag key is required')
  ],
  sdkController.evaluateFlag
);

module.exports = router;