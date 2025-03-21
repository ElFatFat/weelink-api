const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

// Register a new vehicle
exports.newVehicle = async (req, res) => {
    logger.info("Creating a new vehicle");

    // Dynamically get required fields from the Vehicle schema, excluding "user"
    const requiredFields = Object.keys(Vehicle.schema.obj).filter(
        (field) => Vehicle.schema.obj[field].required && field !== "user"
    );

    // Check for missing fields
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Missing required fields",
            missingFields,
        });
    }

    try {
        const userId = req.user.id; // Extract user ID from the authenticated request
        logger.info(`User ID: ${userId}`);

        const { maker, model, year, license_plate, vin, type, mileage, color, main_garage, fuel_type } = req.body;

        const validTypes = Vehicle.schema.path('type').enumValues;
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: `Invalid vehicle type: ${type}. Allowed types are ${validTypes.join(", ")}.` });
        }

        const validFuelTypes = Vehicle.schema.path('fuel_type').enumValues;
        if (!validFuelTypes.includes(fuel_type)) {
            return res.status(400).json({ message: `Invalid fuel type: ${fuel_type}. Allowed fuel types are ${validFuelTypes.join(", ")}.` });
        }

        if(mileage < 0 || mileage > 1000000){
            return res.status(400).json({ message: `Invalid mileage: ${mileage}. Allowed mileage is between 0 and 1,000,000.` });
        }
        if(year < 1900 || year > new Date().getFullYear()){
            return res.status(400).json({ message: `Invalid year: ${year}. Allowed year is between 1900 and the current year.` });
        }

        const vehicle = new Vehicle({
            maker,
            model,
            year,
            user: userId, // Assign the user ID to the vehicle
            license_plate,
            fuel_type,
            type,
            mileage,
            color,
            main_garage,
            vin,
        });
        await vehicle.save();
        return res.status(201).json({ id: vehicle._id });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error (e.g., license_plate already exists)
            logger.warn("Conflict: Duplicate key error", error);

            //Handle duplicate license plate error
            if (error.keyPattern && error.keyPattern.license_plate){
                return res.status(409).json({ message: "License plate already exists" });
            }

            if (error.keyPattern && error.keyPattern.vin){
                return res.status(409).json({ message: "VIN already exists" });
            }
        }
        logger.error("Error creating a new vehicle", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

exports.getVehicles = async (req, res) => {
    logger.info("Getting vehicles for user");

    try {
        const userId = req.user.id; // Extract user ID from the authenticated request
        logger.info(`User ID: ${userId}`);

        const vehicles = await Vehicle.find({ user: userId })
        .select('id maker model year license_plate type mileage color');
        if (!vehicles || vehicles.length === 0) {
            return res.status(404).json({ message: "No vehicles found" });
        }
        return res.status(200).json( vehicles );
    } catch (error) {
        logger.error("Error getting vehicles", error);
        return res.status(500).json({ message: "Server error", error });
    }
}

exports.getVehicle = async (req, res) => {
    logger.info("Getting a specific vehicle");
    try {
        const vehicleId = req.params.id;
        const userId = req.user.id; // Extract user ID from the authenticated request
        logger.info(`User ID: ${userId}`);

        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json({ message: "Invalid vehicle ID format" });
        }

        const vehicle = await Vehicle.findOne({ _id: vehicleId, user: userId });
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        return res.status(200).json(vehicle);
    }
    catch (error) {
        logger.error("Error getting vehicle", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

exports.modifyVehicle = async (req, res) => {
    logger.info("Modifying a vehicle");

    try {
        const vehicleId = req.params.id;
        const userId = req.user.id; // Extract user ID from the authenticated request
        logger.info(`User ID: ${userId}`);

        const { type, fuel_type, mileage, year } = req.body;

        // Validate type
        if (type) {
            const validTypes = Vehicle.schema.path('type').enumValues;
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: `Invalid vehicle type: ${type}. Allowed types are ${validTypes.join(", ")}.` });
            }
        }

        // Validate fuel_type
        if (fuel_type) {
            const validFuelTypes = Vehicle.schema.path('fuel_type').enumValues;
            if (!validFuelTypes.includes(fuel_type)) {
                return res.status(400).json({ message: `Invalid fuel type: ${fuel_type}. Allowed fuel types are ${validFuelTypes.join(", ")}.` });
            }
        }

        // Validate mileage
        if (mileage !== undefined) {
            if (mileage < 0 || mileage > 1000000) {
                return res.status(400).json({ message: `Invalid mileage: ${mileage}. Allowed mileage is between 0 and 1,000,000.` });
            }
        }

        // Validate year
        if (year !== undefined) {
            if (year < 1900 || year > new Date().getFullYear()) {
                return res.status(400).json({ message: `Invalid year: ${year}. Allowed year is between 1900 and the current year.` });
            }
        }

        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: vehicleId, user: userId }, // Ensure the vehicle belongs to the user
            req.body,
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        return res.status(200).json(vehicle);
    } catch (error) {
        logger.error("Error modifying vehicle", error);
        return res.status(500).json({ message: "Server error", error });
    }
};