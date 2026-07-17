const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offercontrollers');
const {
  authenticateToken,
  requireOfferOwner,
  requireSelfBody,
} = require('../middleware/authMiddleware');

router.get('/', offerController.getAllOffers);
router.post('/', authenticateToken, requireSelfBody('worker_id'), offerController.createOffer);
router.get('/:id', offerController.getOfferById);
router.put(
  '/:id',
  authenticateToken,
  requireOfferOwner('id'),
  requireSelfBody('worker_id'),
  offerController.updateOffer
);
router.delete('/:id', authenticateToken, requireOfferOwner('id'), offerController.deleteOffer);

module.exports = router;
