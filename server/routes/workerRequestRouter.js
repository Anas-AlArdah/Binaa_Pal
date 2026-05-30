const express = require('express');
const workerRequestController = require('../controllers/workerRequestController');
const {
  authenticateToken,
  requireSelfParam,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, workerRequestController.requestWorker);
router.get(
  '/worker/:workerId',
  authenticateToken,
  requireSelfParam('workerId'),
  workerRequestController.getWorkerRequests
);
router.patch('/:id/status', authenticateToken, workerRequestController.updateWorkerRequestStatus);

module.exports = router;
