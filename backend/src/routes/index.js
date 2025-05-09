// src/routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const flagRoutes = require('./flag.routes');
const sdkRoutes = require('./sdk.routes');

const router = express.Router();

// Auth routes (/api/auth)
router.use('/auth', authRoutes);

// Project routes (/api/projects)
router.use('/projects', projectRoutes);

// Flag routes (/api/projects/:projectId/flags)
router.use('/projects/:projectId/flags', flagRoutes);

// SDK routes (/api/sdk)
router.use('/sdk', sdkRoutes);

module.exports = router;