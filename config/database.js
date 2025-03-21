const mongoose = require('mongoose');
const logger = require('../utils/logger');
const Vehicle = require('../models/Vehicle');

class Database {
    constructor() {
        this.URI_MONGODB = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.ppbs4ac.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
    }

    async connect() {
        try {
            await mongoose.connect(this.URI_MONGODB);
            logger.info('Connected to the database ' + process.env.DB_NAME);
        } catch (error) {
            logger.error('Error connecting to the database:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            logger.info('Disconnected from the database');
        } catch (error) {
            logger.error('Error disconnecting from the database:', error);
            throw error;
        }
    }

    async synchronizeVehicleIndexes() {
        try {
            await Vehicle.syncIndexes();
        } catch (error) {
            logger.error('Error synchronizing the database:', error);
            throw error;
        }
    }
}

module.exports = new Database();