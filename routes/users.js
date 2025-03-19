var express = require('express');
const bcrypt = require('bcrypt');
const { protect } = require('../middlewares/authMiddleware');
const { register, login, editProfile, refreshToken } = require('../controllers/UserController');
var router = express.Router();
const User = require('../models/User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', register);

router.post('/login', login);

router.get('/profile', protect, (req, res) => {
  res.status(200).json({ message: 'Welcome to your profile', user: req.user });
});

router.put('/profile', protect, editProfile);

router.post('/refresh-token', refreshToken);


module.exports = router;
