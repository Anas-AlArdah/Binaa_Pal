const express = require('express');
const router = express.Router();
const userController = require('../controllers/rolecontrollers');
const { authenticateAdminToken } = require('../middleware/authMiddleware');

router.get('/', userController.getAllRole);
router.get('/:id', userController.getRolesById);
router.post('/', authenticateAdminToken, userController.createRole);
router.put('/:id', authenticateAdminToken, userController.updateRole);
router.delete('/:id', authenticateAdminToken, userController.deleteRole);
module.exports = router;

