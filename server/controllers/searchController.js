const { User, Skill, Worker_Skill, WorkerProfile, Role } = require('../models');
const { Op } = require('sequelize');

const LOCATIONS = [
    'رام الله',
    'نابلس',
    'الخليل',
    'بيت لحم',
    'جنين',
    'طولكرم',
    'قلقيلية',
    'سلفيت',
    'أريحا',
    'طوباس',
    'القدس'
];

function blankFilters() {
    return {
        skill: null,
        location: null,
        name: null
    };
}

function normalizeSearchText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/\s+/g, ' ');
}

async function extractFiltersFallback(userText) {
    const filters = blankFilters();
    const normalizedQuery = normalizeSearchText(userText);

    if (!normalizedQuery) {
        return filters;
    }

    const skills = await Skill.findAll({
        attributes: ['skill_name'],
        raw: true
    });

    const matchedSkill = skills.find(({ skill_name }) => {
        const normalizedSkill = normalizeSearchText(skill_name);
        const withoutArticle = normalizedSkill.replace(/^ال/, '');

        return normalizedQuery.includes(normalizedSkill)
            || normalizedQuery.includes(withoutArticle)
            || normalizedSkill.includes(normalizedQuery);
    });

    if (matchedSkill) {
        filters.skill = matchedSkill.skill_name;
    }

    const matchedLocation = LOCATIONS.find(location =>
        normalizedQuery.includes(normalizeSearchText(location))
    );

    if (matchedLocation) {
        filters.location = matchedLocation;
    }

    if (!filters.skill && !filters.location) {
        filters.name = String(userText).trim();
    }

    return filters;
}

async function searchWorkers(req, res) {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'اكتب شيء للبحث'
            });
        }

        const filters = await extractFiltersFallback(q);
        if (process.env.NODE_ENV === 'development' && process.env.DEBUG_SEARCH === 'true') {
            console.log('Search filters:', filters);
        }

        const workerRole = await Role.findOne({
            where: {
                type: {
                    [Op.in]: ['Worker', 'worker', 'WORKER']
                }
            },
            attributes: ['id']
        });

        if (!workerRole) {
            return res.status(500).json({
                success: false,
                message: 'Worker role is missing'
            });
        }

        const userWhere = {
            role_id: workerRole.id
        };

        if (filters.name) {
            userWhere[Op.or] = [
                {
                    firstname: {
                        [Op.iLike]: `%${filters.name}%`
                    }
                },
                {
                    lastname: {
                        [Op.iLike]: `%${filters.name}%`
                    }
                }
            ];
        }

        if (filters.location) {
            userWhere.location = {
                [Op.iLike]: `%${filters.location}%`
            };
        }

        const workers = await User.findAll({
            distinct: true,
            where: userWhere,
            attributes: [
                'id',
                'firstname',
                'lastname',
                'phone',
                'location'
            ],
            include: [
                {
                    model: WorkerProfile,
                    as: 'worker_profile',
                    attributes: ['id'],
                    required: true
                },
                {
                    model: Worker_Skill,
                    as: 'worker_skills',
                    required: !!filters.skill,
                    include: [
                        {
                            model: Skill,
                            as: 'skill',
                            where: filters.skill
                                ? {
                                    skill_name: {
                                        [Op.iLike]: `%${filters.skill}%`
                                    }
                                }
                                : undefined,
                            attributes: ['skill_name'],
                            required: !!filters.skill
                        }
                    ]
                }
            ]
        });

        const result = workers.map(user => ({
            id: user.id,
            workerProfileId: user.worker_profile?.id || null,
            name: `${user.firstname} ${user.lastname}`,
            location: user.location,
            phone: user.phone,
            skills: user.worker_skills
                .map(ws => ws.skill?.skill_name)
                .filter(Boolean)
        }));

        res.json({
            success: true,
            filters,
            count: result.length,
            workers: result
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: 'حدث خطأ',
            error: err.message
        });
    }
}

module.exports = {
    searchWorkers
};
