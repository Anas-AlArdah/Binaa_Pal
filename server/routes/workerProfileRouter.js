const express = require('express');
const router = express.Router();
const workerProfileController = require('../controllers/workerProfileControllers');

router.get('/', workerProfileController.getAllWorkerProfiles);
router.get('/:id', workerProfileController.getWorkerProfile);

module.exports = router;
