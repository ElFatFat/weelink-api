const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';

// Load the .test.env file
dotenv.config({ path: '.test.env' });
