const { Skill } = require('../models');

async function createSkill(req, res) {
    try {
        const skill = await Skill.create({
            skill_name: req.body.skill_name,
        });
        res.status(201).json(skill);
    } catch (err) {
        res.status(400).json({
            message: 'Error creating skill',
            error: err.message
        });
    }
}

async function getSkillById(req, res) {
    try {
        const skill = await Skill.findByPk(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        res.status(200).json(skill);
    } catch (err) {
        res.status(400).json({
            message: 'Error getting skill',
            error: err.message
        });
    }
}

async function getAllSkills(req, res) {
    try {
        const skills = await Skill.findAll();
        res.status(200).json(skills);
    } catch (err) {
        res.status(400).json({
            message: 'Error getting skills',
            error: err.message
        });
    }
}

async function deleteSkill(req, res) {
    try {
        const skill = await Skill.findByPk(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        await skill.destroy();
        res.status(200).json({ message: 'Skill deleted successfully' });
    } catch (err) {
        res.status(500).json({
            message: 'Error deleting skill',
            error: err.message
        });
    }
}

async function updateSkill(req, res) {
    try {
        const skill = await Skill.findByPk(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        await skill.update({
            skill_name: req.body.skill_name,
        });
        res.status(200).json(skill);
    } catch (err) {
        res.status(500).json({
            message: 'Error updating skill',
            error: err.message
        });
    }
}

module.exports = {
    createSkill,
    getSkillById,
    getAllSkills,
    deleteSkill,
    updateSkill,
};
