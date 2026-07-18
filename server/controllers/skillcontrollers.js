const { Skill, Worker_Skill } = require('../models');

function cleanString(value) {
    return String(value || '').trim();
}

function makeSlug(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '');
}

function buildSkillPayload(body) {
    const skillName = cleanString(body.skill_name || body.name);
    const slug = cleanString(body.slug) || makeSlug(skillName);

    return {
        skill_name: skillName,
        slug: slug || null,
        description: cleanString(body.description) || null,
        icon_key: cleanString(body.icon_key || body.iconKey) || null,
    };
}

async function createSkill(req, res) {
    try {
        const payload = buildSkillPayload(req.body);

        if (!payload.skill_name) {
            return res.status(400).json({ message: 'Skill name is required' });
        }

        const skill = await Skill.create(payload);

        if (!skill.slug) {
            await skill.update({
                slug: `skill-${skill.id}`,
                icon_key: skill.icon_key || `skill-${skill.id}`,
            });
        }

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
        const skills = await Skill.findAll({
            order: [['skill_name', 'ASC']],
        });
        res.status(200).json(skills);
    } catch (err) {
        res.status(400).json({
            message: 'Error getting skills',
            error: err.message
        });
    }
}

async function deleteSkill(req, res) {
    const transaction = await Skill.sequelize.transaction();

    try {
        const skill = await Skill.findByPk(req.params.id, { transaction });
        if (!skill) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Skill not found' });
        }

        const removedWorkerLinks = await Worker_Skill.destroy({
            where: { skill_id: skill.id },
            transaction,
        });

        await skill.destroy({ transaction });
        await transaction.commit();
        res.status(200).json({ message: 'Skill deleted successfully', removedWorkerLinks });
    } catch (err) {
        if (!transaction.finished) {
            await transaction.rollback();
        }

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

        const payload = buildSkillPayload(req.body);

        if (!payload.skill_name) {
            return res.status(400).json({ message: 'Skill name is required' });
        }

        await skill.update(payload);
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
