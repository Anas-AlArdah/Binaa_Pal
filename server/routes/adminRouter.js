const express = require('express');
const adminController = require('../controllers/admincontrollers');
const { authenticateAdminToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateAdminToken);

router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/workers', adminController.getWorkers);
router.get('/requests', adminController.getRequests);
router.get('/crafts', adminController.getCrafts);
router.post('/crafts', adminController.createCraft);
router.delete('/crafts/:id', adminController.deleteCraft);

module.exports = router;
