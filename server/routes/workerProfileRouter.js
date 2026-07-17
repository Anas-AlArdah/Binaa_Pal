const express = require('express');
const router = express.Router();
const workerProfileController = require('../controllers/workerProfileControllers');
const {
  authenticateToken,
  requireSelfBody,
  requireWorkerProfileOwner,
} = require('../middleware/authMiddleware');

router.get('/', workerProfileController.getAllWorkerProfiles);
router.post(
  '/',
  authenticateToken,
  requireSelfBody('user_id'),
  workerProfileController.createWorkerProfile
);
router.get('/user/:userId', workerProfileController.getWorkerProfileByUserId);
router.put(
  '/:id',
  authenticateToken,
  requireWorkerProfileOwner('id'),
  workerProfileController.updateWorkerProfile
);
router.get('/:id', workerProfileController.getWorkerProfile);

module.exports = router;
