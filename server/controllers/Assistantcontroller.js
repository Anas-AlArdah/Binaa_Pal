const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `أنت مساعد ذكي لمنصة "بناء بال" لمساعدة الناس في مشاكل البناء والصيانة في فلسطين.

مهمتك:
1. اسمع مشكلة المستخدم
2. اقترح حلولاً  يقدر يعملها بنفسه
3. إذا المشكلة تحتاج متخصص، اقترح نوع العامل المناسب

قواعد:
- تكلم بالعربي دائماً
- كن ودوداً ومختصراً
- اقترح الحل البسيط أولاً قبل العامل
- إذا احتاج عامل، قل له نوع العامل (سباك، كهربائي، نجار، إلخ)


أمثلة:
- تسريب مية → اقترح إغلاق المحبس أولاً، ثم إذا استمر → سباك
- كهرباء مقطوعة → تحقق من القاطع أولاً، ثم إذا استمر → كهربائي
- باب ما بيقفل → اقترح ضبط المفصلات، ثم → نجار`;

async function chat(req, res) {
    try {
        const { messages } = req.body;
        if (!messages || !messages.length) {
            return res.status(400).json({ success: false, message: 'ما في رسائل' });
        }

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 300,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages,
                ],
            },
            { headers: { Authorization: `Bearer ${GROQ_API_KEY}` } }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ success: true, reply });

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ success: false, message: 'حدث خطأ', error: err.message });
    }
}

module.exports = { chat };