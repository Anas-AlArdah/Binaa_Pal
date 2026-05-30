const { Review, User } = require('../models');

// GET all reviews for a specific worker profile
const getWorkerReviews = async (req, res) => {
    try {
        const { workerProfileId } = req.params;

        const reviews = await Review.findAll({
            where: { worker_id: workerProfileId },
            include: [
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'firstname', 'lastname']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(reviews);
    } catch (error) {
        console.error('getWorkerReviews error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST create a new review
const createReview = async (req, res) => {
    try {
        const authenticatedUserId = Number(req.user?.id);
        const {
            worker_id, // WorkerProfile ID
            request_id,
            comment,
            rating,
            punctuality
        } = req.body;

        if (!Number.isInteger(authenticatedUserId) || authenticatedUserId <= 0) {
            return res.status(401).json({
                message: 'Authentication token is required.'
            });
        }

        if (!worker_id || !rating) {
            return res.status(400).json({
                message: 'Worker ID and rating are required.'
            });
        }

        const review = await Review.create({
            worker_id,
            user_id: authenticatedUserId,
            request_id: request_id || null,
            comment,
            rating,
            punctuality: punctuality || rating, // Default punctuality to rating if not provided
            date: new Date()
        });

        // Fetch the review with reviewer info to return
        const fullReview = await Review.findByPk(review.id, {
            include: [
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'firstname', 'lastname']
                }
            ]
        });

        res.status(201).json(fullReview);
    } catch (error) {
        console.error('createReview error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getWorkerReviews,
    createReview
};
