const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the connection string from the environment.
 * If the connection fails, the process exits so the app doesn't run
 * in a broken state without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
