// Load environment variables FIRST, before any other require
const dotenv = require("dotenv");
const path = require("path");

// Load central root .env first, then backend/.env as fallback/override
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const { loadSecrets } = require("./services/secrets/secretsManager.service");
const { logger, requestLogger } = require("./utils/logger");

const app = express();

// Trust AWS ALB / CloudFront reverse proxy headers (X-Forwarded-For, X-Forwarded-Proto)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Structured CloudWatch request logging
app.use(requestLogger);

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
// Start Server — load Secrets Manager, connect DB, register routes, listen
// ============================================
const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // 1. Bootstrap AWS Secrets Manager (no-op locally when AWS_SECRET_NAME is unset)
    await loadSecrets();

    // 2. Load DB & models after secrets are populated into process.env
    const { connectDB, sequelize } = require("./utils/db");

    require("./models/user");
    require("./models/company");
    require("./models/job");
    require("./models/application");
    require("./models/resume");
    require("./models/interview");
    require("./models/chatHistory");
    require("./models/aiUsage");
    require("./models/assosiations");

    // 3. Connect & sync database
    await connectDB();
    try {
      await sequelize.query("ALTER TABLE Applications MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending';").catch(() => {});
      await sequelize.query("ALTER TABLE applications MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending';").catch(() => {});
    } catch (_) {}

    // 4. Register API routes (preserved 100%)
    app.use("/api/v1/user", require("./routes/userRoute"));
    app.use("/api/v1/company", require("./routes/companyRoute"));
    app.use("/api/v1/job", require("./routes/jobRoute"));
    app.use("/api/v1/application", require("./routes/applicationRoute"));

    app.use("/api/v1/ai", require("./routes/aiRoute"));
    app.use("/api/v1/resumes", require("./routes/resumeRoute"));
    app.use("/api/v1/resume", require("./routes/resumeRoute"));
    app.use("/api/v1/interview", require("./routes/interviewRoute"));
    app.use("/api/v1/copilot", require("./routes/copilotRoute"));

    // Deep health check for AWS ALB Target Group
    const { isS3Configured } = require("./services/storage/s3.service");
    app.get("/api/v1/health", async (req, res) => {
      try {
        await sequelize.authenticate();
        res.status(200).json({
          success: true,
          status: "healthy",
          message: "AI Career Intelligence Platform is running",
          database: "connected",
          storage: isS3Configured ? "s3" : "local",
          uptimeSeconds: Math.floor(process.uptime()),
          timestamp: new Date().toISOString(),
          version: "2.0.0",
        });
      } catch (dbErr) {
        logger.error("Health check failed: DB unreachable", { error: dbErr.message });
        res.status(503).json({
          success: false,
          status: "unhealthy",
          database: "disconnected",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
      logger.error(`${req.method} ${req.path} failed`, {
        correlationId: req.correlationId,
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      });

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
        });
      }

      if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: err.errors?.map(e => e.message).join(', ') || 'Validation error',
        });
      }

      if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
        });
      }

      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message || 'Internal server error',
      });
    });

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        healthUrl: `http://localhost:${PORT}/api/v1/health`,
      });
    });

    // Graceful shutdown for EC2 ASG / rolling updates
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        await sequelize.close().catch(() => {});
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    const detail = error.original?.message || error.parent?.message || error.message || error;
    logger.error("Failed to start server", { error: String(detail) });
    process.exit(1);
  }
}

startServer();
