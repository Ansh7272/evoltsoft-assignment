import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { combine, timestamp, printf, colorize, errors, json } = format;

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
  ),
  transports: [
    // Console transport (human-readable)
    new transports.Console({
      format: combine(colorize(), consoleFormat),
    }),
    // File transport – errors only
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: json(),
    }),
    // File transport – all logs
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: json(),
    }),
  ],
  exitOnError: false,
});

// Silence logs during testing
if (process.env.NODE_ENV === 'test') {
  logger.silent = true;
}

export default logger;
