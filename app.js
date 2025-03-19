const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const database = require('./config/database');

const dotenv = require('dotenv');
dotenv.config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);

// Connect to the database
(async () => {
    try {
        await database.connect();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process if the database connection fails
    }
})();

// Gracefully handle shutdown and disconnect from the database
process.on('SIGINT', async () => {
    try {
        await database.disconnect();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
});

// Conditionally start the server only if not in a test environment
if (process.env.NODE_ENV !== 'test') {
    const PORT_NUMBER = process.env.PORT_NUMBER;
    app.listen(PORT_NUMBER, () => {
        console.log(`Server is running on port ${PORT_NUMBER}`);
    });
}

module.exports = app;