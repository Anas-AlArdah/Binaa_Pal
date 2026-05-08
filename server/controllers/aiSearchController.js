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
                    content: `أنت مساعد لمنصة بناء بال لإيجاد الحرفيين في فلسطين.
استخرج من النص هذه المعلومات بصيغة JSON فقط بدون أي شرح:
{"skill":"اسم المهارة أو null","location":"المدينة أو null","name":"اسم الشخص أو null"}
أمثلة:
- "أبحث عن نجار في نابلس" → {"skill":"نجارة","location":"نابلس","name":null}
- "محتاج كهربائي" → {"skill":"كهرباء","location":null,"name":null}
- "علي" → {"skill":null,"location":null,"name":"علي"}`
                },
                { role: 'user', content: userText }
            ],
        },
        { headers: { Authorization: `Bearer ${GROQ_API_KEY}` } }
    );

    const raw = response.data.choices[0].message.content;
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
}

async function aiSearch(req, res) {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'اكتب شي تبحث عنه' });

        const filters = await extractFiltersWithAI(q);
        console.log('Filters from AI:', filters);

        const userWhere = { role_id: 2 };
        if (filters.name) {
            userWhere[Op.or] = [
                { firstname: { [Op.like]: `%${filters.name}%` } },
                { lastname:  { [Op.like]: `%${filters.name}%` } },
            ];
        }
        if (filters.location) {
            userWhere.location = { [Op.like]: `%${filters.location}%` };
        }

        const skillWhere = {};
        if (filters.skill) {
            skillWhere.skill_name = { [Op.like]: `%${filters.skill}%` };
        }

        const workers = await User.findAll({
            where: userWhere,
            attributes: ['id', 'firstname', 'lastname', 'phone', 'location'],
            include: [
                {
                    model: Worker_Skill,
                    as: 'worker_skills',
                    required: !!filters.skill,
                    include: [
                        {
                            model: Skill,
                            as: 'skill',
                            where: Object.keys(skillWhere).length ? skillWhere : undefined,
                            attributes: ['skill_name'],
                        },
                    ],
                },
                {
                    model: WorkerProfile,
                    as: 'worker_profile',
                    required: false,
                    attributes: ['id'],
                }
            ],
        });

        const result = workers.map(u => ({
            id: u.id,
            workerProfileId: u.worker_profile?.id || null,
            name: `${u.firstname} ${u.lastname}`,
            location: u.location,
            phone: u.phone,
            skills: u.worker_skills.map(ws => ws.skill?.skill_name).filter(Boolean),
        }));

        res.json({ success: true, filters, count: result.length, workers: result });

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ success: false, message: 'حدث خطأ', error: err.message });
    }
}

module.exports = { aiSearch };
