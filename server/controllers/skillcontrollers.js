const { Op } = require('sequelize');
const { Skill, Worker_Skill } = require('../models');
const {
    buildCraftPayload,
    getCraftSlugBase,
    getCraftValidationError,
} = require('../utils/craftMetadata');

async function createUniqueSkillSlug(payload, excludeId = null) {
    const base = getCraftSlugBase(payload);
    let slug = base;
    let suffix = 2;

    while (await Skill.findOne({
        where: {
            slug,
            ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
        },
    })) {
        slug = `${base}-${suffix}`;
        suffix += 1;
    }

    return slug;
}

async function createSkill(req, res) {
    try {
        const payload = buildCraftPayload(req.body);
        const validationError = getCraftValidationError(payload);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        payload.slug = await createUniqueSkillSlug(payload);

        const existingSkill = await Skill.findOne({
            where: {
                skill_name: { [Op.iLike]: payload.skill_name },
            },
        });

        if (existingSkill) {
            return res.status(409).json({ message: 'اسم الصنعة مستخدم مسبقاً.' });
        }

        const skill = await Skill.create(payload);

        res.status(201).json(skill);
    } catch (err) {
        res.status(err.name === 'SequelizeUniqueConstraintError' ? 409 : 400).json({
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

        const payload = buildCraftPayload(req.body);
        const validationError = getCraftValidationError(payload);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        payload.slug = skill.slug || await createUniqueSkillSlug(payload, skill.id);

        const existingSkill = await Skill.findOne({
            where: {
                id: { [Op.ne]: skill.id },
                skill_name: { [Op.iLike]: payload.skill_name },
            },
        });

        if (existingSkill) {
            return res.status(409).json({ message: 'اسم الصنعة مستخدم مسبقاً.' });
        }

        await skill.update(payload);
        res.status(200).json(skill);
    } catch (err) {
        res.status(err.name === 'SequelizeUniqueConstraintError' ? 409 : 500).json({
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
