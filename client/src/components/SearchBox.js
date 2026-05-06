import { useState } from 'react';

const QUICK = ['دهان', 'بلاط', 'نجارة', 'كهرباء', 'سباكة', 'تكييف'];

export default function SearchBox() {
    const [query, setQuery]     = useState('');
    const [results, setResults] = useState([]);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (overrideQuery) => {
        const q = overrideQuery || query;
        if (!q.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`http://localhost:3001/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data.workers || []);
            setFilters(data.filters || null);
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2);

    return (
        <div style={{ direction: 'rtl', width: '100%' }}>

            {/* Hero */}
            <div   style={{

                background: 'linear-gradient(rgba(10,40,60,0),rgba(10,40,60,0.0)), url("/hero-bg.jpg") center/cover',
                padding: '1rem 1.0rem', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            }}>

                <p style={{ color: 'rgb(15,39,39)', fontSize: 24, }}>
                    اكتب بالعربي بشكل طبيعي — الذكاء الاصطناعي بيفهمك
                </p>

                {/* Search Bar */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    background: '#fff', borderRadius: 999,
                    padding: '5px 5px 5px 18px', gap: 8,
                    width: '100%', maxWidth: 540,
                }}>
                    <span style={{ fontSize: 16 }}>🔍</span>
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder='مثال: "أبحث عن نجار في نابلس"'
                        style={{
                            flex: 1, border: 'none', outline: 'none',
                            fontSize: 14, background: 'transparent',
                            direction: 'rtl', fontFamily: 'inherit', color: '#1a1a1a',
                        }}
                    />
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading}
                        style={{
                            height: 36, padding: '0 20px',
                            background: loading ? '#aaa' : '#1D6E8F',
                            color: '#fff', border: 'none', borderRadius: 999,
                            fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'background 0.15s',
                        }}
                    >
                        {loading ? '...' : 'بحث'}
                    </button>
                </div>

                {/* Quick Chips */}
                <div  style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',}}>
                    {QUICK.map(skill => (
                        <button  key={skill}
                                onClick={() => { setQuery(skill); handleSearch(skill); }}
                                style={{
                                    padding: '5px 16px',
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1.5px solid rgba(255,255,255,10.35)',
                                    borderRadius: 999, fontSize: 16, color: '#052828',
                                    cursor: 'pointer', fontFamily: 'inherit',
                                }}
                        >{skill}</button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {searched && (
                <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>

                    {/* AI فهم شو */}
                    {filters && (
                        <div style={{
                            background: '#E1F5EE', borderRadius: 8, padding: '8px 14px',
                            fontSize: 13, color: '#0F6E56', marginBottom: 12,
                            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
                        }}>
                            <span>🤖 فهمت:</span>
                            {filters.skill    && <span>خدمة: <strong>{filters.skill}</strong></span>}
                            {filters.location && <span>مدينة: <strong>{filters.location}</strong></span>}
                            {filters.name     && <span>اسم: <strong>{filters.name}</strong></span>}
                        </div>
                    )}

                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>جاري البحث...</p>
                    ) : results.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>لا توجد نتائج</p>
                    ) : (
                        <>
                            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                                {results.length} نتيجة
                            </p>
                            {results.map(w => (
                                <div key={w.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: 14, border: '0.5px solid #e0e0e0',
                                    borderRadius: 12, marginBottom: 8, background: '#fff',
                                    cursor: 'pointer', transition: 'border-color 0.15s',
                                }}
                                     onMouseEnter={e => e.currentTarget.style.borderColor = '#1D6E8F'}
                                     onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
                                >
                                    <div style={{
                                        width: 42, height: 42, borderRadius: '50%',
                                        background: '#E1F5EE', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 500, color: '#0F6E56', flexShrink: 0,
                                    }}>
                                        {initials(w.name)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: 14 }}>{w.name}</div>
                                        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📍 {w.location}</div>
                                        <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                                            {w.skills.map(s => (
                                                <span key={s} style={{
                                                    padding: '2px 8px', background: '#E1F5EE',
                                                    color: '#0F6E56', borderRadius: 999, fontSize: 11,
                                                }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#555' }}>{w.phone}</div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
