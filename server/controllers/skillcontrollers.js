const { Skill } = require('../models');

async function createSkill(req, res) {
    try {
        if (!req.body.skill_name) {
            return res.status(400).json({ message: "skill_name is required" });
        }

        const skill = await Skill.create({
            skill_name: req.body.skill_name,
        });

        res.status(201).json(skill);

    } catch (err) {
        res.status(400).json({
            message: "failed to create skill",
            error: err.message,
        });
    }
}

async function updateSkill(req, res) {
    try {
        const skill = await Skill.findByPk(req.params.id);

        if (!skill) {
            return res.status(404).json({ message: "skill not found" });
        }

        await skill.update({
            skill_name: req.body.skill_name,
        });

        res.status(200).json(skill);

    } catch (err) {
        res.status(400).json({
            message: "failed to update skill",
            error: err.message,
        });
    }
}

async function deleteSkill(req, res) {
    try {
        const skill = await Skill.findByPk(req.params.id);

        if (!skill) {
            return res.status(404).json({ message: "skill not found" });
        }

        await skill.destroy();

        res.status(200).json({ message: "skill deleted successfully" });

    } catch (err) {
        res.status(400).json({
            message: "failed to delete skill",
            error: err.message,
        });
    }
}

async function getSkills(req, res) {
    try {
        const skills = await Skill.findAll();

        if (skills.length === 0) {
            return res.status(404).json({ message: "no skills found" });
        }

        res.status(200).json(skills);

    } catch (err) {
        res.status(400).json({
            message: "failed to get skills",
            error: err.message,
        });
    }
}

async function getSkillById(req, res) {
    try {
        const skill = await Skill.findByPk(req.params.id);

        if (!skill) {
            return res.status(404).json({ message: "skill not found" });
        }

        res.status(200).json(skill);

    } catch (err) {
        res.status(400).json({
            message: "failed to get skill",
            error: err.message,
        });
    }
}

module.exports = {
    createSkill,
    updateSkill,
    deleteSkill,
    getSkillById,
    getSkills,
};