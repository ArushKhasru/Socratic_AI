import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = (process.env.MONGODB_URI || '').trim();
  if (!mongoUri) {
    console.error('MONGODB_URI is not configured. Skipping MongoDB connection.');
    return null;
  }

  if (!connectionPromise) {
    console.log('mongo db is connecting');
    connectionPromise = mongoose.connect(mongoUri);
  }

  try {
    const conn = await connectionPromise;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    connectionPromise = null;
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred during MongoDB connection.');
    }
    return null;
  }
};

export default connectDB;
