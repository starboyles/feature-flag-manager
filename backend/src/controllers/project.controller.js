// src/controllers/project.controller.js
const { validationResult } = require('express-validator');
const projectService = require('../services/project.service');

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
exports.createProject = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Create project
    const project = await projectService.createProject(req.user._id, req.body);
    
    // Return response
    res.status(201).json({
      status: 'success',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all user projects
 * @route   GET /api/projects
 * @access  Private
 */
exports.getUserProjects = async (req, res, next) => {
  try {
    // Get user projects
    const projects = await projectService.getUserProjects(req.user._id);
    
    // Return response
    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:projectId
 * @access  Private
 */
exports.getProjectById = async (req, res, next) => {
  try {
    // Get project
    const project = await projectService.getProjectById(req.params.projectId);
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:projectId
 * @access  Private
 */
exports.updateProject = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Update project
    const project = await projectService.updateProject(req.params.projectId, req.body);
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:projectId
 * @access  Private
 */
exports.deleteProject = async (req, res, next) => {
  try {
    // Delete project
    await projectService.deleteProject(req.params.projectId);
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add environment to project
 * @route   POST /api/projects/:projectId/environments
 * @access  Private
 */
exports.addEnvironment = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Add environment
    const result = await projectService.addEnvironment(
      req.params.projectId,
      req.body.environment
    );
    
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
 * @desc    Remove environment from project
 * @route   DELETE /api/projects/:projectId/environments/:environment
 * @access  Private
 */
exports.removeEnvironment = async (req, res, next) => {
  try {
    // Remove environment
    await projectService.removeEnvironment(
      req.params.projectId,
      req.params.environment
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Regenerate API key for environment
 * @route   POST /api/projects/:projectId/environments/:environment/regenerate-key
 * @access  Private
 */
exports.regenerateApiKey = async (req, res, next) => {
  try {
    // Regenerate API key
    const result = await projectService.regenerateApiKey(
      req.params.projectId,
      req.params.environment
    );
    
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
 * @desc    Add member to project
 * @route   POST /api/projects/:projectId/members
 * @access  Private
 */
exports.addProjectMember = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Add member
    const result = await projectService.addProjectMember(
      req.params.projectId,
      req.body
    );
    
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
 * @desc    Update member role
 * @route   PUT /api/projects/:projectId/members/:memberId
 * @access  Private
 */
exports.updateMemberRole = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Update member role
    const result = await projectService.updateMemberRole(
      req.params.projectId,
      req.params.memberId,
      req.body.role
    );
    
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
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:projectId/members/:memberId
 * @access  Private
 */
exports.removeMember = async (req, res, next) => {
  try {
    // Remove member
    await projectService.removeMember(
      req.params.projectId,
      req.params.memberId
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};