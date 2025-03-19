const app = require('../app');
const database = require('../config/database');
const request = require('supertest');
const User = require('../models/User');

beforeEach(async () => {
    await database.connect();
});

/* Closing database connection after each test. */
afterEach(async () => {
    await database.disconnect();
});

describe('User API tests', () => {
    it('should return a list of users', async () => {
        const response = await request(app).get('/user');
        expect(response.status).toBe(200);
        // Add more assertions as needed
    });
});