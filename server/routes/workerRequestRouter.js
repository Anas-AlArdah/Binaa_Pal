const express = require('express');
const workerRequestController = require('../controllers/workerRequestController');

const router = express.Router();

router.post('/', workerRequestController.requestWorker);
router.get('/worker/:workerId', workerRequestController.getWorkerRequests);
router.patch('/:id/status', workerRequestController.updateWorkerRequestStatus);

module.exports = router;
