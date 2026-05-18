import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CraftDetails.css";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaRegClock,
  FaStar,
} from "react-icons/fa";
import { FiChevronLeft, FiFilter, FiMapPin } from "react-icons/fi";
import Footer from "../../components/Footer";
import { fetchJson, getApiErrorMessage } from "../../utils/api";
import { decorateCraft } from "./craftPresentation";

const ALL_CITIES = "الجميع";
const SORT_OPTIONS = [
  "الأفضل في فلسطين",
  "حسب السعر",
  "معظم التقييمات",
];

function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeWorker(worker, craft) {
  const skills = Array.isArray(worker.skills) ? worker.skills.filter(Boolean) : [];
  const secondarySkill =
    worker.secondarySkill ||
    skills.find((skill) => skill !== craft.name && skill !== craft.skill_name) ||
    "";

  return {
    ...worker,
    id: worker.id,
    profileId: worker.profileId,
    name: worker.name || "عامل مجهول",
    city: worker.city || worker.location || "غير محدد",
    craftSlug: worker.craftSlug || craft.slug,
    craftName: worker.craftName || craft.name,
    secondarySkill,
    rating: normalizeNumber(worker.rating),
    reviewsCount: normalizeNumber(worker.reviewsCount),
    punctualityRating: normalizeNumber(worker.punctualityRating),
    punctualityCount: normalizeNumber(worker.punctualityCount),
    experience: worker.experience || "غير محدد",
    price: worker.price || "غير محدد",
    priceSort: normalizeNumber(worker.priceSort, Number.MAX_SAFE_INTEGER),
    imageUrl: worker.imageUrl || null,
  };
}

function CraftDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const fallbackCraft = useMemo(() => decorateCraft({ slug }), [slug]);
  const [craft, setCraft] = useState(fallbackCraft);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);

  useEffect(() => {
    setCraft(fallbackCraft);
    setSelectedCity(ALL_CITIES);
    setSelectedSort(SORT_OPTIONS[0]);
  }, [fallbackCraft]);

  useEffect(() => {
    let isMounted = true;
    const encodedSlug = encodeURIComponent(slug || "");

    const loadCraftDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const [craftData, workersData] = await Promise.all([
          fetchJson(`/api/crafts/${encodedSlug}`),
          fetchJson(`/api/crafts/${encodedSlug}/workers`),
        ]);
        const decoratedCraft = decorateCraft(craftData);
        const workerRows = Array.isArray(workersData) ? workersData : workersData?.workers || [];

        if (isMounted) {
          setCraft(decoratedCraft);
          setWorkers(workerRows.map((worker) => normalizeWorker(worker, decoratedCraft)));
        }
      } catch (err) {
        if (isMounted) {
          if (err?.payload?.apiFallback) {
            setCraft(fallbackCraft);
            setWorkers([]);
            setError(null);
          } else {
            setError(getApiErrorMessage(err));
            setWorkers([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCraftDetails();

    return () => {
      isMounted = false;
    };
  }, [slug, fallbackCraft]);

  const cities = useMemo(() => {
    const cityNames = [...new Set(workers.map((worker) => worker.city).filter(Boolean))];
    return [ALL_CITIES, ...cityNames];
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    let result = [...workers];

    if (selectedCity !== ALL_CITIES) {
      result = result.filter((worker) => worker.city === selectedCity);
    }

    if (selectedSort === SORT_OPTIONS[0]) {
      result.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    } else if (selectedSort === SORT_OPTIONS[1]) {
      result.sort((a, b) => a.priceSort - b.priceSort);
    } else if (selectedSort === SORT_OPTIONS[2]) {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [workers, selectedCity, selectedSort]);

  const openProfile = (worker) => {
    if (worker.profileId) {
      navigate(`/profile/${worker.profileId}`);
    }
  };

  return (
    <div className="cd-page-wrapper" dir="rtl">
      {/* 
        NOTE: Header is removed here because AppLayout (in App.js) 
        already renders it. This fixes the double header issue! 
      */}

      {/* HERO SECTION */}
      <div className="cd-hero">
        <div className="cd-hero-overlay"></div>
        <div className="cd-container cd-hero-content">
          <button className="cd-back-btn" onClick={() => navigate('/craftsman')}>
            <FiChevronLeft /> <span>العودة للصنعات</span>
          </button>
          
          <div className="cd-hero-main">
            <div className="cd-hero-icon-wrap">
              {craft.icon}
            </div>
            <div className="cd-hero-text">
              <h1>أفضل حرفيي <span>{craft.name}</span></h1>
              <p>{craft.description || "نوصلك بأمهر الصنايعية الموثوقين وأصحاب الخبرة الطويلة في هذا المجال."}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cd-main-section">
        <div className="cd-container">
          
          {/* FILTERS AREA */}
          <div className="cd-filters-card">
            
            <div className="cd-filter-group">
              <div className="cd-filter-label">
                <FiFilter className="cd-icon" /> ترتيب حسب:
              </div>
              <div className="cd-filter-options">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={`cd-pill-btn ${selectedSort === option ? "active" : ""}`}
                    onClick={() => setSelectedSort(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="cd-filter-group">
              <div className="cd-filter-label">
                <FiMapPin className="cd-icon" /> تصفية بالمدينة:
              </div>
              <div className="cd-filter-options">
                {cities.map((city) => (
                  <button
                    key={city}
                    className={`cd-pill-btn cd-pill-btn--outline ${selectedCity === city ? "active" : ""}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* WORKERS RESULTS */}
          <div className="cd-results-section">
            <div className="cd-results-header">
              <h2>الصنايعية المتاحين ({filteredWorkers.length})</h2>
            </div>

            {loading ? (
              <div className="cd-state-box">
                <div className="cd-spinner"></div>
                <p>جاري البحث عن الحرفيين المناسبين...</p>
              </div>
            ) : error ? (
              <div className="cd-state-box cd-state-error">
                <span className="cd-state-icon">⚠️</span>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="cd-retry-btn">إعادة المحاولة</button>
              </div>
            ) : filteredWorkers.length > 0 ? (
              <div className="cd-workers-grid">
                {filteredWorkers.map((worker) => (
                  <div className="cd-worker-card" key={worker.id}>
                    
                    <div className="cd-worker-header">
                      <div className="cd-worker-avatar">
                        {worker.imageUrl ? (
                          <img src={worker.imageUrl} alt={worker.name} />
                        ) : (
                          <span className="cd-avatar-placeholder">{worker.name.charAt(0)}</span>
                        )}
                        <span className="cd-status-dot"></span>
                      </div>
                      
                      <div className="cd-worker-title">
                        <h3>{worker.name}</h3>
                        <span className="cd-badge-primary">{worker.craftName}</span>
                      </div>
                      
                      <div className="cd-worker-rating">
                        <span className="cd-rating-val">{worker.rating}</span>
                        <FaStar className="cd-star-icon" />
                        <span className="cd-reviews-cnt">({worker.reviewsCount})</span>
                      </div>
                    </div>

                    <div className="cd-worker-body">
                      <div className="cd-info-row">
                        <div className="cd-info-item">
                          <FaMapMarkerAlt className="cd-info-icon text-gray" />
                          <span>{worker.city}</span>
                        </div>
                        <div className="cd-info-item">
                          <FaBriefcase className="cd-info-icon text-gray" />
                          <span>خبرة {worker.experience}</span>
                        </div>
                      </div>

                      <div className="cd-info-row">
                        <div className="cd-info-item">
                          <FaMoneyBillWave className="cd-info-icon text-green" />
                          <span className="font-bold">{worker.price}</span>
                        </div>
                        <div className="cd-info-item">
                          <FaRegClock className="cd-info-icon text-green" />
                          <span>الالتزام: {worker.punctualityCount > 0 ? `${worker.punctualityRating}/5` : "جديد"}</span>
                        </div>
                      </div>

                      {worker.secondarySkill && (
                        <div className="cd-skills-tags">
                          <span className="cd-tag">{worker.secondarySkill}</span>
                        </div>
                      )}
                    </div>

                    <div className="cd-worker-footer">
                      <button className="cd-btn-profile" onClick={() => openProfile(worker)}>
                        عرض البروفايل الكامل
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="cd-state-box">
                <span className="cd-state-icon">😕</span>
                <h3>لا توجد نتائج!</h3>
                <p>لم نتمكن من العثور على صنايعية يطابقون خياراتك الحالية.</p>
                <button onClick={() => { setSelectedCity(ALL_CITIES); setSelectedSort(SORT_OPTIONS[0]); }} className="cd-retry-btn">إعادة تعيين الفلاتر</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CraftDetails;
