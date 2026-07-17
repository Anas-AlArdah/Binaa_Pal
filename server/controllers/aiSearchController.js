const { User, Skill, Worker_Skill, WorkerProfile, Role } = require('../models');
const { Op } = require('sequelize');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

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

function normalizeFilters(filters) {
    const normalized = blankFilters();

    for (const key of Object.keys(normalized)) {
        const value = filters?.[key];
        normalized[key] = typeof value === 'string' && value.trim()
            ? value.trim()
            : null;
    }

    return normalized;
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

async function extractFiltersWithAI(userText) {
    if (!GROQ_API_KEY) {
        return extractFiltersFallback(userText);
    }

    try {
        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0,
                    messages: [
                        {
                            role: 'system',
                            content: `
أنت مساعد ذكي لمنصة "بناء بال".

استخرج المعلومات بصيغة JSON فقط.
لا تضف markdown.
لا تكتب أي شيء خارج JSON.

{
  "skill": "اسم المهارة أو null",
  "location": "المدينة أو null",
  "name": "اسم الشخص أو null"
}
`
                        },
                        {
                            role: 'user',
                            content: userText
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Groq request failed with status ${response.status}`);
        }

        const data = await response.json();
        const raw = data?.choices?.[0]?.message?.content || '{}';
        const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiFilters = normalizeFilters(JSON.parse(clean));
        const fallbackFilters = await extractFiltersFallback(userText);

        return {
            skill: aiFilters.skill || fallbackFilters.skill,
            location: aiFilters.location || fallbackFilters.location,
            name: aiFilters.name || fallbackFilters.name
        };
    } catch (error) {
        console.warn('AI search filter extraction failed, using fallback:', error.message);
        return extractFiltersFallback(userText);
    }
}

async function aiSearch(req, res) {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'اكتب شيء للبحث'
            });
        }

        const filters = await extractFiltersWithAI(q);
        if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AI_SEARCH === 'true') {
            console.log('AI Filters:', filters);
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
                        [Op.like]: `%${filters.name}%`
                    }
                },
                {
                    lastname: {
                        [Op.like]: `%${filters.name}%`
                    }
                }
            ];
        }

        if (filters.location) {
            userWhere.location = {
                [Op.like]: `%${filters.location}%`
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
                                        [Op.like]: `%${filters.skill}%`
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
    aiSearch
};
