// src/models/evaluation.model.js
const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    flag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flag',
      required: true
    },
    flagKey: {
      type: String,
      required: true,
      index: true
    },
    environment: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      index: true
    },
    context: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    // Additional metadata
    sdkVersion: String,
    sdkType: String,
    clientIP: String
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient querying
evaluationSchema.index({ project: 1, flag: 1, timestamp: -1 });
evaluationSchema.index({ project: 1, flagKey: 1, environment: 1, timestamp: -1 });
evaluationSchema.index({ project: 1, userId: 1, timestamp: -1 });

// Static method to record an evaluation
evaluationSchema.statics.recordEvaluation = async function(data) {
  // Create the evaluation record
  const evaluation = await this.create(data);
  
  // Update the flag's metrics
  await mongoose.model('Flag').findByIdAndUpdate(data.flag, {
    $inc: { 'metrics.evaluations': 1 },
    $set: { 'metrics.lastEvaluated': new Date() }
  });
  
  return evaluation;
};

// Static method to get evaluations for analytics
evaluationSchema.statics.getAnalytics = async function(projectId, flagId, options = {}) {
  const { startDate, endDate, environment, limit = 1000 } = options;
  
  const query = {
    project: projectId
  };
  
  if (flagId) {
    query.flag = flagId;
  }
  
  if (environment) {
    query.environment = environment;
  }
  
  if (startDate || endDate) {
    query.timestamp = {};
    
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;