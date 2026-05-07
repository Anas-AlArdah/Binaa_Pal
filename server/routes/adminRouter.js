const express = require('express');
const adminController = require('../controllers/admincontrollers');
const { authenticateAdminToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', authenticateAdminToken, adminController.getDashboard);

module.exports = router;
