const { User, Skill, Worker_Skill, WorkerProfile } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function extractFiltersWithAI(userText) {
    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            messages: [
                {
                    role: 'system',
                    content: `
أنت مساعد ذكي لمنصة "بناء بال".

استخرج المعلومات بصيغة JSON فقط:

{
  "skill":"اسم المهارة أو null",
  "location":"المدينة أو null",
  "name":"اسم الشخص أو null"
}
`
                },
                {
                    role: 'user',
                    content: userText
                }
            ]
        },
        {
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`
            }
        }
    );

    const raw = response.data.choices[0].message.content;

    const clean = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

    return JSON.parse(clean);
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

        console.log('AI Filters:', filters);

        const userWhere = {
            role_id: 2
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
                    attributes: ['id']
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

                            attributes: ['skill_name']
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

        console.error(err.response?.data || err.message);

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