// src/models/flag.model.js
const mongoose = require('mongoose');

// Rule schema for targeting and rollout rules
const ruleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PERCENTAGE', 'USER_SEGMENT', 'SCHEDULED', 'DEFAULT'],
    required: true
  },
  name: {
    type: String,
    required: function() { return this.type !== 'DEFAULT'; },
    trim: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0
  },
  // Rule configuration based on type
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(value) {
        switch (this.type) {
          case 'PERCENTAGE':
            // Percentage should be a number between 0 and 100
            return typeof value === 'number' && value >= 0 && value <= 100;
          case 'USER_SEGMENT':
            // User segment should be an object with attribute conditions
            return typeof value === 'object' && value !== null;
          case 'SCHEDULED':
            // Scheduled should have startDate and optionally endDate
            return value && value.startDate;
          case 'DEFAULT':
            // Default value should be a boolean, string, number or JSON
            return value !== undefined;
          default:
            return false;
        }
      },
      message: props => `Invalid value for rule type ${props.value}`
    }
  }
}, { _id: true });

// Variation schema for different flag values
const variationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: true });

// Main flag schema
const flagSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Flag key is required'],
      trim: true,
      maxlength: [100, 'Flag key cannot be more than 100 characters'],
      match: [/^[a-zA-Z0-9_.-]+$/, 'Flag key can only contain letters, numbers, dashes, dots, and underscores']
    },
    name: {
      type: String,
      required: [true, 'Flag name is required'],
      trim: true,
      maxlength: [100, 'Flag name cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['BOOLEAN', 'STRING', 'NUMBER', 'JSON'],
      default: 'BOOLEAN'
    },
    // Environment-specific settings
    environments: {
      type: Map,
      of: new mongoose.Schema({
        enabled: {
          type: Boolean,
          default: false
        },
        rules: [ruleSchema],
        // For simple boolean flags
        value: {
          type: mongoose.Schema.Types.Mixed
        },
        // For multi-variate flags
        variations: [variationSchema],
        defaultVariation: {
          type: String,
          // Reference to a variation key
          validate: {
            validator: function(value) {
              if (!value) return true; // Allow null/undefined
              if (!this.variations || this.variations.length === 0) return false;
              return this.variations.some(v => v.key === value);
            },
            message: 'Default variation must reference an existing variation key'
          }
        }
      }, { _id: false })
    },
    tags: {
      type: [String],
      default: []
    },
    // Flag evaluation metrics (optional)
    metrics: {
      evaluations: {
        type: Number,
        default: 0
      },
      lastEvaluated: Date
    },
    // Audit information
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for quick lookup by project and key combination
flagSchema.index({ project: 1, key: 1 }, { unique: true });
flagSchema.index({ project: 1, tags: 1 });

// Virtuals
flagSchema.virtual('environmentsList').get(function() {
  return Array.from(this.environments.keys());
});

// Static method to find flags for a specific project
flagSchema.statics.findByProject = function(projectId) {
  return this.find({ project: projectId });
};

// Static method to find flags by tags
flagSchema.statics.findByTags = function(projectId, tags) {
  return this.find({
    project: projectId,
    tags: { $in: tags }
  });
};

// Method to evaluate a flag for a specific context
flagSchema.methods.evaluate = function(environment, context = {}) {
  // Check if the environment exists
  if (!this.environments.has(environment)) {
    throw new Error(`Environment '${environment}' not found for flag '${this.key}'`);
  }
  
  const envSettings = this.environments.get(environment);
  
  // If flag is disabled for this environment, return the default value
  if (!envSettings.enabled) {
    return this.getDefaultValue(environment);
  }
  
  // If there are no rules, return the default value
  if (!envSettings.rules || envSettings.rules.length === 0) {
    return this.getDefaultValue(environment);
  }
  
  // Sort rules by priority (higher priority first)
  const sortedRules = [...envSettings.rules].sort((a, b) => b.priority - a.priority);
  
  // Evaluate each rule in order of priority
  for (const rule of sortedRules) {
    const result = this.evaluateRule(rule, context);
    if (result.matches) {
      return result.value;
    }
  }
  
  // If no rules match, return the default value
  return this.getDefaultValue(environment);
};

// Helper method to evaluate a specific rule
flagSchema.methods.evaluateRule = function(rule, context) {
  switch (rule.type) {
    case 'PERCENTAGE':
      // Simple percentage rollout
      const percentageValue = rule.value;
      const userId = context.userId || '';
      
      // Generate a hash of userId + flag key to get consistent results
      let hash = 0;
      const str = userId + this.key;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Normalize the hash to a value between 0 and 100
      const normalizedHash = Math.abs(hash % 100);
      
      // If user's hash falls within the percentage, return true
      return {
        matches: normalizedHash < percentageValue,
        value: true
      };
      
    case 'USER_SEGMENT':
      // Check if user attributes match the segment criteria
      const segmentValue = rule.value;
      let matches = true;
      
      // For each attribute in the segment, check if the context matches
      for (const [key, value] of Object.entries(segmentValue)) {
        if (!context[key] || context[key] !== value) {
          matches = false;
          break;
        }
      }
      
      return {
        matches,
        value: true
      };
      
    case 'SCHEDULED':
      // Check if current time is within the scheduled window
      const now = new Date();
      const { startDate, endDate } = rule.value;
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;
      
      const isAfterStart = now >= start;
      const isBeforeEnd = end ? now <= end : true;
      
      return {
        matches: isAfterStart && isBeforeEnd,
        value: true
      };
      
    case 'DEFAULT':
      // Default rule always matches
      return {
        matches: true,
        value: rule.value
      };
      
    default:
      return {
        matches: false,
        value: null
      };
  }
};

// Helper method to get default value for an environment
flagSchema.methods.getDefaultValue = function(environment) {
  const envSettings = this.environments.get(environment);
  
  if (this.type === 'BOOLEAN') {
    return envSettings.value !== undefined ? envSettings.value : false;
  }
  
  // For multivariate flags, return the default variation
  if (envSettings.variations && envSettings.variations.length > 0) {
    const defaultKey = envSettings.defaultVariation || envSettings.variations[0].key;
    const variation = envSettings.variations.find(v => v.key === defaultKey);
    return variation ? variation.value : null;
  }
  
  return envSettings.value !== undefined ? envSettings.value : null;
};

const Flag = mongoose.model('Flag', flagSchema);

module.exports = Flag;