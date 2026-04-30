const { Review } = require('../models');

async function createReview(req, res) {
    try {
        const review = await Review.create({
            worker_id: req.body.worker_id,
            request_id: req.body.request_id,
            user_id: req.body.user_id,
            date: req.body.date,
            comment: req.body.comment,
            rating: req.body.rating,
            punctuality: req.body.punctuality
        });
        res.status(201).json(review);
    } catch (err) {
        res.status(400).json({
            message: 'Error creating review',
            error: err.message
        });
    }
}

async function getReviewById(req, res) {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json(review);
    } catch (err) {
        res.status(400).json({
            message: 'Error getting review',
            error: err.message
        });
    }
}

async function getAllReviews(req, res) {
    try {
        const reviews = await Review.findAll();
        res.status(200).json(reviews);
    } catch (err) {
        res.status(400).json({
            message: 'Error getting reviews',
            error: err.message
        });
    }
}

async function deleteReview(req, res) {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        await review.destroy();
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({
            message: 'Error deleting review',
            error: err.message
        });
    }
}

async function updateReview(req, res) {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        await review.update({
            worker_id: req.body.worker_id,
            request_id: req.body.request_id,
            user_id: req.body.user_id,
            date: req.body.date,
            comment: req.body.comment,
            rating: req.body.rating,
            punctuality: req.body.punctuality
        });
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({
            message: 'Error updating review',
            error: err.message
        });
    }
}

module.exports = {
    createReview,
    getReviewById,
    getAllReviews,
    deleteReview,
    updateReview,
};
