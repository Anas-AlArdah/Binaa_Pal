const { Worker_Skill,Skill } = require('../models');

function normalizeExperienceYears(value) {
    const normalizedValue = typeof value === 'string' ? value.trim() : value;

    if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
        return null;
    }

    const numericValue = Number(normalizedValue);

    if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 60) {
        const error = new Error('experience_years must be a whole number between 0 and 60.');
        error.statusCode = 400;
        throw error;
    }

    return numericValue;
}

async function addWorkerSkill(req, res) {
    const { worker_id, skill_id } = req.body;

  
    if (!worker_id || !skill_id) {
        return res.status(400).json({ message: "worker_id and skill_id are required." });
    }
    try {
        const experienceYears = normalizeExperienceYears(req.body.experience_years);
        const workerSkill = await Worker_Skill.create({
            worker_id: req.body.worker_id,
            skill_id: req.body.skill_id,
            experience_years: experienceYears
        });
        res.status(201).json(workerSkill);
    } catch (err) {
        console.log(err);
        res.status(err.statusCode || 500).json({
            message: "Failed to add worker skill.",
            error: err.message
        });
    }
}

async function getWorkerSkillsByWorkerId(req, res) {
    try {
        const workerSkills = await Worker_Skill.findAll({
            where: {
                worker_id: req.params.worker_id,
            },
            include: [
                {
                    model: Skill,
                    attributes: ['skill_name'],
                    as: 'skill',

                }
            ]
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

