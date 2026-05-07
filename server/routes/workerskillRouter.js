const express = require('express');
const router = express.Router();
const workerskillController = require('../controllers/workerskillcontrollers');

router.post('/', workerskillController.addWorkerSkill);
router.get('/:worker_id', workerskillController.getWorkerSkillsByWorkerId);
router.delete('/', workerskillController.removeWorkerSkill);

module.exports = router;
