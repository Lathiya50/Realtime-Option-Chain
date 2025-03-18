const logger = require("./logger");

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};

module.exports = errorHandler;
