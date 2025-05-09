// src/routes/project.routes.js
const express = require('express');
const { body, param } = require('express-validator');
const projectController = require('../controllers/project.controller');
const { protect, checkProjectAccess, checkProjectRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all user projects
router.get('/', projectController.getUserProjects);

// Create new project
router.post(
  '/',
  [
    body('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Project name is required')
      .isLength({ max: 100 })
      .withMessage('Project name cannot be more than 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot be more than 500 characters'),
    body('environments')
      .optional()
      .isArray()
      .withMessage('Environments must be an array')
  ],
  projectController.createProject
);

// Get project by ID
router.get(
  '/:projectId',
  checkProjectAccess,
  projectController.getProjectById
);

// Update project
router.put(
  '/:projectId',
  [
    body('name')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Project name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Project name cannot be more than 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot be more than 500 characters')
  ],
  checkProjectAccess,
  checkProjectRole('admin', 'editor'),
  projectController.updateProject
);

// Delete project
router.delete(
  '/:projectId',
  checkProjectAccess,
  checkProjectRole('admin'),
  projectController.deleteProject
);

// Add environment
router.post(
  '/:projectId/environments',
  [
    body('environment')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Environment name is required')
      .isLength({ max: 50 })
      .withMessage('Environment name cannot be more than 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Environment name can only contain letters, numbers, dashes, and underscores')
  ],
  checkProjectAccess,
  checkProjectRole('admin'),
  projectController.addEnvironment
);

// Remove environment
router.delete(
  '/:projectId/environments/:environment',
  checkProjectAccess,
  checkProjectRole('admin'),
  projectController.removeEnvironment
);

// Regenerate API key
router.post(
  '/:projectId/environments/:environment/regenerate-key',
  checkProjectAccess,
  checkProjectRole('admin'),
  projectController.regenerateApiKey
);

// Add project member
router.post(
  '/:projectId/members',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('role')
      .trim()
      .isIn(['viewer', 'editor', 'admin'])
      .withMessage('Role must be one of: viewer, editor, admin')
  ],
  checkProjectAccess,
  checkProjectRole('admin'),
  projectController.addProjectMember
);

// Update member role
router.put(
  '/:projectId/members/:memberId',
  [
    body('role')
      .trim()
      .isIn(['viewer', 'editor', 'admin'])
      .withMessage('Role must be one of: viewer, editor, admin')
  ],
  checkProjectAccess,
  checkProjectRole('admin'),
  projectController.updateMemberRole
);

// Remove member
router.delete(
  '/:projectId/members/:memberId',
  checkProjectAccess,
  checkProjectRole('admin'),
  projectController.removeMember
);

module.exports = router;