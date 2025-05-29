const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return; // Use existing connection
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err; // Let the error propagate for proper handling
  }
};

module.exports = connectDB;
