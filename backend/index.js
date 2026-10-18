// Load environment variables FIRST, before any other require
const dotenv = require("dotenv");
const path = require("path");

// Load central root .env first, then backend/.env as fallback/override
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const { connectDB } = require("./utils/db");

// Existing routes
const userRoute = require("./routes/userRoute");
const companyRoute = require("./routes/companyRoute");
const jobRoute = require("./routes/jobRoute");
const applicationRoute = require("./routes/applicationRoute");

// New AI routes
const aiRoute = require("./routes/aiRoute");
const resumeRoute = require("./routes/resumeRoute");
const interviewRoute = require("./routes/interviewRoute");
const copilotRoute = require("./routes/copilotRoute");

// Import models so associations are registered
require("./models/user");
require("./models/company");
require("./models/job");
require("./models/application");
require("./models/resume");
require("./models/interview");
require("./models/chatHistory");
require("./models/aiUsage");
require("./models/assosiations");

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Locally stored uploads (fallback when S3 not configured)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================
// Existing API Routes (preserved)
// ============================================
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

// ============================================
// New AI API Routes
// ============================================
app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/resumes", resumeRoute);
app.use("/api/v1/interview", interviewRoute);
app.use("/api/v1/copilot", copilotRoute);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Career Intelligence Platform is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: err.errors?.map(e => e.message).join(', ') || 'Validation error',
    });
  }

  // JSON parse error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// ============================================
// Start Server — connect DB first, then listen
// ============================================
const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at port ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
