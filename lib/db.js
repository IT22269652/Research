import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return; // Already connected
  }
  try {
    await mongoose.connect(process.env.local.MONGODB_URI, {
      dbName: 'ResumeBuilder', // Use your DB name from URI
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('DB connection failed');
  }
};

export default connectDB;