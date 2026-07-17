import React, { useEffect, useState } from "react";
import "./Crafts.css";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { fetchJson, getApiErrorMessage } from "../../utils/api";
import { defaultCrafts } from "./craftPresentation";
import { FiAlertTriangle, FiArrowLeft, FiSearch } from "react-icons/fi";

const buildCraftRows = (rows) =>
  rows.map((craft) => ({
    ...craft,
    workersCount: craft.workersCount ?? craft.workers ?? craft.workerCount ?? 0,
  }));

function ScrollRevealCard({ children, onClick, index }) {
  const [ref, setRef] = React.useState(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref); // Only animate once
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <div
      ref={setRef}
      className={`cr-card cr-reveal ${isVisible ? "cr-reveal--visible" : ""}`}
      style={{ transitionDelay: `${(index % 3) * 0.08}s` }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Crafts() {
  const navigate = useNavigate();
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCrafts = async () => {
      try {
        const data = await fetchJson("/api/crafts");
        const rows = Array.isArray(data) ? data : data?.crafts || [];

        if (isMounted) {
          const enhancedCrafts = rows.map(c => ({
            ...c,
            workersCount: c.workersCount ?? c.workers ?? c.workerCount ?? 0
          }));
          setCrafts(enhancedCrafts.length > 0 ? enhancedCrafts : buildCraftRows(defaultCrafts));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          if (err?.payload?.apiFallback) {
            setCrafts(buildCraftRows(defaultCrafts));
            setError(null);
          } else {
            setError(getApiErrorMessage(err));
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCrafts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCraftClick = (craft) => {
    navigate(`/craftsman/${encodeURIComponent(craft.slug || craft.id)}`);
    window.scrollTo(0, 0);
  };

  // فلترة الصنعات حسب البحث السريع
  const filteredCrafts = crafts.filter(craft => 
    craft.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="cr-page-wrapper" dir="rtl">
      
      {/* HEADER SECTION */}
      <div className="cr-hero">
        <div className="cr-container">
          <div className="cr-hero-content">
            <h1 className="cr-title">اختر الصنعة التي تبحث عنها</h1>
            <p className="cr-subtitle">تصفح مجموعة واسعة من الخدمات الحرفية المتوفرة عبر منصتنا وتواصل مع أمهر الصنايعية الموثوقين.</p>
            
            {/* SEARCH INPUT */}
            <div className="cr-search-wrapper">
              <div className="cr-search-box">
                <span className="cr-search-icon">
                  <FiSearch />
                </span>
                <input 
                  type="text" 
                  placeholder="ابحث عن صنعة محددة... (مثال: نجارة، كهرباء)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="cr-main-content">
        <div className="cr-container">
          
          {loading ? (
            <div className="cr-loading-state">
              <div className="cr-spinner"></div>
              <p>جاري تحميل قائمة الصنعات...</p>
            </div>
          ) : error ? (
            <div className="cr-error-state">
              <span className="cr-error-icon"><FiAlertTriangle /></span>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="cr-retry-btn">إعادة المحاولة</button>
            </div>
          ) : filteredCrafts.length > 0 ? (
            <div className="cr-grid">
              {filteredCrafts.map((craft, index) => (
                <ScrollRevealCard key={craft.id} index={index} onClick={() => handleCraftClick(craft)}>
                  <div className="cr-card-top">
                    <div className="cr-workers-badge">
                      <span className="cr-badge-dot"></span>
                      {craft.workersCount ?? 0} حرفي متاح
                    </div>
                  </div>
                  
                  <div className="cr-card-body">
                    <h3 className="cr-card-title">{craft.name}</h3>
                    <p className="cr-card-desc">{craft.description || "استعرض أفضل المتخصصين في هذا المجال والموثوقين لدينا."}</p>
                  </div>

                  <div className="cr-card-footer">
                    <span className="cr-action-text">عرض الحرفيين</span>
                    <span className="cr-action-icon"><FiArrowLeft /></span>
                  </div>
                </ScrollRevealCard>
              ))}
            </div>
          ) : (
            <div className="cr-empty-state">
              <span className="cr-empty-icon"><FiSearch /></span>
              <h3>لم نجد نتائج مطابقة</h3>
              <p>حاول البحث بكلمة أخرى أو تصفح القائمة كاملة.</p>
              <button onClick={() => setSearchQuery("")} className="cr-clear-btn">عرض كل الصنعات</button>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Crafts;
