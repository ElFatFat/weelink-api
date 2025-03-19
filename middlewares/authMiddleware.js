const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET; // Use the same secret key
    const decoded = jwt.verify(token, secret); // Verify the token
    req.user = decoded; // Attach the decoded payload to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

