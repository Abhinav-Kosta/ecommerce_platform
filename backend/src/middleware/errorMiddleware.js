const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (res.headersSent) {
    return next(err);
  }

  const response = {
    success: false,
    status: err.status || "error",
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;