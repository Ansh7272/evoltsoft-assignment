import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info(`MongoDB connected: ${conn.connection.host}`);

      await cleanupStaleIndexes();

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting reconnect...');
      });

      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB error: ${err.message}`);
      });

      return conn;
    } catch (error) {
      attempt++;
      logger.error(`MongoDB connection failed (attempt ${attempt}/${maxRetries}): ${error.message}`);

      if (attempt >= maxRetries) {
        logger.error('All MongoDB connection attempts failed. Exiting.');
        process.exit(1);
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 500));
    }
  }
};

const cleanupStaleIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const collectionExists = await usersCollection.stats().catch(() => null);
    
    if (!collectionExists) {
      logger.info('Users collection does not exist yet (will be created on first insert)');
      return;
    }

    const indexes = await usersCollection.getIndexes();
    logger.info(`Current indexes on users collection: ${Object.keys(indexes).join(', ')}`);

    if (indexes.username_1) {
      await usersCollection.dropIndex('username_1');
      logger.info('✓ Successfully dropped stale username_1 index from users collection');
    }
  } catch (error) {
    logger.error(`Index cleanup error: ${error.message}`);
    logger.warn('Warning: Could not clean up stale indexes. Application will continue.');
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
};

export default connectDB;
