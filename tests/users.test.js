const app = require('../app');
const database = require('../config/database');
const request = require('supertest');
const User = require('../models/User');
const jwt = require("jsonwebtoken");

let accessToken;
let refreshToken;

beforeAll(async () => {
    await database.connect();
});

afterAll(async () => {
    await database.disconnect();
});

afterEach(async () => {
    await User.deleteMany();
});




describe('User API tests', () => {

    it('should respond a code 200', async () => {
        const response = await request(app).get('/user');
        expect(response.status).toBe(200);
    });

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/user/register')
            .send({
                name: 'John Doe',
                email: 'johndoe@gmail.com',
                password: 'password',
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
    });

    it('should not create a user with an existing email', async () => {
        await User.create({
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            password: 'password',
        });
        const response = await request(app)
            .post('/user/register')
            .send({
                name: 'Jane Doe',
                email: 'johndoe@gmail.com',
                password: 'password',
            });
        expect(response.status).toBe(400);
    });

    it('should login a user', async () => {
        await User.create({
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            password: 'password',
        });
        const response = await request(app)
            .post('/user/login')
            .send({
                email: 'johndoe@gmail.com',
                password: 'password',
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
    });

    it('should not login a user with invalid credentials', async () => {
        await User.create({
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            password: 'password',
        });
        const response = await request(app)
            .post('/user/login')
            .send({
                email: 'johndoe@gmail.com',
                password: 'invalidpassword',
            });
        expect(response.status).toBe(401);
    });
});

describe('Token Authentication and Refresh Tests', () => {
    let user;

    // This beforeEach will only run for tests inside this describe block
    beforeEach(async () => {
        // Create a user before each test in this block
        user = await User.create({
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            password: 'password',
        });

        // Log in the user to get tokens
        const loginResponse = await request(app)
            .post('/user/login')
            .send({
                email: 'johndoe@gmail.com',
                password: 'password',
            });

        accessToken = loginResponse.body.accessToken;
        refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh tokens with a valid refresh token', async () => {
        const response = await request(app)
            .post('/user/refresh-token') // Replace with your refresh token endpoint
            .send({ refreshToken });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('newRefreshToken');

        // Update the refresh token for further tests
        refreshToken = response.body.refreshToken;
    });

    it('should reject refresh with an invalid refresh token', async () => {
        const response = await request(app)
            .post('/user/refresh-token') // Replace with your refresh token endpoint
            .send({ refreshToken: 'invalidtoken' });

        expect(response.status).toBe(403);
    });

    it('should reject refresh with an expired refresh token', async () => {
        // Simulate an expired refresh token
        const expiredToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '-10s' } // Token expired 10 seconds ago
        );

        const response = await request(app)
            .post('/user/refresh-token') // Replace with your refresh token endpoint
            .send({ refreshToken: expiredToken });

        expect(response.status).toBe(403);
    });

    it('should access a protected route with a valid access token', async () => {
        const response = await request(app)
            .get('/user/profile') // Replace with your protected route endpoint
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
    });

    it('should reject access to a protected route with an invalid token', async () => {
        const response = await request(app)
            .get('/user/profile') // Replace with your protected route endpoint
            .set('Authorization', 'Bearer invalidtoken');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid token');
    });
});