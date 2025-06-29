require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const {
  registerUser,
  loginUser,
  getUserInfo,
} = require("./controllers/authController");
const { protect } = require("./middleware/authMiddleware");
const upload = require("./middleware/uploadMiddleware");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true
  })
);

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

connectDB();

// Health check endpoint (define first)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "TrackO API is running" });
});

// Test endpoint to verify routing
app.get("/test", (req, res) => {
  res.json({ message: "Test endpoint working" });
});

// Simple test for auth routes
app.get("/api/v1/auth/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

app.post("/api/v1/auth/test", (req, res) => {
  res.json({ message: "Auth POST route working" });
});

// Auth routes defined directly (instead of using router)
app.post("/api/v1/auth/register", (req, res) => {
  console.log("Register route hit");
  registerUser(req, res);
});

app.post("/api/v1/auth/login", (req, res) => {
  console.log("Login route hit");
  loginUser(req, res);
});

app.get("/api/v1/auth/getUser", protect, (req, res) => {
  console.log("GetUser route hit");
  getUserInfo(req, res);
});

app.post("/api/v1/auth/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ imageUrl });
});

// Debug: Log when mounting routes
console.log("Mounting API routes...");

app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/budget", budgetRoutes);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Handle all other routes (this should be LAST)
app.use("*", (req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
