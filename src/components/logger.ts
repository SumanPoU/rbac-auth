import winston from "winston";
import fs from "fs";
import path from "path";

// Ensure the logs directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "webapp" },
  transports: [
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// If not production, log to console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Helpers
export const logError = (error: unknown, context?: string) => {
  if (error instanceof Error) {
    logger.error({
      message: error.message,
      stack: error.stack,
      context,
    });
  } else {
    logger.error({
      message: "Unknown error occurred",
      error,
      context,
    });
  }
};

export const logInfo = (message: string, meta?: Record<string, unknown>) => {
  logger.info(message, meta);
};

export const logWarning = (message: string, meta?: Record<string, unknown>) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>) => {
  logger.debug(message, meta);
};

export default logger;
