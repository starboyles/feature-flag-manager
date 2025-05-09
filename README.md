# Feature Flag Manager 🐎

A minimalist feature flag management service for developers. Control feature releases through configuration rather than deploying new code, making deployments safer and more flexible.

## Over-All Architecture

┌───────────────┐       ┌──────────────┐       ┌──────────────┐
│ Client        │       │ API Server   │       │   Database   │
│ - Web UI      │◄───►│ - REST API   │◄───►│ - MongoDB    │
│ - SDK Clients │       │ - Auth       │       │              │
└───────────────┘       └──────────────┘       └──────────────┘

## Features 🎢

- **Simple Flag Management**: Create, update, and delete feature flags through a RESTful Architecture API
- **Environment-Based Configuration**: Manage flags across different environments (development, staging, production)
- **Gradual Rollouts**: Roll out features to a percentage of users
- **User Segmentation**: Target features to specific user segments
- **Scheduled Activations**: Automatically activate/deactivate features at specific times
- **A/B Testing**: Test different variations of a feature with metrics tracking
- **SDK Support**: Client libraries for JavaScript (more coming soon)
- **Multi-Tenant Support**: Manage flags for multiple projects

## System Architecture 🔗

The system consists of three main components:

1. **Backend API**: A Node.js/Express REST API for managing flags
2. **Web UI**: A React-based admin dashboard (coming soon)
3. **SDKs**: Client libraries for different platforms

## Getting Started 📍

### Prerequisites

- Node.js (v14+)
- MongoDB (v4+)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/feature-flag-manager.git
   cd feature-flag-manager
   ```

2. Install dependencies:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to set your MongoDB connection string and JWT secret.

4. Start the server:
   ```
   npm run dev
   ```

### Using the API

The API provides endpoints for managing projects, flags, and environments. Here are some example requests:

#### Authentication

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Projects

```bash
# Create a new project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Project","description":"A test project"}'

# Get all projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Feature Flags

```bash
# Create a new flag
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/flags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "key": "new-feature",
    "name": "New Feature",
    "description": "A new feature being rolled out"
  }'

# Toggle a flag in an environment
curl -X PATCH http://localhost:5000/api/projects/PROJECT_ID/flags/FLAG_ID/environments/production/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"enabled": true}'
```

### JavaScript SDK

#### Installation

```bash
npm install feature-flag-manager-js-sdk
```

#### Usage

```javascript
import FlagManager from 'feature-flag-manager-js-sdk';

// Initialize the SDK
const flagManager = new FlagManager({
  apiKey: 'YOUR_API_KEY',
  environment: 'production',
  baseUrl: 'http://localhost:5000/api'
});

// Check if a feature is enabled
const isEnabled = await flagManager.isEnabled('new-feature', { userId: 'user123' });
if (isEnabled) {
  // Show the new feature
}

// Get a specific flag value
const value = await flagManager.getValue('theme-color', { userId: 'user123' });
console.log('Theme color:', value);

// Get all flags
const allFlags = await flagManager.getAllFlags({ userId: 'user123' });
console.log('All flags:', allFlags);
```

## API Documentation

Detailed API documentation is available at `/api-docs` when running the server (coming soon).

## Development

### Project Structure

```
feature-flag-manager/
├── backend/             # Node.js/Express backend
│   ├── src/             # Source code
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # Express routes
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   ├── app.js       # Express app
│   │   └── server.js    # Server entry point
│   └── package.json     # Backend dependencies
├── frontend/            # React frontend (coming soon)
├── sdk/                 # SDK libraries
│   ├── javascript/      # JavaScript SDK
│   └── ...              # Other SDKs (coming soon)
└── README.md            # Project documentation
```

### Testing

Run tests with:

```bash
cd backend
npm test
```

## Roadmap

- [ ] Complete backend implementation
- [ ] Add frontend admin dashboard
- [ ] Add support for more SDK languages (Python, Java, etc.)
- [ ] Implement analytics and reporting
- [ ] Add webhook support for flag changes
- [ ] Implement user management and permissions
- [ ] Add support for custom flag types

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request