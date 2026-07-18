const { Availability, Skill, User } = require('../models');

const VALID_DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const normalizeSkillId = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const skillId = Number(value);
    return Number.isInteger(skillId) && skillId > 0 ? skillId : null;
};

const buildSkillInclude = () => ({
    model: Skill,
    as: 'skill',
    attributes: ['id', 'skill_name'],
});

const ensureSkillExists = async (skillId) => {
    if (!skillId) {
        return true;
    }

    const skill = await Skill.findByPk(skillId, { attributes: ['id'] });
    return Boolean(skill);
};

// GET all availability records
const getAllAvailability = async (req, res) => {
    try {
        const records = await Availability.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname', 'email'],
                },
                buildSkillInclude(),
            ],
            order: [['skill_id', 'ASC'], ['day_of_week', 'ASC'], ['start_time', 'ASC']],
        });

        return res.status(200).json(records);

    } catch (error) {
        console.error('getAllAvailability error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// GET availability by ID
const getAvailabilityById = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await Availability.findOne({
            where: { av_id: id },

            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname', 'email'],
                },
                buildSkillInclude(),
            ],
        });

        if (!record) {
            return res.status(404).json({
                message: 'Availability record not found'
            });
        }

        return res.status(200).json(record);

    } catch (error) {
        console.error('getAvailabilityById error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// GET availability by user_id
const getAvailabilityByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const records = await Availability.findAll({
            where: { user_id: userId },
            include: [buildSkillInclude()],
            order: [['skill_id', 'ASC'], ['day_of_week', 'ASC'], ['updatedAt', 'DESC'], ['av_id', 'DESC']],
        });

        const seenSlots = new Set();
        const latestRecordsByCraftDay = records.filter((record) => {
            const slotKey = `${record.skill_id || 'primary'}:${record.day_of_week}`;

            if (seenSlots.has(slotKey)) {
                return false;
            }

            seenSlots.add(slotKey);
            return true;
        });

        return res.status(200).json(latestRecordsByCraftDay);

    } catch (error) {
        console.error('getAvailabilityByUser error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// POST create availability
const createAvailability = async (req, res) => {
    try {
        const {
            user_id,
            day_of_week,
            start_time,
            end_time,
            skill_id,
            is_available
        } = req.body;

        if (!user_id || !day_of_week || !start_time || !end_time) {
            return res.status(400).json({
                message: 'user_id, day_of_week, start_time, and end_time are required',
            });
        }

        if (!VALID_DAYS.includes(day_of_week)) {
            return res.status(400).json({
                message: `day_of_week must be one of: ${VALID_DAYS.join(', ')}`,
            });
        }

        const normalizedSkillId = normalizeSkillId(skill_id);

        if (!(await ensureSkillExists(normalizedSkillId))) {
            return res.status(400).json({
                message: 'Selected skill does not exist',
            });
        }

        const existingRecord = await Availability.findOne({
            where: { user_id, day_of_week, skill_id: normalizedSkillId },
            order: [['updatedAt', 'DESC'], ['av_id', 'DESC']],
        });

        const record = existingRecord
            ? await existingRecord.update({
                start_time,
                end_time,
                skill_id: normalizedSkillId,
                is_available: is_available ?? true
            })
            : await Availability.create({
                user_id,
                skill_id: normalizedSkillId,
                day_of_week,
                start_time,
                end_time,
                is_available: is_available ?? true
            });

        return res.status(201).json({
            message: existingRecord
                ? 'Availability updated successfully'
                : 'Availability created successfully',
            availability: record,
        });

    } catch (error) {
        console.error('createAvailability error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// PUT update availability
const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            day_of_week,
            start_time,
            end_time,
            skill_id,
            is_available
        } = req.body;

        const record = await Availability.findOne({
            where: { av_id: id }
        });

        if (!record) {
            return res.status(404).json({
                message: 'Availability record not found'
            });
        }

        if (day_of_week) {
            if (!VALID_DAYS.includes(day_of_week)) {
                return res.status(400).json({
                    message: `day_of_week must be one of: ${VALID_DAYS.join(', ')}`,
                });
            }
        }

        const updates = {
            day_of_week,
            start_time,
            end_time,
            is_available
        };

        if (skill_id !== undefined) {
            updates.skill_id = normalizeSkillId(skill_id);

            if (!(await ensureSkillExists(updates.skill_id))) {
                return res.status(400).json({
                    message: 'Selected skill does not exist',
                });
            }
        }

        await record.update(updates);

        return res.status(200).json({
            message: 'Availability updated successfully',
            availability: record,
        });

    } catch (error) {
        console.error('updateAvailability error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// DELETE availability
const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await Availability.findOne({
            where: { av_id: id }
        });

        if (!record) {
            return res.status(404).json({
                message: 'Availability record not found'
            });
        }

        await record.destroy();

        return res.status(200).json({
            message: 'Availability deleted successfully'
        });

    } catch (error) {
        console.error('deleteAvailability error:', error);

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllAvailability,
    getAvailabilityById,
    getAvailabilityByUser,
    createAvailability,
    updateAvailability,
    deleteAvailability,
};
