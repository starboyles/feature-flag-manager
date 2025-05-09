const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDatabase = async () => {
    try {
      const mongoURI = process.env.NODE_ENV === 'test' 
        ? process.env.MONGODB_URI_TEST 
        : process.env.MONGODB_URI;
      
      console.log('MongoDB URI:', mongoURI);
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };
  
      await mongoose.connect(mongoURI, options);
      
      logger.info('MongoDB connected successfully');
      
      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err}`);
      });
  
      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });
  
      // Handle application termination
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed due to app termination');
        process.exit(0);
      });
      
    } catch (error) {
      logger.error(`MongoDB connection error: ${error.message}`);
      process.exit(1);
    }
  };

  module.exports = { connectDatabase };