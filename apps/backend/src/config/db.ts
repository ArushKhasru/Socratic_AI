import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = (process.env.MONGODB_URI || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '');

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    const conn = await connectionPromise;
    return conn.connection;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
};

export default connectDB;
