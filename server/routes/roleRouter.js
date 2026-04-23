const express = require('express');
const router = express.Router();
const userController = require('../controllers/rolecontrollers');

router.get('/', userController.getAllRole);
router.post('/', userController.createRole);
router.put('/:id', userController.updateRole);
router.get('/:id', userController.getRolesById);
router.delete('/:id', userController.deleteRole);
module.exports = router;

