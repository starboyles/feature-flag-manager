// src/models/project.model.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: [100, 'Project name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    environments: {
      type: [String],
      default: ['development', 'staging', 'production'],
      validate: {
        validator: function(environments) {
          // Ensure no duplicate environments
          return new Set(environments).size === environments.length;
        },
        message: 'Environments must be unique'
      }
    },
    apiKeys: {
      type: Map,
      of: String,
      default: function() {
        // Generate initial API keys for default environments
        const keys = {};
        (this.environments || ['development', 'staging', 'production']).forEach(env => {
          keys[env] = generateApiKey();
        });
        return keys;
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['viewer', 'editor', 'admin'],
        default: 'viewer'
      }
    }]
  },
  {
    timestamps: true,
  }
);

// Generate API key
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Method to regenerate API key for a specific environment
projectSchema.methods.regenerateApiKey = function(environment) {
  if (!this.environments.includes(environment)) {
    throw new Error(`Environment '${environment}' does not exist`);
  }
  
  const newKey = generateApiKey();
  this.apiKeys.set(environment, newKey);
  return newKey;
};

// Method to add a new environment with API key
projectSchema.methods.addEnvironment = function(environment) {
  if (this.environments.includes(environment)) {
    throw new Error(`Environment '${environment}' already exists`);
  }
  
  this.environments.push(environment);
  this.apiKeys.set(environment, generateApiKey());
  
  return this.apiKeys.get(environment);
};

// Method to remove an environment and its API key
projectSchema.methods.removeEnvironment = function(environment) {
  if (!this.environments.includes(environment)) {
    throw new Error(`Environment '${environment}' does not exist`);
  }
  
  // Don't allow removing all environments
  if (this.environments.length <= 1) {
    throw new Error('Cannot remove the last environment');
  }
  
  this.environments = this.environments.filter(env => env !== environment);
  this.apiKeys.delete(environment);
  
  return true;
};

// Pre-save hook to ensure owner is also a member with admin role
projectSchema.pre('save', function(next) {
  const ownerExists = this.members.some(member => 
    member.user.toString() === this.owner.toString()
  );
  
  if (!ownerExists) {
    this.members.push({
      user: this.owner,
      role: 'admin'
    });
  }
  
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;