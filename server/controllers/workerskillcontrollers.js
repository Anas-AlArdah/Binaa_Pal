const { Worker_Skill } = require('../models');

async function addWorkerSkill(req, res) {
    try {
        const workerSkill = await Worker_Skill.create({
            worker_id: req.body.worker_id,
            skill_id: req.body.skill_id
        });
        res.status(201).json(workerSkill);
    } catch (err) {
        res.status(500).json({
            message: "Failed to add worker skill.",
            error: err.message
        });
    }
}

async function getWorkerSkillsByWorkerId(req, res) {
    try {
        const workerSkills = await Worker_Skill.findAll({
            where: { worker_id: req.params.worker_id }
        });
        res.status(200).json(workerSkills);
    } catch (err) {
        res.status(500).json({
            message: "Failed to get worker skills.",
            error: err.message
        });
    }
}

async function removeWorkerSkill(req, res) {
    try {
        // Find the specific skill for the specific worker
        const workerSkill = await Worker_Skill.findOne({
            where: {
                worker_id: req.body.worker_id,
                skill_id: req.body.skill_id
            }
        });
        
        if (!workerSkill) {
            return res.status(404).json({ message: "Worker skill not found" });
        }
        
        await workerSkill.destroy();
        res.status(200).json({ message: "Worker skill removed successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to remove worker skill.",
            error: err.message
        });
    }
}

module.exports = {
    addWorkerSkill,
    getWorkerSkillsByWorkerId,
    removeWorkerSkill
};
