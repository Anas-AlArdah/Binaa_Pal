import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./CraftDetails.css";
import {
  FaThLarge,
  FaPaintRoller,
  FaBolt,
  FaWrench,
  FaLayerGroup,
  FaHammer,
  FaWindowMaximize,
  FaMapMarkerAlt,
  FaStar,
  FaShieldAlt,
  FaMoneyBillWave,
  FaBriefcase
} from "react-icons/fa";
import { GiBrickWall } from "react-icons/gi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const craftsData = {
  tiling: {
    name: "التبليط",
    description: "تبليط الأرضيات والجدران للحمامات والمطابخ والمساحات الخارجية",
    icon: <FaThLarge color="#3B82F6" />,
  },
  painting: {
    name: "الدهان",
    description: "دهان داخلي وخارجي وتشطيبات وديكورات",
    icon: <FaPaintRoller color="#F97316" />,
  },
  electrical: {
    name: "الكهرباء",
    description: "تمديدات كهربائية، إنارة، لوحات، وتركيبات كهربائية",
    icon: <FaBolt color="#EAB308" />,
  },
  plumbing: {
    name: "السباكة",
    description: "تمديدات مياه، صرف صحي، سخانات، وتركيب الأدوات الصحية",
    icon: <FaWrench color="#06B6D4" />,
  },
  gypsum: {
    name: "الجبس والأسقف",
    description: "أسقف مستعارة، جبس بورد، وديكورات جبسية",
    icon: <FaLayerGroup color="#8B5CF6" />,
  },
  carpentry: {
    name: "النجارة",
    description: "أثاث مخصص، أبواب، مطابخ، وأعمال خشبية",
    icon: <FaHammer color="#A16207" />,
  },
  aluminum: {
    name: "الألمنيوم والحديد",
    description: "شبابيك، أبواب، درابزين، وأعمال معدنية",
    icon: <FaWindowMaximize color="#64748B" />,
  },
  masonry: {
    name: "البناء والحجر",
    description: "أعمال حجر، بناء بلوك، خرسانة، وجدران إنشائية",
    icon: <GiBrickWall color="#DC2626" />,
  },
};

const workersData = [
  {
    id: 1,
    name: "أحمد نصار",
    city: "رام الله",
    craftSlug: "tiling",
    craftName: "تركيب البلاط",
    secondarySkill: "أعمال البناء",
    rating: 4.8,
    reviewsCount: 3,
    verifiedCount: 93,
    experience: "15 سنة خبرة",
    price: "30 - 80 شيكلًا",
    priceSort: 80,
    availableNow: true,
    // imageUrl: "https://images.unsplash.com/photo-... (إذا في صورة من الداتا بيس حطها هون)"
  },
  {
    id: 2,
    name: "ناصر قاسم",
    city: "طولكرم",
    craftSlug: "tiling",
    craftName: "تركيب البلاط",
    secondarySkill: "الرسم",
    rating: 3.6,
    reviewsCount: 1,
    verifiedCount: 66,
    experience: "5 سنوات خبرة",
    price: "25 - 60 شيكلًا",
    priceSort: 60,
    availableNow: false,
  },
  {
    id: 3,
    name: "محمد خالد",
    city: "نابلس",
    craftSlug: "tiling",
    craftName: "تركيب البلاط",
    secondarySkill: "تشطيب داخلي",
    rating: 4.9,
    reviewsCount: 7,
    verifiedCount: 120,
    experience: "12 سنة خبرة",
    price: "35 - 90 شيكلًا",
    priceSort: 90,
    availableNow: true,
  },
  {
    id: 4,
    name: "سامي أبو العز",
    city: "الخليل",
    craftSlug: "tiling",
    craftName: "تركيب البلاط",
    secondarySkill: "ديكورات حجر",
    rating: 4.4,
    reviewsCount: 4,
    verifiedCount: 81,
    experience: "8 سنوات خبرة",
    price: "28 - 70 شيكلًا",
    priceSort: 70,
    availableNow: true,
  },
  {
    id: 5,
    name: "رامي حمدان",
    city: "أريحا",
    craftSlug: "painting",
    craftName: "دهان داخلي",
    secondarySkill: "تشطيبات",
    rating: 4.7,
    reviewsCount: 5,
    verifiedCount: 88,
    experience: "10 سنوات خبرة",
    price: "40 - 75 شيكلًا",
    priceSort: 75,
    availableNow: true,
  },
  {
    id: 6,
    name: "خالد يوسف",
    city: "بيت لحم",
    craftSlug: "electrical",
    craftName: "تمديدات كهربائية",
    secondarySkill: "صيانة كهرباء",
    rating: 4.5,
    reviewsCount: 6,
    verifiedCount: 97,
    experience: "9 سنوات خبرة",
    price: "50 - 100 شيكلًا",
    priceSort: 100,
    availableNow: false,
  },
];

const cities = ["الجميع", "رام الله", "نابلس", "الخليل", "بيت لحم", "جنين", "طولكرم", "أريحا"];
const sortOptions = ["الأفضل في فلسطين", "حسب السعر", "معظم التقييمات"];

function CraftDetails() {
  const { slug } = useParams();

  const craft = craftsData[slug] || {
    name: "الصنعة",
    description: "وصف الصنعة",
    icon: <FaThLarge color="#3B82F6" />,
  };

  const [selectedCity, setSelectedCity] = useState("الجميع");
  const [selectedSort, setSelectedSort] = useState("الأفضل في فلسطين");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filteredWorkers = useMemo(() => {
    let result = workersData.filter((worker) => worker.craftSlug === slug);

    if (selectedCity !== "الجميع") {
      result = result.filter((worker) => worker.city === selectedCity);
    }

    if (availableOnly) {
      result = result.filter((worker) => worker.availableNow);
    }

    if (selectedSort === "الأفضل في فلسطين") {
      result.sort((a, b) => b.rating - a.rating || b.verifiedCount - a.verifiedCount);
    } else if (selectedSort === "حسب السعر") {
      result.sort((a, b) => a.priceSort - b.priceSort);
    } else if (selectedSort === "معظم التقييمات") {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [slug, selectedCity, selectedSort, availableOnly]);

  return (
    <>
      <Header />

      <div className="craft-details-page">
        <div className="craft-details-container">
          <div className="craft-hero">
            <div className="craft-main-icon">{craft.icon}</div>

            <div className="craft-main-text">
              <h1>{craft.name}</h1>
              <p>{craft.description}</p>
            </div>
          </div>

          <div className="top-filters">
            <div className="sort-buttons">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  className={selectedSort === option ? "sort-btn active" : "sort-btn"}
                  onClick={() => setSelectedSort(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="availability-filter">
              <button
                className={availableOnly ? "availability-btn active" : "availability-btn"}
                onClick={() => setAvailableOnly(!availableOnly)}
              >
                {availableOnly ? "إظهار الكل" : "المتاح الآن فقط"}
              </button>
            </div>
          </div>

          <div className="cities-filter">
            {cities.map((city) => (
              <button
                key={city}
                className={selectedCity === city ? "city-btn active" : "city-btn"}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="workers-section">
            {filteredWorkers.length > 0 ? (
              <div className="workers-grid">
                {filteredWorkers.map((worker) => (
                  /* ========================================= */
                  /* الكرت الجديد المأخوذ من Uiverse بعد التعديل */
                  /* ========================================= */
                  <div className="profile-card group" key={worker.id}>
                    {/* قسم الصورة والتأثيرات */}
                    <div className="avatar-section">
                      <div className="img-container">
                        {/* هنا بنفحص إذا في صورة من الداتا بيس، إذا لا بنعرض الحرف الأول */}
                        {worker.imageUrl ? (
                          <img src={worker.imageUrl} alt={worker.name} className="worker-img" />
                        ) : (
                          <div className="worker-img placeholder-img">{worker.name.charAt(0)}</div>
                        )}
                        <div className="bg-shape"></div>
                      </div>
                    </div>

                    {/* الاسم والصنعة والحالة */}
                    <div className="worker-headings">
                      <h3>{worker.name}</h3>
                      <div className="badge-row">
                        <span className="craft-badge">{worker.craftName}</span>
                        <span className={`status-badge ${worker.availableNow ? "available" : "unavailable"}`}>
                          {worker.availableNow ? "متاح الآن" : "غير متاح"}
                        </span>
                      </div>
                    </div>

                    {/* قائمة المعلومات والتفاصيل */}
                    <div className="worker-details-list">
                      <ul>
                        {/* التقييم والمصادقة */}
                        <li>
                          <div className="detail-item">
                            <FaStar className="icon-gold" />
                            <span>{worker.rating} <small className="text-gray">({worker.reviewsCount})</small></span>
                          </div>
                          <div className="detail-item" style={{ marginRight: 'auto' }}>
                            <FaShieldAlt className="icon-green" />
                            <span>{worker.verifiedCount} <small className="text-gray">مصادقة</small></span>
                          </div>
                        </li>

                        {/* السعر والخبرة */}
                        <li>
                          <div className="detail-item">
                            <FaMoneyBillWave className="icon-green" />
                            <span>{worker.price}</span>
                          </div>
                          <div className="detail-item" style={{ marginRight: 'auto' }}>
                            <FaBriefcase className="icon-gray" />
                            <span>{worker.experience}</span>
                          </div>
                        </li>

                        {/* الموقع والمهارة الثانوية */}
                        <li>
                          <div className="detail-item">
                            <FaMapMarkerAlt className="icon-gray" />
                            <span>{worker.city}</span>
                          </div>
                          <div className="detail-item" style={{ marginRight: 'auto' }}>
                            <span className="skill-pill secondary">{worker.secondarySkill}</span>
                          </div>
                        </li>
                      </ul>
                    </div>

                    {/* الزر والخط المتحرك السفلي */}
                    <div className="action-button-container">
                      <button className="view-profile-btn">عرض البروفايل</button>
                    </div>
                    <hr className="bottom-animated-bar" />
                  </div>
                  /* ========================================= */
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>لا يوجد نتائج مطابقة</h3>
                <p>جرّب تغيير الفلاتر أو اختيار مدينة أخرى.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CraftDetails;