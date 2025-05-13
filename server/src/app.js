const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const logger = require('./utils/logger');
const sequelize = require('./database/sequelize');

// Import routes
const reportRoutes = require('./routes/reportRoutes.js');
const standardsRoutes = require('./routes/standardsRoutes');
const standardsApiRoutes = require('./routes/standards-api');
const complianceVerificationRoutes = require('./routes/compliance-verification');
const energyAuditRoutes = require('../routes/energyAudit');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Log environment variables
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`DB_HOST: ${process.env.DB_HOST}`);
logger.info(`DB_USER: ${process.env.DB_USER}`);
logger.info(`DB_NAME: ${process.env.DB_NAME}`);

// Initialize Sequelize connection
(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
})();

// Run seeders in development mode
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  const { seedStandards } = require('./database/seeders/standards_seed');
  
  // Run seeders asynchronously to not block server startup
  (async () => {
    try {
      logger.info('Running database seeders in development mode...');
      await seedStandards();
      logger.info('Seeders completed successfully');
    } catch (error) {
      logger.error('Error running seeders:', error);
    }
  })();
}

// API routes
app.use('/api/reports', reportRoutes);
app.use('/api', standardsRoutes);
app.use('/api/standards-api', standardsApiRoutes);
app.use('/api/compliance', complianceVerificationRoutes);
app.use('/api/energy-audit', energyAuditRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

module.exports = app; 