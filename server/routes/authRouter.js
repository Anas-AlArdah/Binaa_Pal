const express = require('express');
const authController = require('../controllers/authcontrollers');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/config', authController.getPublicAuthConfig);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
