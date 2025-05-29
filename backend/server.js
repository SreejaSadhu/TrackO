require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

// Connect to MongoDB before starting the server
let isConnected = false;

const startServer = async () => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/income", incomeRoutes);
    app.use("/api/v1/expense", expenseRoutes);
    app.use("/api/v1/dashboard", dashboardRoutes);
    app.use("/api/v1/budget", budgetRoutes);

    // Serve uploads folder
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    });

    // Handle 404
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found"
      });
    });

    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }

    return app;
  } catch (error) {
    console.error("Server startup error:", error);
    throw error;
  }
};

// For serverless deployment
module.exports = startServer();
