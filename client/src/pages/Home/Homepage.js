import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { fetchJson } from "../../utils/api";
import AIAssistant from "../../components/AIAssistant";
import "./Homepage.css";

const STATIC_CRAFTS = [
  { id: 1, slug: "electricity", icon: "⚡", name: "كهرباء",      description: "تأسيس وصيانة كهربائية متكاملة" },
  { id: 2, slug: "carpentry",   icon: "🪵", name: "نجارة",       description: "تفصيل وصيانة الأثاث والأبواب" },
  { id: 3, slug: "plumbing",    icon: "🔧", name: "سباكة",       description: "تأسيس وصيانة شبكات المياه" },
  { id: 4, slug: "painting",    icon: "🎨", name: "دهان",        description: "أعمال الطلاء والديكور الداخلي" },
  { id: 5, slug: "tiling",      icon: "⬜", name: "تبليط",       description: "تركيب السيراميك والرخام" },
  { id: 6, slug: "appliances",  icon: "🔌", name: "صيانة أجهزة", description: "إصلاح الأجهزة المنزلية" },
  { id: 7, slug: "construction",icon: "🏗️", name: "بناء",        description: "أعمال البناء والتشطيبات" },
  { id: 8, slug: "blacksmithing",icon:"🔨", name: "حدادة",       description: "أعمال الحدادة والأبواب المعدنية" },
];

const QUICK_CHIPS = ["كهرباء", "سباكة", "نجارة", "دهان", "تبليط"];

const TRUST_ITEMS = [
  { icon: "🛡️", title: "حرفيون موثوقون", desc: "تم التحقق من هويتهم وكفاءتهم" },
  { icon: "⚡", title: "سرعة في الإنجاز", desc: "تواصل مباشر وخدمة سريعة" },
  { icon: "💰", title: "أسعار تنافسية", desc: "خيارات متعددة تناسب ميزانيتك" },
  { icon: "⭐", title: "تقييمات حقيقية", desc: "اختر بناءً على تجارب العملاء السابقة" },
];

export default function Homepage() {
  const [crafts, setCrafts] = useState(STATIC_CRAFTS);
  const [skills, setSkills] = useState([]);
  const [query, setQuery] = useState("");
  const [nameQ, setNameQ] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  // Load crafts
  useEffect(() => {
    fetchJson("/api/crafts")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const icons = ["⚡","🪵","🔧","🎨","⬜","🔌","🏗️","🔨"];
          setCrafts(
            data.slice(0, 8).map((c, i) => ({
              ...c,
              icon: c.icon || icons[i] || "🔧",
              description: c.description || "خدمة احترافية موثوقة",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Load skills
  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSkills(data); })
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? skills.filter((s) => s.skill_name?.includes(query))
    : skills;

  const handleSearch = async (overrideQuery) => {
    const q = (overrideQuery || query).trim();
    if (!q) return;
    setShowDrop(false);
    setLoading(true);
    setSearched(true);
    try {
      let url = `/api/search?q=${encodeURIComponent(q)}`;
      if (nameQ.trim()) url += `&name=${encodeURIComponent(nameQ.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.workers || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectSkill = (name) => {
    setQuery(name);
    setShowDrop(false);
    handleSearch(name); // Auto search on select
  };

  return (
    <div className="hp-root" dir="rtl">
      
      {/* ========== HERO SECTION ========== */}
      <section className="hp-hero">
        <div className="hp-hero__overlay"></div>
        <div className="hp-hero__content">
          <span className="hp-hero__badge">المنصة الأولى للحرفيين في فلسطين</span>
          <h1 className="hp-hero__title">صيانتك صارت أسهل مع <span>بناء بال</span></h1>
          <p className="hp-hero__subtitle">
            نوصلك بأمهر الحرفيين والصنايعية الموثوقين بالقرب منك. جودة عالية، سرعة في الإنجاز، وبأسعار تناسبك.
          </p>

          {/* ===== PREMIUM SEARCH BAR ===== */}
          <div className="hp-search-wrapper" ref={dropRef}>
            <div className="hp-search-card">
              
              {/* Main Field: Craft/Skill */}
              <div className="hp-search-field hp-search-field--primary">
                <div className="hp-search-field__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <div className="hp-search-field__input">
                  <label>ما الخدمة التي تبحث عنها؟</label>
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowDrop(true); setSearched(false); }}
                    onFocus={() => setShowDrop(true)}
                    placeholder="مثال: سباك، كهربائي، دهان..."
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    autoComplete="off"
                  />
                </div>
                
                {/* Dropdown Suggestions */}
                {showDrop && filtered.length > 0 && (
                  <div className="hp-dropdown">
                    <div className="hp-dropdown__header">اقتراحات البحث</div>
                    {filtered.slice(0, 6).map((s) => (
                      <button
                        key={s.id || s.skill_name}
                        className="hp-dropdown-item"
                        onClick={() => selectSkill(s.skill_name)}
                      >
                        <span className="hp-dropdown-item__icon">↗</span>
                        {s.skill_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="hp-search-divider"></div>

              {/* Secondary Field: Name (Optional) */}
              <div className="hp-search-field hp-search-field--secondary">
                <div className="hp-search-field__icon hp-search-field__icon--muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div className="hp-search-field__input">
                  <label>اسم الحرفي <span>(اختياري)</span></label>
                  <input
                    value={nameQ}
                    onChange={(e) => setNameQ(e.target.value)}
                    placeholder="إذا كنت تعرف اسمه..."
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>

              {/* Search Button */}
              <button 
                className={`hp-search-btn ${loading ? 'hp-search-btn--loading' : ''}`}
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
              >
                <span>{loading ? "جاري البحث..." : "ابحث الآن"}</span>
              </button>
            </div>

            {/* Quick Chips */}
            <div className="hp-quick-searches">
              <span>عمليات بحث شائعة:</span>
              <div className="hp-chips">
                {QUICK_CHIPS.map((chip) => (
                  <button key={chip} className="hp-chip" onClick={() => selectSkill(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Area */}
            {searched && (
              <div className="hp-results-container">
                {loading ? (
                  <div className="hp-results-state">
                    <div className="hp-spinner"></div>
                    <p>نبحث عن أفضل الحرفيين لك...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="hp-results-state">
                    <span className="hp-state-icon">😕</span>
                    <p>عذراً، لم نتمكن من العثور على حرفيين بهذه المواصفات.</p>
                    <span className="hp-state-hint">جرب استخدام مصطلحات بحث مختلفة أو تصفح الأقسام بالأسفل.</span>
                  </div>
                ) : (
                  <div className="hp-results-list">
                    <div className="hp-results-header">
                      <h3>نتائج البحث</h3>
                      <span>وجدنا {results.length} حرفي</span>
                    </div>
                    {results.map((w) => (
                      <Link to={`/profile/${w.workerProfileId}`} key={w.id} className="hp-result-card">
                        <div className="hp-result-avatar">{w.name?.charAt(0)}</div>
                        <div className="hp-result-info">
                          <h4 className="hp-result-name">{w.name}</h4>
                          <div className="hp-result-meta">
                            <span className="hp-meta-item">📍 {w.location}</span>
                            <span className="hp-meta-item">📞 {w.phone}</span>
                          </div>
                          {w.skills && w.skills.length > 0 && (
                            <div className="hp-result-tags">
                              {w.skills.map((s) => (
                                <span key={s} className="hp-tag">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="hp-result-action">
                          عرض الملف
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== TRUST / FEATURES SECTION ========== */}
      <section className="hp-features">
        <div className="hp-container">
          <div className="hp-features-grid">
            {TRUST_ITEMS.map((item, index) => (
              <div key={index} className="hp-feature-card">
                <div className="hp-feature-icon">{item.icon}</div>
                <h3 className="hp-feature-title">{item.title}</h3>
                <p className="hp-feature-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CRAFTS SECTION ========== */}
      <section className="hp-categories">
        <div className="hp-container">
          <div className="hp-section-header">
            <h2 className="hp-section-title">تصفح حسب <span>الصنعة</span></h2>
            <p className="hp-section-subtitle">اختر من بين مجموعة واسعة من الخدمات الحرفية المتوفرة على منصتنا</p>
          </div>
          
          <div className="hp-categories-grid">
            {crafts.map((craft) => (
              <div key={craft.slug || craft.id} className="hp-category-card" onClick={() => navigate(`/craftsman/${craft.slug}`)}>
                <div className="hp-category-icon-wrapper">
                  <span className="hp-category-icon">{craft.icon}</span>
                </div>
                <div className="hp-category-content">
                  <h3 className="hp-category-name">{craft.name}</h3>
                  <p className="hp-category-desc">{craft.description}</p>
                </div>
                <div className="hp-category-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="hp-cta-section">
        <div className="hp-container">
          <div className="hp-cta-wrapper">
            <div className="hp-cta-content">
              <h2>هل أنت حرفي محترف؟</h2>
              <p>انضم إلى شبكة بناء بال، وسّع نطاق عملك، وزد من دخلك من خلال الوصول إلى مئات العملاء يومياً.</p>
              <ul className="hp-cta-benefits">
                <li>✓ تسجيل مجاني وسريع</li>
                <li>✓ إدارة سهلة لطلباتك</li>
                <li>✓ تسويق احترافي لخدماتك</li>
              </ul>
              <Link to="/login" className="hp-btn-primary">سجل كحرفي الآن</Link>
            </div>
            <div className="hp-cta-image">
              <div className="hp-cta-image-placeholder">
                 <span style={{fontSize: '80px'}}>🛠️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer />

      {/* ========== FLOATING AI ========== */}
      <AIAssistant />

    </div>
  );
}