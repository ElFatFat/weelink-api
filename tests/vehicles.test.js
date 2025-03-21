const app = require('../app');
const database = require('../config/database');
const request = require('supertest');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const jwt = require("jsonwebtoken");

let accessToken;
let userID;

beforeAll(async () => {
    await database.connect();

    const user = await User.create({
        name: 'Vehicle User',
        email: 'vehicleuser@gmail.com',
        password: 'vehicle',
    });

    userID = user._id;
    accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
});

afterAll(async () => {
    await User.deleteMany();
    await database.disconnect();
});




describe('Vehicle API tests', () => {

    afterEach(async () => {
        await Vehicle.deleteMany();
    });

    it('should create a new vehicle', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'ABC123',
                vin: '1234567890',
                type: 'Voiture',
                mileage: 1000,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('should not create a vehicle with missing fields', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'ABC123',
            });
        expect(response.status).toBe(400);
    });

    it('should not create a vehicle that already has the license plate', async () => {
        await Vehicle.create({
            maker: 'Toyota',
            model: 'Corolla',
            year: 2020,
            license_plate: 'ABC123',
            type: 'Voiture',
            mileage: 1000,
            color: 'Black',
            fuel_type: 'Essence',
            user: userID,
        });
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'ABC123',
                type: 'Voiture',
                mileage: 1000,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(409);
    });

    it('should not create a vehicle with an already existing VIN', async () => {
        await Vehicle.create({
            maker: 'Toyota',
            model: 'Corolla',
            year: 2020,
            license_plate: 'DEF456',
            vin: '1234567890',
            type: 'Voiture',
            mileage: 1000,
            color: 'Black',
            fuel_type: 'Essence',
            user: userID,
        });
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'GHI789',
                vin: '1234567890',
                type: 'Voiture',
                mileage: 1000,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(409);
    });

    it('should not create a vehicle with an invalid type', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'JKL123',
                vin: '0987654321',
                type: 'Sedan',
                mileage: 1000,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(400);
    });

    it('should not create a vehicle with an unsupported fuel type', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'MNO456',
                vin: '1122334455',
                type: 'Voiture',
                mileage: 1000,
                color: 'Black',
                fuel_type: 'Hydrogen',
            });
        expect(response.status).toBe(400);
    });

    it('should not create a vehicle with negative mileage', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'PQR789',
                vin: '6677889900',
                type: 'Voiture',
                mileage: -100,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(400);
    });

    it('should not create a vehicle with excessively large mileage', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: 'STU123',
                vin: '4455667788',
                type: 'Voiture',
                mileage: 1000000000,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(400);
    });

    it('should not create a vehicle with a blank license plate', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 2020,
                license_plate: '',
                vin: '9988776655',
                type: 'Voiture',
                mileage: 1000,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(400);
    });

    it('should not create a vehicle with an invalid year', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: 1800,
                license_plate: 'VWX456',
                vin: '3344556677',
                type: 'Voiture',
                mileage: 1000,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(400);
    }
    );
    it('should not create a vehicle with a future year', async () => {
        const response = await request(app)
            .post('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Toyota',
                model: 'Corolla',
                year: new Date().getFullYear() + 1,
                license_plate: 'YZA789',
                vin: '5566778899',
                type: 'Voiture',
                mileage: 1000,
                color: 'Black',
                fuel_type: 'Essence',
            });
        expect(response.status).toBe(400);
    });
    it('should get all vehicles for the user', async () => {
        await Vehicle.create({
            maker: 'Toyota',
            model: 'Corolla',
            year: 2020,
            license_plate: 'ABC123',
            vin: '1234567890',
            type: 'Voiture',
            mileage: 1000,
            color: 'Black',
            fuel_type: 'Essence',
            user: userID,
        });
        const response = await request(app)
            .get('/vehicle')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });
    it('should not get vehicles for an unauthorized user', async () => {
        const response = await request(app)
            .get('/vehicle');
        expect(response.status).toBe(401);
    });
    it('should not get vehicles for a non-existent user', async () => {
        const invalidToken =
            jwt.sign({ id: 'nonexistentuser' }, process.env.JWT_SECRET, {
                expiresIn: '1d',
            });
        const response = await request(app)
            .get('/vehicle')
            .set('Authorization', `Bearer ${invalidToken}`);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid token');
    });

    it('should get a vehicle by ID', async () => {
        const vehicle = await Vehicle.create({
            maker: 'Toyota',
            model: 'Corolla',
            year: 2020,
            license_plate: 'ABC123',
            vin: '1234567890',
            type: 'Voiture',
            mileage: 1000,
            color: 'Black',
            fuel_type: 'Essence',
            user: userID,
        });
        const response = await request(app)
            .get(`/vehicle/${vehicle._id}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('license_plate', 'ABC123');
    });
    it('should not get a vehicle with an invalid ID', async () => {
        const response = await request(app)
            .get('/vehicle/invalidid')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(400);
    });
    it('should not get a vehicle that does not belong to the user', async () => {
        const otherUser = await User.create({
            name: 'Other User',
            email: 'wow@gmail.com',
            password: 'wow',
        });
        const vehicle = await Vehicle.create({
            maker: 'Toyota',
            model: 'Corolla',
            year: 2020,
            license_plate: 'ABC123',
            vin: '1234567890',
            type: 'Voiture',
            mileage: 1000,
            color: 'Black',
            fuel_type: 'Essence',
            user: otherUser._id,
        });
        const response = await request(app)
            .get(`/vehicle/${vehicle._id}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Vehicle not found');
    }
    );
    it('should not get a vehicle that does not exist', async () => {
        const response = await request(app)
            .get('/vehicle/60d5f9b1c2e3f4b8c8d8e8e8')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Vehicle not found');
    });

    it('should modify a vehicle', async () => {
        const vehicle = await Vehicle.create({
            maker: 'Toyota',
            model: 'Corolla',
            year: 2020,
            license_plate: 'ABC123',
            vin: '1234567890',
            type: 'Voiture',
            mileage: 1000,
            color: 'Black',
            fuel_type: 'Essence',
            user: userID,
        });
        const response = await request(app)
            .put(`/vehicle/${vehicle._id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                maker: 'Honda',
                model: 'Civic',
                year: 2021,
                license_plate: 'DEF456',
                vin: '0987654321',
                type: 'Voiture',
                mileage: 2000,
                color: 'Red',
                fuel_type: 'Diesel',
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('license_plate', 'DEF456');
    });
});