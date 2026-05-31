import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../utils/api';


export default function SearchBox() {
    const [query, setQuery]     = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
const[skills, setSkills] = useState([]);

   useEffect(() => {

   const getskills = async () => {
      try {
          const json = await fetchJson('/api/skills')
          setSkills(Array.isArray(json) ? json : [])

      }catch{
          setSkills([])
      }
   }
   getskills();
   },[])
        const handleSearch = async (overrideQuery) => {
        const q = overrideQuery || query;
        if (!q.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const data = await fetchJson(`/api/search?q=${encodeURIComponent(q)}`);
            setResults(data.workers || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };



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
                    {skills.slice(0,5).map(s => (
                        <button

                            key={s.skill_name}
                                onClick={() => { setQuery(s.skill_name); handleSearch(s.skill_name); }}
                                style={{
                                    height: 40,
                                    width: '15%',
                                    padding: '5px 16px',
                                    background: 'rgba(15,39,39,0.15)',
                                    border: '1.9px solid rgba(255,255,255,10.35)',
                                    borderRadius: 999, fontSize: 16, color: '#16171b',
                                    cursor: 'pointer', fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',

                                }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#1D6E8F'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#b4eaea'}
                         >
                            {s.skill_name}

                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {searched && (
                <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>

                    {/* AI فهم شو*/}
                    {/*{filters && (*/}
                    {/*    <div style={{*/}
                    {/*        background: '#E1F5EE', borderRadius: 8, padding: '8px 14px',*/}
                    {/*        fontSize: 13, color: '#0F6E56', marginBottom: 12,*/}
                    {/*        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',*/}
                    {/*    }}>*/}
                    {/*        <span>🤖 فهمت:</span>*/}
                    {/*        {filters.skill    && <span>خدمة: <strong>{filters.skill}</strong></span>}*/}
                    {/*        {filters.location && <span>مدينة: <strong>{filters.location}</strong></span>}*/}
                    {/*        {filters.name     && <span>اسم: <strong>{filters.name}</strong></span>}*/}

                    {/*    </div>*/}
                    {/*)}*/}

                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>جاري البحث...</p>
                    ) : results.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>لا توجد نتائج</p>
                    ) : (
                        <>
                            <p style={{ fontSize: 13, color: '#666', marginBottom: 1 }}>
                                {results.length} نتائج                            </p>
                            <div
                                style={{
                                    height: "200px",
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                }}
                            >
                            {results.map(w => (
                                <Link
                                    to={`/profile/${w.workerProfileId}`}
                                    key={w.id}
                                    style={{
                                         display: "flex", gap: 12, padding: 14,
                                        border: "1px solid #e0e0e0", borderRadius: 12, marginBottom: 10,
                                        background: "rgba(189,205,183,0.71)", textDecoration: "none", color: "inherit", alignItems: "center"}}>

                                    <div
                                        style={{
                                            width: 60, height: 60, borderRadius: "50%", background: "#E1F5EE",
                                            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold",
                                            color: "#0F6E56", flexShrink: 0, fontSize: 14,
                                        }}
                                    >
                                        {w.name?.charAt(0)}
                                    </div>

                                    {/* MIDDLE - INFO */}
                                    <div style={{ flex: 1, minWidth: 0 }}>


                                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4,}}>
                                            <div style={{fontSize: 16, fontWeight: "600", color: "#0d0e15",}}>
                                                {w.name}
                                            </div>


                                        </div>
                                        <div style={{fontSize: 15, color: "#555", marginBottom: 6,}}>
                                            📍 {w.location}
                                        </div>

                                        <div style={{display: "flex", gap: 5, flexWrap: "wrap",}}>
                                            {w.skills.map((s) => (
                                                <span
                                                    key={s}
                                                    style={{
                                                        padding: "3px 8px", background: "#E1F5EE", color: "#0F6E56",
                                                        borderRadius: 999, fontSize: 12,}}
                                                >{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{fontSize: 12, color: "#666", whiteSpace: "nowrap",}}>
                                        📞 {w.phone}
                                    </div>
                                </Link>
                            ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
