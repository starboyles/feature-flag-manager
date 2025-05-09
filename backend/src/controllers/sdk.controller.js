// src/controllers/sdk.controller.js
const evaluationService = require('../services/evaluation.service');

/**
 * @desc    Evaluate a flag
 * @route   POST /api/sdk/:environment/evaluate
 * @access  Private (API Key)
 */
exports.evaluateFlag = async (req, res, next) => {
  try {
    const { flagKey, context = {} } = req.body;
    const projectId = req.project._id;
    const environment = req.environment;
    
    // Add client IP to context if available
    if (req.ip) {
      context.clientIP = req.ip;
    }
    
    // Evaluate flag
    const result = await evaluationService.evaluateFlag(
      projectId,
      environment,
      flagKey,
      context
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
 * @desc    Get all flags for client
 * @route   GET /api/sdk/:environment/flags
 * @access  Private (API Key)
 */
exports.getClientFlags = async (req, res, next) => {
  try {
    const projectId = req.project._id;
    const environment = req.environment;
    
    // Extract context from query params
    const context = {};
    if (req.query.userId) {
      context.userId = req.query.userId;
    }
    
    // Add client IP to context if available
    if (req.ip) {
      context.clientIP = req.ip;
    }
    
    // Evaluate all flags
    const result = await evaluationService.evaluateAllFlags(
      projectId,
      environment,
      context
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