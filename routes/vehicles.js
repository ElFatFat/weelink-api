var express = require('express');
const bcrypt = require('bcrypt');
const { protect } = require('../middlewares/authMiddleware');
const { newVehicle, getVehicle, getVehicles, modifyVehicle } = require('../controllers/VehicleController');
var router = express.Router();

/* GET all user's vehicles. */
router.get('/', protect, getVehicles);

/* POST a new vehicle. */
router.post('/', protect, newVehicle);

/* GET a specific vehicle. */
router.get('/:id', protect, getVehicle);

/* PUT a specific vehicle. */
router.put('/:id', protect, modifyVehicle);



module.exports = router;
