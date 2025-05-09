// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user.model');
const Project = require('../models/project.model');

/**
 * Protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      const error = new Error('Not authorized to access this route');
      error.statusCode = 401;
      return next(error);
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    // Check if user exists
    if (!user) {
      const error = new Error('User no longer exists');
      error.statusCode = 401;
      return next(error);
    }
    
    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    // Forward error to error handler
    next(error);
  }
};

/**
 * Restrict routes to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      const error = new Error(`User role ${req.user.role} is not authorized to access this route`);
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

/**
 * Verify API key for SDK access
 */
exports.verifyApiKey = async (req, res, next) => {
  try {
    // Get API key from headers
    const apiKey = req.headers['x-api-key'];
    
    // Check if API key exists
    if (!apiKey) {
      const error = new Error('API key is required');
      error.statusCode = 401;
      return next(error);
    }
    
    // Get environment from request parameters
    const { environment } = req.params;
    
    if (!environment) {
      const error = new Error('Environment is required');
      error.statusCode = 400;
      return next(error);
    }
    
    // Find project by API key
    const project = await Project.findOne({
      [`apiKeys.${environment}`]: apiKey
    });
    
    // Check if project exists
    if (!project) {
      const error = new Error('Invalid API key');
      error.statusCode = 401;
      return next(error);
    }
    
    // Set project in request
    req.project = project;
    req.environment = environment;
    next();
  } catch (error) {
    // Forward error to error handler
    next(error);
  }
};

/**
 * Check if user has access to project
 */
exports.checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Find project
    const project = await Project.findById(projectId);
    
    // Check if project exists
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user is owner or member
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!isOwner && !isMember && req.user.role !== 'admin') {
      const error = new Error('Not authorized to access this project');
      error.statusCode = 403;
      return next(error);
    }
    
    // Set project in request
    req.project = project;
    next();
  } catch (error) {
    // Forward error to error handler
    next(error);
  }
};

/**
 * Check if user has specific project role
 */
exports.checkProjectRole = (...roles) => {
  return (req, res, next) => {
    // Get project from request
    const { project, user } = req;
    
    // Check if user is owner
    const isOwner = project.owner.toString() === user._id.toString();
    
    // If user is owner, they have all permissions
    if (isOwner) {
      return next();
    }
    
    // Find user's membership
    const membership = project.members.find(member => 
      member.user.toString() === user._id.toString()
    );
    
    // Check if user has required role
    if (!membership || !roles.includes(membership.role)) {
      const error = new Error(`User role ${membership ? membership.role : 'none'} is not authorized for this action`);
      error.statusCode = 403;
      return next(error);
    }
    
    next();
  };
};