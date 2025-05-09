
// src/services/project.service.js
const Project = require('../models/project.model');
const Flag = require('../models/flag.model');

/**
 * Create a new project
 */
exports.createProject = async (userId, projectData) => {
  const { name, description, environments } = projectData;
  
  // Create project
  const project = await Project.create({
    name,
    description,
    environments: environments || undefined,
    owner: userId
  });
  
  return project;
};

/**
 * Get all projects for a user
 */
exports.getUserProjects = async (userId) => {
  // Find projects where user is owner or member
  const projects = await Project.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  });
  
  return projects;
};

/**
 * Get project by ID
 */
exports.getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate('owner', 'name email')
    .populate('members.user', 'name email');
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  return project;
};

/**
 * Update project
 */
exports.updateProject = async (projectId, updateData) => {
  const { name, description } = updateData;
  
  // Find project and update
  const project = await Project.findByIdAndUpdate(
    projectId,
    { name, description },
    { new: true, runValidators: true }
  );
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  return project;
};

/**
 * Delete project
 */
exports.deleteProject = async (projectId) => {
  // Find project and delete
  const project = await Project.findByIdAndDelete(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Delete all flags associated with project
  await Flag.deleteMany({ project: projectId });
  
  return { success: true };
};

/**
 * Add environment to project
 */
exports.addEnvironment = async (projectId, environment) => {
  // Find project
  const project = await Project.findById(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  try {
    // Add environment
    const apiKey = project.addEnvironment(environment);
    
    // Save project
    await project.save();
    
    return {
      environment,
      apiKey
    };
  } catch (error) {
    // Pass through error from model method
    throw error;
  }
};

/**
 * Remove environment from project
 */
exports.removeEnvironment = async (projectId, environment) => {
  // Find project
  const project = await Project.findById(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  try {
    // Remove environment
    project.removeEnvironment(environment);
    
    // Save project
    await project.save();
    
    return { success: true };
  } catch (error) {
    // Pass through error from model method
    throw error;
  }
};

/**
 * Generate new API key for environment
 */
exports.regenerateApiKey = async (projectId, environment) => {
  // Find project
  const project = await Project.findById(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  try {
    // Regenerate API key
    const apiKey = project.regenerateApiKey(environment);
    
    // Save project
    await project.save();
    
    return {
      environment,
      apiKey
    };
  } catch (error) {
    // Pass through error from model method
    throw error;
  }
};

/**
 * Add member to project
 */
exports.addProjectMember = async (projectId, memberData) => {
  const { email, role } = memberData;
  
  // Find user by email
  const User = require('../models/user.model');
  const user = await User.findOne({ email });
  
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Find project
  const project = await Project.findById(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if user is already a member
  const isMember = project.members.some(member => 
    member.user.toString() === user._id.toString()
  );
  
  if (isMember) {
    const error = new Error('User is already a member of this project');
    error.statusCode = 400;
    throw error;
  }
  
  // Add member
  project.members.push({
    user: user._id,
    role: role || 'viewer'
  });
  
  // Save project
  await project.save();
  
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email
    },
    role: role || 'viewer'
  };
};

/**
 * Update member role
 */
exports.updateMemberRole = async (projectId, memberId, role) => {
  // Find project
  const project = await Project.findById(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Find member
  const memberIndex = project.members.findIndex(member => 
    member.user.toString() === memberId
  );
  
  if (memberIndex === -1) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Update role
  project.members[memberIndex].role = role;
  
  // Save project
  await project.save();
  
  return {
    user: project.members[memberIndex].user,
    role
  };
};

/**
 * Remove member from project
 */
exports.removeMember = async (projectId, memberId) => {
  // Find project
  const project = await Project.findById(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if member is owner
  if (project.owner.toString() === memberId) {
    const error = new Error('Cannot remove project owner');
    error.statusCode = 400;
    throw error;
  }
  
  // Filter out member
  project.members = project.members.filter(member => 
    member.user.toString() !== memberId
  );
  
  // Save project
  await project.save();
  
  return { success: true };
};