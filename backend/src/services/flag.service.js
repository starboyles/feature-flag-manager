// src/services/flag.service.js
const Flag = require('../models/flag.model');
const Project = require('../models/project.model');

/**
 * Create a new flag
 */
exports.createFlag = async (projectId, userId, flagData) => {
  const { key, name, description, type = 'BOOLEAN', environments, tags } = flagData;
  
  // Check if flag with same key already exists in project
  const existingFlag = await Flag.findOne({
    project: projectId,
    key
  });
  
  if (existingFlag) {
    const error = new Error(`Flag with key '${key}' already exists`);
    error.statusCode = 400;
    throw error;
  }
  
  // Get project to access environments
  const project = await Project.findById(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Initialize environments map
  const envSettings = new Map();
  
  // Create settings for each environment in the project
  project.environments.forEach(env => {
    const envData = environments && environments[env]
      ? environments[env]
      : { enabled: false };
    
    envSettings.set(env, {
      enabled: envData.enabled || false,
      rules: envData.rules || [],
      value: type === 'BOOLEAN' ? (envData.value || false) : envData.value,
      variations: envData.variations || [],
      defaultVariation: envData.defaultVariation || null
    });
  });
  
  // Create flag
  const flag = await Flag.create({
    key,
    name,
    description,
    project: projectId,
    type,
    environments: envSettings,
    tags: tags || [],
    createdBy: userId,
    updatedBy: userId
  });
  
  return flag;
};

/**
 * Get all flags for a project
 */
exports.getProjectFlags = async (projectId) => {
  // Find flags for project
  const flags = await Flag.find({ project: projectId });
  
  return flags;
};

/**
 * Get flag by ID
 */
exports.getFlagById = async (flagId) => {
  const flag = await Flag.findById(flagId)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  return flag;
};

/**
 * Update flag
 */
exports.updateFlag = async (flagId, userId, updateData) => {
  const { name, description, tags } = updateData;
  
  // Find flag and update
  const flag = await Flag.findByIdAndUpdate(
    flagId,
    {
      name,
      description,
      tags,
      updatedBy: userId
    },
    { new: true, runValidators: true }
  );
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  return flag;
};

/**
 * Delete flag
 */
exports.deleteFlag = async (flagId) => {
  // Find flag and delete
  const flag = await Flag.findByIdAndDelete(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  return { success: true };
};

/**
 * Update environment settings for a flag
 */
exports.updateEnvironmentSettings = async (flagId, environment, userId, settings) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Update settings
  const updatedSettings = {
    ...currentSettings,
    ...settings
  };
  
  // Set updated settings
  flag.environments.set(environment, updatedSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};

/**
 * Toggle flag enabled state for an environment
 */
exports.toggleFlag = async (flagId, environment, userId, enabled) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Update enabled state
  currentSettings.enabled = enabled;
  
  // Set updated settings
  flag.environments.set(environment, currentSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};

/**
 * Add rule to flag
 */
exports.addFlagRule = async (flagId, environment, userId, ruleData) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Add rule
  if (!currentSettings.rules) {
    currentSettings.rules = [];
  }
  
  currentSettings.rules.push(ruleData);
  
  // Set updated settings
  flag.environments.set(environment, currentSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};

/**
 * Update rule
 */
exports.updateRule = async (flagId, environment, ruleId, userId, updateData) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Find rule index
  const ruleIndex = currentSettings.rules.findIndex(
    rule => rule._id.toString() === ruleId
  );
  
  if (ruleIndex === -1) {
    const error = new Error('Rule not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Update rule
  currentSettings.rules[ruleIndex] = {
    ...currentSettings.rules[ruleIndex],
    ...updateData
  };
  
  // Set updated settings
  flag.environments.set(environment, currentSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};

/**
 * Delete rule
 */
exports.deleteRule = async (flagId, environment, ruleId, userId) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Filter out rule
  currentSettings.rules = currentSettings.rules.filter(
    rule => rule._id.toString() !== ruleId
  );
  
  // Set updated settings
  flag.environments.set(environment, currentSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};

/**
 * Add variation to flag
 */
exports.addVariation = async (flagId, environment, userId, variationData) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Add variation
  if (!currentSettings.variations) {
    currentSettings.variations = [];
  }
  
  // Check if variation key already exists
  const existingVariation = currentSettings.variations.find(
    v => v.key === variationData.key
  );
  
  if (existingVariation) {
    const error = new Error(`Variation with key '${variationData.key}' already exists`);
    error.statusCode = 400;
    throw error;
  }
  
  currentSettings.variations.push(variationData);
  
  // If this is the first variation, set it as default
  if (currentSettings.variations.length === 1 && !currentSettings.defaultVariation) {
    currentSettings.defaultVariation = variationData.key;
  }
  
  // Set updated settings
  flag.environments.set(environment, currentSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};

/**
 * Update variation
 */
exports.updateVariation = async (flagId, environment, variationKey, userId, updateData) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Find variation index
  const variationIndex = currentSettings.variations.findIndex(
    v => v.key === variationKey
  );
  
  if (variationIndex === -1) {
    const error = new Error(`Variation with key '${variationKey}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Update variation
  currentSettings.variations[variationIndex] = {
    ...currentSettings.variations[variationIndex],
    ...updateData
  };
  
  // Set updated settings
  flag.environments.set(environment, currentSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};

/**
 * Delete variation
 */
exports.deleteVariation = async (flagId, environment, variationKey, userId) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Check if variation exists
  const variationIndex = currentSettings.variations.findIndex(
    v => v.key === variationKey
  );
  
  if (variationIndex === -1) {
    const error = new Error(`Variation with key '${variationKey}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Check if it's the default variation
  if (currentSettings.defaultVariation === variationKey) {
    // Cannot delete default variation if it's the only one
    if (currentSettings.variations.length === 1) {
      const error = new Error('Cannot delete the only variation');
      error.statusCode = 400;
      throw error;
    }
    
    // Set a new default variation
    const newDefault = currentSettings.variations.find(v => v.key !== variationKey);
    currentSettings.defaultVariation = newDefault.key;
  }
  
  // Filter out variation
  currentSettings.variations = currentSettings.variations.filter(
    v => v.key !== variationKey
  );
  
  // Set updated settings
  flag.environments.set(environment, currentSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};

/**
 * Set default variation
 */
exports.setDefaultVariation = async (flagId, environment, variationKey, userId) => {
  // Find flag
  const flag = await Flag.findById(flagId);
  
  if (!flag) {
    const error = new Error('Flag not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if environment exists
  if (!flag.environments.has(environment)) {
    const error = new Error(`Environment '${environment}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Get current settings
  const currentSettings = flag.environments.get(environment);
  
  // Check if variation exists
  const variationExists = currentSettings.variations.some(
    v => v.key === variationKey
  );
  
  if (!variationExists) {
    const error = new Error(`Variation with key '${variationKey}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  // Set default variation
  currentSettings.defaultVariation = variationKey;
  
  // Set updated settings
  flag.environments.set(environment, currentSettings);
  
  // Update updatedBy field
  flag.updatedBy = userId;
  
  // Save flag
  await flag.save();
  
  return flag;
};