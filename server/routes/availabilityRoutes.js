const express = require('express');
const router = express.Router();

const {
    getAllAvailability,
    getAvailabilityById,
    getAvailabilityByUser,
    createAvailability,
    updateAvailability,
    deleteAvailability,
} = require('../controllers/availabilityController');

// GET all availability
router.get('/', getAllAvailability);

// GET availability by user
router.get('/user/:userId', getAvailabilityByUser);

// GET single availability by id
router.get('/:id', getAvailabilityById);

// CREATE availability
router.post('/', createAvailability);

// UPDATE availability
router.put('/:id', updateAvailability);

// DELETE availability
router.delete('/:id', deleteAvailability);

module.exports = router;