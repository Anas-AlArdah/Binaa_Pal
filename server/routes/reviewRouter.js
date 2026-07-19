const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewcontrollers');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/worker/:workerProfileId', reviewController.getWorkerReviews);
router.post('/', authenticateToken, reviewController.createReview);

module.exports = router;
