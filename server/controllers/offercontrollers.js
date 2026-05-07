const { Offer } = require('../models');

async function createOffer(req, res) {
    try {
        const offer = await Offer.create({
            worker_id: req.body.worker_id,
            state: req.body.state,
            date: req.body.date
        });
        res.status(201).json(offer);
    } catch (err) {
        res.status(500).json({
            message: "Failed to create offer.",
            error: err.message
        });
    }
}

async function getOfferById(req, res) {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }
        res.status(200).json(offer);
    } catch (err) {
        res.status(500).json({
            message: "Failed to get offer.",
            error: err.message
        });
    }
}

async function getAllOffers(req, res) {
    try {
        const offers = await Offer.findAll();
        res.status(200).json(offers);
    } catch (err) {
        res.status(500).json({
            message: "Failed to get offers.",
            error: err.message
        });
    }
}

async function updateOffer(req, res) {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }
        await offer.update({
            worker_id: req.body.worker_id,
            state: req.body.state,
            date: req.body.date
        });
        res.status(200).json(offer);
    } catch (err) {
        res.status(500).json({
            message: "Failed to update offer.",
            error: err.message
        });
    }
}

async function deleteOffer(req, res) {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }
        await offer.destroy();
        res.status(200).json({ message: "Offer deleted successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete offer.",
            error: err.message
        });
    }
}

module.exports = {
    createOffer,
    getOfferById,
    getAllOffers,
    updateOffer,
    deleteOffer
};
