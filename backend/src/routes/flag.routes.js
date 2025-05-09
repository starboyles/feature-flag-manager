// src/routes/flag.routes.js
const express = require('express');
const { body, param } = require('express-validator');
const flagController = require('../controllers/flag.controller');
const { protect, checkProjectAccess, checkProjectRole } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);
router.use(checkProjectAccess);

// Get all flags for project
router.get('/', flagController.getProjectFlags);

// Create new flag
router.post(
  '/',
  [
    body('key')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Flag key is required')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Flag key can only contain letters, numbers, dashes, dots, and underscores')
      .isLength({ max: 100 })
      .withMessage('Flag key cannot be more than 100 characters'),
    body('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Flag name is required')
      .isLength({ max: 100 })
      .withMessage('Flag name cannot be more than 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot be more than 500 characters'),
    body('type')
      .optional()
      .isIn(['BOOLEAN', 'STRING', 'NUMBER', 'JSON'])
      .withMessage('Type must be one of: BOOLEAN, STRING, NUMBER, JSON'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],
  checkProjectRole('admin', 'editor'),
  flagController.createFlag
);

// Get flag by ID
router.get('/:flagId', flagController.getFlagById);

// Update flag
router.put(
  '/:flagId',
  [
    body('name')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Flag name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Flag name cannot be more than 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot be more than 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],
  checkProjectRole('admin', 'editor'),
  flagController.updateFlag
);

// Delete flag
router.delete(
  '/:flagId',
  checkProjectRole('admin'),
  flagController.deleteFlag
);

// Update environment settings
router.put(
  '/:flagId/environments/:environment',
  checkProjectRole('admin', 'editor'),
  flagController.updateEnvironmentSettings
);

// Toggle flag for environment
router.patch(
  '/:flagId/environments/:environment/toggle',
  [
    body('enabled')
      .isBoolean()
      .withMessage('Enabled must be a boolean')
  ],
  checkProjectRole('admin', 'editor'),
  flagController.toggleFlag
);

// Add rule to flag
router.post(
  '/:flagId/environments/:environment/rules',
  [
    body('type')
      .isIn(['PERCENTAGE', 'USER_SEGMENT', 'SCHEDULED', 'DEFAULT'])
      .withMessage('Rule type must be one of: PERCENTAGE, USER_SEGMENT, SCHEDULED, DEFAULT'),
    body('name')
      .if(body('type').not().equals('DEFAULT'))
      .trim()
      .not()
      .isEmpty()
      .withMessage('Rule name is required for non-DEFAULT rules'),
    body('priority')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Priority must be a non-negative integer'),
    body('value')
      .exists()
      .withMessage('Rule value is required')
  ],
  checkProjectRole('admin', 'editor'),
  flagController.addFlagRule
);

// Update rule
router.put(
  '/:flagId/environments/:environment/rules/:ruleId',
  [
    body('name')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Rule name cannot be empty'),
    body('priority')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Priority must be a non-negative integer'),
    body('value')
      .optional()
  ],
  checkProjectRole('admin', 'editor'),
  flagController.updateRule
);

// Delete rule
router.delete(
  '/:flagId/environments/:environment/rules/:ruleId',
  checkProjectRole('admin', 'editor'),
  flagController.deleteRule
);

// Add variation
router.post(
  '/:flagId/environments/:environment/variations',
  [
    body('key')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Variation key is required'),
    body('value')
      .exists()
      .withMessage('Variation value is required'),
    body('description')
      .optional()
      .trim()
  ],
  checkProjectRole('admin', 'editor'),
  flagController.addVariation
);

// Update variation
router.put(
  '/:flagId/environments/:environment/variations/:key',
  [
    body('value')
      .optional(),
    body('description')
      .optional()
      .trim()
  ],
  checkProjectRole('admin', 'editor'),
  flagController.updateVariation
);

// Delete variation
router.delete(
  '/:flagId/environments/:environment/variations/:key',
  checkProjectRole('admin', 'editor'),
  flagController.deleteVariation
);

// Set default variation
router.put(
  '/:flagId/environments/:environment/variations/:key/default',
  checkProjectRole('admin', 'editor'),
  flagController.setDefaultVariation
);

module.exports = router;