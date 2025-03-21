const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Register a new user
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user
        const user = new User({ email, password });
        const accessToken = user.generateJWT(); // Short-lived token
        let refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" } // Refresh token valid for 7 days
        );

        user.last_login = Date.now();
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            message: "Register successful",
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = user.generateJWT(); // Short-lived token
        let refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" } // Refresh token valid for 7 days
        );

        user.last_login = Date.now();
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.editProfile = async (req, res) => {
    const { email, password, profile_picture } = req.body;

    try {
        // Ensure the user making the request matches the token
        const userId = req.user.id; // `req.user` is populated by the `protect` middleware
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the new email is already in use by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: "Email is already in use" });
            }
            user.email = email;
        }

        // Update the password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Update the profile picture if provided
        if (profile_picture) {
            user.profile_picture = profile_picture;
        }

        // Save the updated user
        await user.save();

        // Regenerate a new token with updated user data
        const token = user.generateJWT();

        res.status(200).json({
            message: "Profile updated successfully",
            user,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is required" });
    }

    try {
        let decoded;
        let idDecoded;
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
            console.log(decoded.id);
        } catch (error) {
            logger.verbose("Error verifying refresh token", error);
            return res.status(403).json({
                message: "Invalid or expired refresh token",
                error,
            });
        }
        // Find the user associated with the refresh token

        //List all users.
        const users = await User.find();
        console.log(users);

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(404).json({ message: "Invalid refresh token" });
        }


        // Generate a new access token
        const accessToken = user.generateJWT(); // Short-lived token
        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" } // Refresh token valid for 7 days
        );


        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({ accessToken, newRefreshToken });
    } catch (error) {
        res.status(403).json({
            message: "Invalid or expired refresh token",
            error,
        });
    }
};

exports.logout = async (req, res) => {
    //Logout the user and invalidate the refresh token
    const userId = req.user.id;
    const user = await User.findById(userId).select("refreshToken");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: "Logout successful" });
};
