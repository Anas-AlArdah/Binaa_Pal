import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CraftDetails.css";
import {
  FaBriefcase,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaRegClock,
  FaShieldAlt,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import {
  FiAlertTriangle,
  FiChevronLeft,
  FiFilter,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import Footer from "../../components/Footer";
import { fetchJson, getApiErrorMessage } from "../../utils/api";
import { decorateCraft } from "./craftPresentation";

const ALL_CITIES = "الجميع";
const SORT_OPTIONS = [
  { value: "best", label: "الأفضل في فلسطين", hint: "تقييم + مراجعات" },
  { value: "price", label: "حسب السعر", hint: "الأقل سعراً أولاً" },
  { value: "reviews", label: "معظم التقييمات", hint: "الأكثر طلباً" },
];
const UNKNOWN_CITY_VALUES = new Set([
  "n/a",
  "na",
  "not specified",
  "undefined",
  "null",
  "\u063a\u064a\u0631 \u0645\u062d\u062f\u062f",
  "\u063a\u064a\u0631 \u0645\u062d\u062f\u062f\u0629",
]);

function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function formatRating(value) {
  const rating = normalizeNumber(value);
  return rating > 0 ? rating.toFixed(1) : "جديد";
}

function normalizeCityName(value) {
  const city = String(value || "")
    .split(/,|\u060c/)
    .map((part) => part.trim())
    .filter(Boolean)[0] || "";

  return UNKNOWN_CITY_VALUES.has(city.toLowerCase()) ? "" : city;
}

function normalizeWorker(worker, craft) {
  const skills = Array.isArray(worker.skills) ? worker.skills.filter(Boolean) : [];
  const secondarySkill =
    worker.secondarySkill ||
    skills.find((skill) => skill !== craft.name && skill !== craft.skill_name) ||
    "";
  const city = normalizeCityName(worker.city || worker.location);

  return {
    ...worker,
    id: worker.id,
    profileId: worker.profileId,
    name: worker.name || "عامل مجهول",
    city,
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

function SkeletonCard() {
  return (
    <div className="cd-worker-card cd-worker-card--skeleton" aria-hidden="true">
      <div className="cd-skeleton-head">
        <span className="cd-skeleton-avatar" />
        <div className="cd-skeleton-lines">
          <span />
          <span />
        </div>
      </div>
      <span className="cd-skeleton-block" />
      <span className="cd-skeleton-block short" />
      <span className="cd-skeleton-button" />
    </div>
  );
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
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0].value);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setCraft(fallbackCraft);
    setSelectedCity(ALL_CITIES);
    setSelectedSort(SORT_OPTIONS[0].value);
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
  }, [slug, retryKey, fallbackCraft]);

  const cities = useMemo(() => {
    const cityNames = [...new Set(workers.map((worker) => worker.city).filter(Boolean))];
    return [ALL_CITIES, ...cityNames];
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    let result = [...workers];

    if (selectedCity !== ALL_CITIES) {
      result = result.filter((worker) => worker.city === selectedCity);
    }

    if (selectedSort === "best") {
      result.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    } else if (selectedSort === "price") {
      result.sort((a, b) => a.priceSort - b.priceSort);
    } else if (selectedSort === "reviews") {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount || b.rating - a.rating);
    }

    return result;
  }, [workers, selectedCity, selectedSort]);

  const averageRating = useMemo(() => {
    const ratedWorkers = workers.filter((worker) => worker.rating > 0);
    if (!ratedWorkers.length) return "جديد";

    const total = ratedWorkers.reduce((sum, worker) => sum + worker.rating, 0);
    return (total / ratedWorkers.length).toFixed(1);
  }, [workers]);

  const selectedSortLabel = SORT_OPTIONS.find((option) => option.value === selectedSort)?.label;
  const hasActiveFilters = selectedCity !== ALL_CITIES || selectedSort !== SORT_OPTIONS[0].value;

  const resetFilters = () => {
    setSelectedCity(ALL_CITIES);
    setSelectedSort(SORT_OPTIONS[0].value);
  };

  const openProfile = (worker) => {
    if (worker.profileId) {
      navigate(`/profile/${worker.profileId}`);
    }
  };

  return (
    <div className="cd-page-wrapper" dir="rtl">
      <section className="cd-hero">
        <div className="cd-hero-overlay" />

        <div className="cd-container cd-hero-content">
          <button className="cd-back-btn" type="button" onClick={() => navigate("/craftsman")}>
            <FiChevronLeft />
            <span>العودة للصنعات</span>
          </button>

          <div className="cd-hero-layout">
            <div className="cd-hero-main">
              <div className="cd-hero-icon-wrap">{craft.icon}</div>

              <div className="cd-hero-text">
                <span className="cd-eyebrow">
                  <FaShieldAlt /> نتائج موثوقة حسب التقييم والخبرة
                </span>
                <h1>
                  اختار أفضل حرفيي <span>{craft.name}</span> بثقة
                </h1>
                <p>
                  {craft.description ||
                    "نوصلك بأمهر الصنايعية الموثوقين وأصحاب الخبرة الطويلة في هذا المجال، مع فلاتر تساعدك تختار الأنسب بسرعة."}
                </p>
              </div>
            </div>

            <aside className="cd-hero-panel" aria-label="ملخص النتائج">
              <span className="cd-panel-label">متاح الآن</span>
              <strong>{workers.length}</strong>
              <p>حرفي لهذه الصنعة</p>
              <div className="cd-panel-rating">
                <FaStar />
                <span>{averageRating}</span>
                <small>متوسط التقييم</small>
              </div>
            </aside>
          </div>

          <div className="cd-hero-stats">
            <div className="cd-stat-chip">
              <FaUsers />
              <span>{workers.length} حرفي</span>
            </div>
            <div className="cd-stat-chip">
              <FiMapPin />
              <span>{Math.max(cities.length - 1, 0)} مدينة</span>
            </div>
            <div className="cd-stat-chip">
              <FaCheckCircle />
              <span>بروفايلات قابلة للعرض</span>
            </div>
          </div>
        </div>
      </section>

      <main className="cd-main-section">
        <div className="cd-container">
          <section className="cd-filters-card" aria-label="فلاتر البحث">
            <div className="cd-filters-top">
              <div>
                <span className="cd-section-kicker">فلترة النتائج</span>
                <h2>رتّب الصنايعية بالطريقة المناسبة إلك</h2>
              </div>

              {hasActiveFilters && (
                <button className="cd-reset-btn" type="button" onClick={resetFilters}>
                  <FiRefreshCw /> إعادة التعيين
                </button>
              )}
            </div>

            <div className="cd-filter-group">
              <div className="cd-filter-label">
                <FiFilter className="cd-icon" />
                <span>ترتيب حسب</span>
              </div>

              <div className="cd-filter-options">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`cd-pill-btn ${selectedSort === option.value ? "active" : ""}`}
                    onClick={() => setSelectedSort(option.value)}
                  >
                    <strong>{option.label}</strong>
                    <small>{option.hint}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="cd-filter-group">
              <div className="cd-filter-label">
                <FiMapPin className="cd-icon" />
                <span>تصفية بالمدينة</span>
              </div>

              <div className="cd-filter-options">
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={`cd-pill-btn cd-pill-btn--outline ${selectedCity === city ? "active" : ""}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="cd-results-section" aria-live="polite">
            <div className="cd-results-header">
              <div>
                <span className="cd-section-kicker">النتائج</span>
                <h2>الصنايعية المتاحين ({filteredWorkers.length})</h2>
              </div>

              <div className="cd-active-summary">
                <span>{selectedSortLabel}</span>
                <span>{selectedCity === ALL_CITIES ? "كل المدن" : selectedCity}</span>
              </div>
            </div>

            {loading ? (
              <div className="cd-workers-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="cd-state-box cd-state-error">
                <span className="cd-state-icon"><FiAlertTriangle /></span>
                <h3>صار خطأ أثناء تحميل البيانات</h3>
                <p>{error}</p>
                <button onClick={() => setRetryKey((value) => value + 1)} className="cd-retry-btn" type="button">
                  إعادة المحاولة
                </button>
              </div>
            ) : filteredWorkers.length > 0 ? (
              <div className="cd-workers-grid">
                {filteredWorkers.map((worker, index) => (
                  <article className="cd-worker-card" key={`${worker.id || "worker"}-${worker.profileId || index}`}>
                    <div className="cd-card-topline">
                      <span>{worker.punctualityCount > 0 ? `التزام ${worker.punctualityRating}/5` : "عامل جديد"}</span>
                    </div>

                    <div className="cd-worker-header">
                      <div className="cd-worker-avatar">
                        {worker.imageUrl ? (
                          <img src={worker.imageUrl} alt={worker.name} loading="lazy" />
                        ) : (
                          <span className="cd-avatar-placeholder">{worker.name.charAt(0)}</span>
                        )}
                      </div>

                      <div className="cd-worker-title">
                        <h3>{worker.name}</h3>
                        <span className="cd-badge-primary">{worker.craftName}</span>
                      </div>

                      <div className="cd-worker-rating" aria-label="تقييم العامل">
                        <FaStar className="cd-star-icon" />
                        <span className="cd-rating-val">{formatRating(worker.rating)}</span>
                        <span className="cd-reviews-cnt">{worker.reviewsCount} تقييم</span>
                      </div>
                    </div>

                    <div className="cd-worker-body">
                      <div className="cd-worker-meta-grid">
                        {worker.city && (
                          <div className="cd-info-item">
                            <FaMapMarkerAlt className="cd-info-icon text-gray" />
                            <span>{worker.city}</span>
                          </div>
                        )}
                        <div className="cd-info-item">
                          <FaBriefcase className="cd-info-icon text-gray" />
                          <span>خبرة {worker.experience}</span>
                        </div>
                        <div className="cd-info-item cd-info-item--price">
                          <FaMoneyBillWave className="cd-info-icon text-green" />
                          <span>{worker.price}</span>
                        </div>
                        <div className="cd-info-item">
                          <FaRegClock className="cd-info-icon text-green" />
                          <span>{worker.punctualityCount > 0 ? "ملتزم بالمواعيد" : "بانتظار تقييمات"}</span>
                        </div>
                      </div>

                      {worker.secondarySkill && (
                        <div className="cd-skills-tags">
                          <span className="cd-tag">{worker.secondarySkill}</span>
                        </div>
                      )}
                    </div>

                    <div className="cd-worker-footer">
                      <button
                        className={`cd-btn-profile ${!worker.profileId ? "disabled" : ""}`}
                        onClick={() => openProfile(worker)}
                        type="button"
                        disabled={!worker.profileId}
                      >
                        عرض البروفايل الكامل
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="cd-state-box">
                <span className="cd-state-icon"><FiSearch /></span>
                <h3>لا توجد نتائج مناسبة</h3>
                <p>جرّب تغيير المدينة أو ارجع للترتيب الافتراضي لعرض كل الصنايعية المتاحين.</p>
                <button onClick={resetFilters} className="cd-retry-btn" type="button">
                  إعادة تعيين الفلاتر
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CraftDetails;
