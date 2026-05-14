const { Availability, User } = require('../models');

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
            ],
            order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
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
            order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
        });

        return res.status(200).json(records);

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
            is_available
        } = req.body;

        if (!user_id || !day_of_week || !start_time || !end_time) {
            return res.status(400).json({
                message: 'user_id, day_of_week, start_time, and end_time are required',
            });
        }

        const validDays = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];

        if (!validDays.includes(day_of_week)) {
            return res.status(400).json({
                message: `day_of_week must be one of: ${validDays.join(', ')}`,
            });
        }

        const record = await Availability.create({
            user_id,
            day_of_week,
            start_time,
            end_time,
            is_available: is_available ?? true
        });

        return res.status(201).json({
            message: 'Availability created successfully',
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
            const validDays = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];

            if (!validDays.includes(day_of_week)) {
                return res.status(400).json({
                    message: `day_of_week must be one of: ${validDays.join(', ')}`,
                });
            }
        }

        await record.update({
            day_of_week,
            start_time,
            end_time,
            is_available
        });

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