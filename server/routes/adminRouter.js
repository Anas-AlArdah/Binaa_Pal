const express = require('express');
const adminController = require('../controllers/admincontrollers');
const { authenticateAdminToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateAdminToken);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/workers', adminController.getWorkers);
router.get('/requests', adminController.getRequests);
router.patch('/requests/:id/status', adminController.updateRequestStatus);
router.get('/crafts', adminController.getCrafts);
router.post('/crafts', adminController.createCraft);
router.patch('/crafts/:id', adminController.updateCraft);
router.delete('/crafts/:id', adminController.deleteCraft);

module.exports = router;
