const express = require('express');
const router = express.Router();
const {
    authenticateToken,
    requireAvailabilityOwner,
    requireSelfBody,
} = require('../middleware/authMiddleware');

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
router.post('/', authenticateToken, requireSelfBody('user_id'), createAvailability);

// UPDATE availability
router.put('/:id', authenticateToken, requireAvailabilityOwner('id'), updateAvailability);

// DELETE availability
router.delete('/:id', authenticateToken, requireAvailabilityOwner('id'), deleteAvailability);

module.exports = router;
