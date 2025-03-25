const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure the logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // Use LOG_LEVEL environment variable or default to 'info'
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'verbose.log'), level: 'verbose' }),
        new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),

        // Log to the console for real-time debugging
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
    ],
});

logger.on('finish', () => process.exit(1));


// Flush logs before exiting
process.on('exit', () => {
    logger.end();
});

module.exports = logger;