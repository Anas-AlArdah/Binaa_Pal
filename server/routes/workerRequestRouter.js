const express = require('express');
const workerRequestController = require('../controllers/workerRequestController');

const router = express.Router();

router.post('/', workerRequestController.requestWorker);

module.exports = router;
