// src/services/evaluation.service.js
const Flag = require('../models/flag.model');
const Evaluation = require('../models/evaluation.model');

/**
 * Evaluate a specific flag for a given context
 */
exports.evaluateFlag = async (projectId, environment, flagKey, context = {}) => {
  // Find flag by project and key
  const flag = await Flag.findOne({
    project: projectId,
    key: flagKey
  });
  
  if (!flag) {
    const error = new Error(`Flag '${flagKey}' not found`);
    error.statusCode = 404;
    throw error;
  }
  
  try {
    // Evaluate flag for given context
    const result = flag.evaluate(environment, context);
    
    // Record evaluation asynchronously (don't await)
    Evaluation.recordEvaluation({
      project: projectId,
      flag: flag._id,
      flagKey: flag.key,
      environment,
      userId: context.userId || null,
      context: new Map(Object.entries(context)),
      result,
      timestamp: new Date(),
      sdkVersion: context.sdkVersion,
      sdkType: context.sdkType,
      clientIP: context.clientIP
    }).catch(err => {
      // Log error but don't throw since this is non-critical
      console.error('Failed to record evaluation:', err);
    });
    
    return {
      key: flag.key,
      value: result
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Evaluate all flags for a given context
 */
exports.evaluateAllFlags = async (projectId, environment, context = {}) => {
  // Find all flags for project
  const flags = await Flag.find({
    project: projectId
  });
  
  const results = {};
  
  // Evaluate each flag
  for (const flag of flags) {
    try {
      // Evaluate flag for given context
      const result = flag.evaluate(environment, context);
      
      // Add to results
      results[flag.key] = result;
      
      // Record evaluation asynchronously (don't await)
      Evaluation.recordEvaluation({
        project: projectId,
        flag: flag._id,
        flagKey: flag.key,
        environment,
        userId: context.userId || null,
        context: new Map(Object.entries(context)),
        result,
        timestamp: new Date(),
        sdkVersion: context.sdkVersion,
        sdkType: context.sdkType,
        clientIP: context.clientIP
      }).catch(err => {
        // Log error but don't throw since this is non-critical
        console.error('Failed to record evaluation:', err);
      });
    } catch (error) {
      // Skip flags that fail to evaluate
      console.error(`Failed to evaluate flag '${flag.key}':`, error);
    }
  }
  
  return results;
};

/**
 * Get evaluations for a flag for analytics
 */
exports.getFlagEvaluations = async (projectId, flagId, options = {}) => {
  return Evaluation.getAnalytics(projectId, flagId, options);
};

/**
 * Get overall project analytics
 */
exports.getProjectAnalytics = async (projectId, options = {}) => {
  const { startDate, endDate, environment, limit } = options;
  
  // Get recent evaluations
  const recentEvaluations = await Evaluation.getAnalytics(
    projectId,
    null,
    { startDate, endDate, environment, limit }
  );
  
  // Calculate metrics
  const metrics = {
    totalEvaluations: await Evaluation.countDocuments({ project: projectId }),
    uniqueFlags: await Evaluation.distinct('flagKey', { project: projectId }).then(keys => keys.length),
    uniqueUsers: await Evaluation.distinct('userId', { 
      project: projectId,
      userId: { $ne: null }
    }).then(users => users.length)
  };
  
  // Get evaluations per flag
  const flagCounts = await Evaluation.aggregate([
    { $match: { project: projectId } },
    { $group: { _id: '$flagKey', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Get evaluations per environment
  const environmentCounts = await Evaluation.aggregate([
    { $match: { project: projectId } },
    { $group: { _id: '$environment', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    metrics,
    flagCounts,
    environmentCounts,
    recentEvaluations
  };
};