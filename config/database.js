const mongoose = require('mongoose');

class Database {
    constructor() {
        this.URI_MONGODB = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.ppbs4ac.mongodb.net/weelink`;
    }

    async connect() {
        try {
            await mongoose.connect(this.URI_MONGODB);
        } catch (error) {
            console.error('Impossible de se connecter à la base de données:', error);
            throw error; // Re-throw the error to handle it outside if needed
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
        } catch (error) {
            console.error('Impossible de fermer la connexion à la base de données:', error);
            throw error; // Re-throw the error to handle it outside if needed
        }
    }
}

module.exports = new Database();