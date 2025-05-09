// src/controllers/flag.controller.js
const { validationResult } = require('express-validator');
const flagService = require('../services/flag.service');

/**
 * @desc    Create a new flag
 * @route   POST /api/projects/:projectId/flags
 * @access  Private
 */
exports.createFlag = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Create flag
    const flag = await flagService.createFlag(
      req.params.projectId,
      req.user._id,
      req.body
    );
    
    // Return response
    res.status(201).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all flags for a project
 * @route   GET /api/projects/:projectId/flags
 * @access  Private
 */
exports.getProjectFlags = async (req, res, next) => {
  try {
    // Get project flags
    const flags = await flagService.getProjectFlags(req.params.projectId);
    
    // Return response
    res.status(200).json({
      status: 'success',
      results: flags.length,
      data: flags
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get flag by ID
 * @route   GET /api/projects/:projectId/flags/:flagId
 * @access  Private
 */
exports.getFlagById = async (req, res, next) => {
  try {
    // Get flag
    const flag = await flagService.getFlagById(req.params.flagId);
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update flag
 * @route   PUT /api/projects/:projectId/flags/:flagId
 * @access  Private
 */
exports.updateFlag = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Update flag
    const flag = await flagService.updateFlag(
      req.params.flagId,
      req.user._id,
      req.body
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete flag
 * @route   DELETE /api/projects/:projectId/flags/:flagId
 * @access  Private
 */
exports.deleteFlag = async (req, res, next) => {
  try {
    // Delete flag
    await flagService.deleteFlag(req.params.flagId);
    
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
 * @desc    Update environment settings
 * @route   PUT /api/projects/:projectId/flags/:flagId/environments/:environment
 * @access  Private
 */
exports.updateEnvironmentSettings = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Update environment settings
    const flag = await flagService.updateEnvironmentSettings(
      req.params.flagId,
      req.params.environment,
      req.user._id,
      req.body
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle flag for environment
 * @route   PATCH /api/projects/:projectId/flags/:flagId/environments/:environment/toggle
 * @access  Private
 */
exports.toggleFlag = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Toggle flag
    const flag = await flagService.toggleFlag(
      req.params.flagId,
      req.params.environment,
      req.user._id,
      req.body.enabled
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add rule to flag
 * @route   POST /api/projects/:projectId/flags/:flagId/environments/:environment/rules
 * @access  Private
 */
exports.addFlagRule = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Add rule
    const flag = await flagService.addFlagRule(
      req.params.flagId,
      req.params.environment,
      req.user._id,
      req.body
    );
    
    // Return response
    res.status(201).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update rule
 * @route   PUT /api/projects/:projectId/flags/:flagId/environments/:environment/rules/:ruleId
 * @access  Private
 */
exports.updateRule = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Update rule
    const flag = await flagService.updateRule(
      req.params.flagId,
      req.params.environment,
      req.params.ruleId,
      req.user._id,
      req.body
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete rule
 * @route   DELETE /api/projects/:projectId/flags/:flagId/environments/:environment/rules/:ruleId
 * @access  Private
 */
exports.deleteRule = async (req, res, next) => {
  try {
    // Delete rule
    const flag = await flagService.deleteRule(
      req.params.flagId,
      req.params.environment,
      req.params.ruleId,
      req.user._id
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add variation
 * @route   POST /api/projects/:projectId/flags/:flagId/environments/:environment/variations
 * @access  Private
 */
exports.addVariation = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Add variation
    const flag = await flagService.addVariation(
      req.params.flagId,
      req.params.environment,
      req.user._id,
      req.body
    );
    
    // Return response
    res.status(201).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update variation
 * @route   PUT /api/projects/:projectId/flags/:flagId/environments/:environment/variations/:key
 * @access  Private
 */
exports.updateVariation = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation error');
      error.statusCode = 400;
      error.errors = errors.array();
      return next(error);
    }
    
    // Update variation
    const flag = await flagService.updateVariation(
      req.params.flagId,
      req.params.environment,
      req.params.key,
      req.user._id,
      req.body
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete variation
 * @route   DELETE /api/projects/:projectId/flags/:flagId/environments/:environment/variations/:key
 * @access  Private
 */
exports.deleteVariation = async (req, res, next) => {
  try {
    // Delete variation
    const flag = await flagService.deleteVariation(
      req.params.flagId,
      req.params.environment,
      req.params.key,
      req.user._id
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set default variation
 * @route   PUT /api/projects/:projectId/flags/:flagId/environments/:environment/variations/:key/default
 * @access  Private
 */
exports.setDefaultVariation = async (req, res, next) => {
  try {
    // Set default variation
    const flag = await flagService.setDefaultVariation(
      req.params.flagId,
      req.params.environment,
      req.params.key,
      req.user._id
    );
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};