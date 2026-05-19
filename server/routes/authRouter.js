const express = require('express');
const authController = require('../controllers/authcontrollers');
const { authenticateAdminToken, authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/admin-login', authController.adminLogin);
router.get('/me', authenticateToken, authController.me);
router.get('/admin/me', authenticateAdminToken, authController.adminMe);

module.exports = router;
