
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const AppError = require("./utils/AppError");
const asyncHandler = require("./utils/asyncHandler");
const validateRequest = require("./middleware/validateRequest");
const {
  paginationQuerySchema,
} = require("./validators/commonValidators");

const errorMiddleware = require("./middleware/errorMiddleware");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Confirms that the Express API is responding.
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-commerce API is running",
  });
});

// Confirms that MongoDB is connected.
app.get("/api/v1/health/db", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  if (!isConnected) {
    return res.status(503).json({
      success: false,
      message: "Database is not connected",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Database connection is healthy",
  });
});

//Testing purpose

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;