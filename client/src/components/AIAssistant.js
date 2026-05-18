import { useState, useRef, useEffect } from 'react';
import { fetchJson } from '../utils/api';

const SUGGESTIONS = [
  'عندي تسريب مياه',
  'الكهرباء مقطوعة',
  'الباب ما بيقفل',
  'في شقوق بالجدار',
  'التكييف ما بيبرد',
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك في بناء بال 👷\nأخبرني عن مشكلتك وبساعدك تحلها، أو نلاقيلك العامل المناسب.',
    },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

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
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
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
    <div style={{ position: 'fixed', bottom: 28, left: 28, zIndex: 9999, direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: 0,
          width: 320,
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 16px 50px rgba(0,0,0,0.22)',
          animation: 'aiSlideUp 0.2s ease',
          background: '#fff',
        }}>
          {/* Header */}
          <div style={{ background: '#1a2744', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👷</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>مساعد بناء بال</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>بساعدك قبل ما تطلب عامل</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{ height: 260, overflowY: 'auto', padding: '12px 14px', background: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end' }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  background: m.role === 'user' ? '#fff' : '#1a2744',
                  color: m.role === 'user' ? '#1a1a2e' : '#fff',
                  fontSize: 12.5, lineHeight: 1.6,
                  border: m.role === 'user' ? '1px solid #e5e7eb' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ padding: '9px 14px', borderRadius: '12px 4px 12px 12px', background: '#1a2744', color: '#fff', fontSize: 12 }}>...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div style={{ padding: '8px 12px', background: '#f8f9fa', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: '1px solid #e5e7eb' }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  padding: '3px 10px', border: '1px solid #1a2744',
                  borderRadius: 999, fontSize: 11, color: '#1a2744',
                  background: '#fff', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="اكتب مشكلتك هون..."
              disabled={loading}
              style={{
                flex: 1, border: '1px solid #e5e7eb', borderRadius: 999,
                padding: '7px 12px', fontSize: 12.5, fontFamily: 'Cairo, sans-serif',
                direction: 'rtl', outline: 'none', background: '#f8f9fa',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: loading || !input.trim() ? '#d1d5db' : '#1a2744',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <style>{`@keyframes aiSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: '#1a2744',
          color: 'white',
          border: 'none',
          borderRadius: 50,
          padding: '10px 18px 10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(26,39,68,0.38)',
          transition: 'all 0.2s',
          fontFamily: 'Cairo, sans-serif',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(26,39,68,0.45)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,39,68,0.38)'; }}
      >
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          👷
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ display: 'block', fontSize: 12.5, fontWeight: 700 }}>مساعد بناء بال</strong>
          <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>بساعدك قبل ما شيش عامل</span>
        </div>
      </button>

    </div>
  );
}
