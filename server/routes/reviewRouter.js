const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Get reviews for a worker
router.get('/worker/:workerProfileId', reviewController.getWorkerReviews);

// Post a new review
router.post('/', reviewController.createReview);

module.exports = router;
