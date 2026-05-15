import { useState, useRef } from 'react';
import { fetchJson } from '../utils/api';

const SUGGESTIONS = [
    'عندي تسريب مياه',
    'الكهرباء مقطوعة',
    'الباب ما بيقفل',
    'في شقوق بالجدار',
    'التكييف ما بيبرد',
];

export default function AIAssistant() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'مرحباً! أنا مساعدك في بناء بال 👷\nأخبرني عن مشكلتك وبساعدك تحلها، أو نلاقيلك العامل المناسب.',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);


    const sendMessage = async (text) => {
        const userText = text || input.trim();
        if (!userText) return;

        const newMessages = [...messages, { role: 'user', content: userText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const data = await fetchJson('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            });
            setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages([...newMessages, { role: 'assistant', content: 'حدث خطأ، حاول مرة ثانية.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ direction: 'rtl', maxWidth: 780, margin: '0 auto', fontFamily: 'inherit' }}>

            {/* Header */}
            <div style={{
                background: '#1D6E8F', borderRadius: '12px 12px 0 0',
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                }}>👷</div>
                <div>
                    <div style={{ color: '#fff', fontWeight: 500, fontSize: 14 }}>مساعد بناء بال</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>بساعدك قبل ما تطلب عامل</div>
                </div>
                <div style={{
                    marginRight: 'auto', width: 8, height: 8,
                    borderRadius: '50%', background: '#4ade80',
                }} />
            </div>

            {/* Messages */}
            <div style={{
                height: 340, overflowY: 'auto', padding: '14px 16px',
                background: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end',
                    }}>
                        <div style={{
                            maxWidth: '80%', padding: '10px 14px',
                            borderRadius: m.role === 'user'
                                ? '4px 12px 12px 12px'
                                : '12px 4px 12px 12px',
                            background: m.role === 'user' ? '#fff' : '#1D6E8F',
                            color: m.role === 'user' ? '#1a1a1a' : '#fff',
                            fontSize: 13, lineHeight: 1.6,
                            border: m.role === 'user' ? '0.5px solid #e0e0e0' : 'none',
                            whiteSpace: 'pre-wrap',
                        }}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{
                            padding: '10px 16px', borderRadius: '12px 4px 12px 12px',
                            background: '#1D6E8F', color: '#fff', fontSize: 13,
                        }}>...</div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
                <div style={{
                    padding: '8px 12px', background: '#f8f9fa',
                    display: 'flex', gap: 6, flexWrap: 'wrap',
                    borderTop: '0.5px solid #e0e0e0',
                }}>
                    {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => sendMessage(s)} style={{
                            padding: '4px 12px', border: '0.5px solid #1D6E8F',
                            borderRadius: 999, fontSize: 12, color: '#1D6E8F',
                            background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                        }}>{s}</button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{
                display: 'flex', gap: 8, padding: '10px 12px',
                background: '#fff', borderRadius: '0 0 12px 12px',
                border: '0.5px solid #e0e0e0', borderTop: 'none',
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="اكتب مشكلتك هون..."
                    disabled={loading}
                    style={{
                        flex: 1, border: '0.5px solid #e0e0e0', borderRadius: 999,
                        padding: '8px 14px', fontSize: 13, fontFamily: 'inherit',
                        direction: 'rtl', outline: 'none', background: '#f8f9fa',
                    }}
                />
                <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: loading || !input.trim() ? '#ccc' : '#1D6E8F',
                        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}
