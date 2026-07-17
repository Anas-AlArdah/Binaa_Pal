const express = require('express');
const workerRequestController = require('../controllers/workerRequestController');

const router = express.Router();

router.post('/', workerRequestController.requestWorker);
router.get('/worker/:workerId', workerRequestController.getWorkerRequests);
router.get('/user/:userId', workerRequestController.getClientRequests);
router.patch('/:id/status', workerRequestController.updateWorkerRequestStatus);

module.exports = router;
