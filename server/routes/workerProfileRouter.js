const express = require('express');
const router = express.Router();
const workerProfileController = require('../controllers/workerProfileControllers');

router.get('/', workerProfileController.getAllWorkerProfiles);
router.post('/', workerProfileController.createWorkerProfile);
router.get('/user/:userId', workerProfileController.getWorkerProfileByUserId);
router.put('/:id', workerProfileController.updateWorkerProfile);
router.get('/:id', workerProfileController.getWorkerProfile);

module.exports = router;
