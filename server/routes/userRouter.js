const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontrollers');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.get('/:id', userController.getUserByID);
router.delete('/:id', userController.deleteUser);
module.exports = router;

