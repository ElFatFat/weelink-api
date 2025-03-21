const logger = require('./utils/logger');
logger.info('App is starting up');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const database = require('./config/database');


const dotenv = require('dotenv');
dotenv.config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const vehiclesRouter = require('./routes/vehicles');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Log every incoming request
app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
    });
    next();
});

// Routes
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/vehicle', vehiclesRouter);

// Connect to the database
(async () => {
    try {
        await database.connect();
        await database.synchronizeVehicleIndexes();
    } catch (error) {
        logger.error('Database connection failed:', error);
        process.exit(1); // Exit the process if the database connection fails
    }
})();

// Gracefully handle shutdown and disconnect from the database
process.on('SIGINT', async () => {
    try {
        await database.disconnect();
        logger.info('Database connection closed');
        process.exit(0);
    } catch (error) {
        logger.error('Error closing database connection:', error);
        process.exit(1);
    }
});

// Conditionally start the server only if not in a test environment
if (process.env.NODE_ENV !== 'test') {
    const PORT_NUMBER = process.env.PORT_NUMBER;
    app.listen(PORT_NUMBER, () => {
        logger.info(`Server is running on port ${PORT_NUMBER}`);
    });
}

module.exports = app;