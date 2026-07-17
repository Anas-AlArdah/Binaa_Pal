const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillcontrollers');
const { authenticateAdminToken } = require('../middleware/authMiddleware');

router.get('/', skillController.getAllSkills);
router.get('/:id', skillController.getSkillById);
router.post('/', authenticateAdminToken, skillController.createSkill);
router.put('/:id', authenticateAdminToken, skillController.updateSkill);
router.delete('/:id', authenticateAdminToken, skillController.deleteSkill);

module.exports = router;
