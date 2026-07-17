const express = require('express');
const router = express.Router();
const workerskillController = require('../controllers/workerskillcontrollers');
const { authenticateToken, requireSelfBody } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, requireSelfBody('worker_id'), workerskillController.addWorkerSkill);
router.get('/:worker_id', workerskillController.getWorkerSkillsByWorkerId);
router.delete('/', authenticateToken, requireSelfBody('worker_id'), workerskillController.removeWorkerSkill);

module.exports = router;
