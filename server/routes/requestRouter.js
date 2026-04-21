const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestcontrollers');

router.get('/', requestController.getAllRequests);
router.post('/', requestController.createRequest);
router.get('/:id', requestController.getRequestById);
router.put('/:id', requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);

module.exports = router;