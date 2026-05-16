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
            return res.status(400).json({
                success: false,
                message: 'ما في رسائل'
            });
        }

        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                },

                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 300,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages,
                    ],
                }),
            }
        );

        const data = await response.json();

        const reply =
            data.choices?.[0]?.message?.content || 'ما قدرت أجيب رد';

        res.json({
            success: true,
            reply,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: 'حدث خطأ',
            error: err.message,
        });
    }
}

module.exports = { chat };