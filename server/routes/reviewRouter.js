const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get reviews for a worker
router.get('/worker/:workerProfileId', reviewController.getWorkerReviews);

// Post a new review
router.post('/', authenticateToken, reviewController.createReview);

module.exports = router;
