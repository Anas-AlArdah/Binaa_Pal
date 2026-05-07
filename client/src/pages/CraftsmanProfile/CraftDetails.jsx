import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CraftDetails.css";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { fetchJson, getApiErrorMessage } from "../../utils/api";
import { decorateCraft } from "./craftPresentation";

const ALL_CITIES = "\u0627\u0644\u062c\u0645\u064a\u0639";
const SORT_OPTIONS = [
  "\u0627\u0644\u0623\u0641\u0636\u0644 \u0641\u064a \u0641\u0644\u0633\u0637\u064a\u0646",
  "\u062d\u0633\u0628 \u0627\u0644\u0633\u0639\u0631",
  "\u0645\u0639\u0638\u0645 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a",
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
    name: worker.name || "Worker",
    city: worker.city || worker.location || "N/A",
    craftSlug: worker.craftSlug || craft.slug,
    craftName: worker.craftName || craft.name,
    secondarySkill,
    rating: normalizeNumber(worker.rating),
    reviewsCount: normalizeNumber(worker.reviewsCount),
    verifiedCount: normalizeNumber(worker.verifiedCount),
    experience: worker.experience || "N/A",
    price: worker.price || "N/A",
    priceSort: normalizeNumber(worker.priceSort, Number.MAX_SAFE_INTEGER),
    availableNow: worker.availableNow !== false,
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
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    setCraft(fallbackCraft);
    setSelectedCity(ALL_CITIES);
    setAvailableOnly(false);
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
          setError(getApiErrorMessage(err));
          setWorkers([]);
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
  }, [slug]);

  const cities = useMemo(() => {
    const cityNames = [...new Set(workers.map((worker) => worker.city).filter(Boolean))];
    return [ALL_CITIES, ...cityNames];
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    let result = [...workers];

    if (selectedCity !== ALL_CITIES) {
      result = result.filter((worker) => worker.city === selectedCity);
    }

    if (availableOnly) {
      result = result.filter((worker) => worker.availableNow);
    }

    if (selectedSort === SORT_OPTIONS[0]) {
      result.sort((a, b) => b.rating - a.rating || b.verifiedCount - a.verifiedCount);
    } else if (selectedSort === SORT_OPTIONS[1]) {
      result.sort((a, b) => a.priceSort - b.priceSort);
    } else if (selectedSort === SORT_OPTIONS[2]) {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [workers, selectedCity, selectedSort, availableOnly]);

  const openProfile = (worker) => {
    if (worker.profileId) {
      navigate(`/profile/${worker.profileId}`);
    }
  };

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
              {SORT_OPTIONS.map((option) => (
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
                {availableOnly
                  ? "\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0643\u0644"
                  : "\u0627\u0644\u0645\u062a\u0627\u062d \u0627\u0644\u0622\u0646 \u0641\u0642\u0637"}
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
            {loading ? (
              <div className="craft-details-status">
                {"\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0646\u0627\u064a\u0639\u064a\u0629..."}
              </div>
            ) : error ? (
              <div className="craft-details-status error">{error}</div>
            ) : filteredWorkers.length > 0 ? (
              <div className="workers-grid">
                {filteredWorkers.map((worker) => (
                  <div className="profile-card group" key={worker.id}>
                    <div className="avatar-section">
                      <div className="img-container">
                        {worker.imageUrl ? (
                          <img src={worker.imageUrl} alt={worker.name} className="worker-img" />
                        ) : (
                          <div className="worker-img placeholder-img">{worker.name.charAt(0)}</div>
                        )}
                        <div className="bg-shape"></div>
                      </div>
                    </div>

                    <div className="worker-headings">
                      <h3>{worker.name}</h3>
                      <div className="badge-row">
                        <span className="craft-badge">{worker.craftName}</span>
                        <span className={`status-badge ${worker.availableNow ? "available" : "unavailable"}`}>
                          {worker.availableNow
                            ? "\u0645\u062a\u0627\u062d \u0627\u0644\u0622\u0646"
                            : "\u063a\u064a\u0631 \u0645\u062a\u0627\u062d"}
                        </span>
                      </div>
                    </div>

                    <div className="worker-details-list">
                      <ul>
                        <li>
                          <div className="detail-item">
                            <FaStar className="icon-gold" />
                            <span>
                              {worker.rating} <small className="text-gray">({worker.reviewsCount})</small>
                            </span>
                          </div>
                          <div className="detail-item" style={{ marginRight: "auto" }}>
                            <FaShieldAlt className="icon-green" />
                            <span>
                              {worker.verifiedCount}{" "}
                              <small className="text-gray">
                                {"\u0645\u0635\u0627\u062f\u0642\u0629"}
                              </small>
                            </span>
                          </div>
                        </li>

                        <li>
                          <div className="detail-item">
                            <FaMoneyBillWave className="icon-green" />
                            <span>{worker.price}</span>
                          </div>
                          <div className="detail-item" style={{ marginRight: "auto" }}>
                            <FaBriefcase className="icon-gray" />
                            <span>{worker.experience}</span>
                          </div>
                        </li>

                        <li>
                          <div className="detail-item">
                            <FaMapMarkerAlt className="icon-gray" />
                            <span>{worker.city}</span>
                          </div>
                          {worker.secondarySkill && (
                            <div className="detail-item" style={{ marginRight: "auto" }}>
                              <span className="skill-pill secondary">{worker.secondarySkill}</span>
                            </div>
                          )}
                        </li>
                      </ul>
                    </div>

                    <div className="action-button-container">
                      <button className="view-profile-btn" onClick={() => openProfile(worker)}>
                        {"\u0639\u0631\u0636 \u0627\u0644\u0628\u0631\u0648\u0641\u0627\u064a\u0644"}
                      </button>
                    </div>
                    <hr className="bottom-animated-bar" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>
                  {
                    "\u0644\u0627 \u064a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c \u0645\u0637\u0627\u0628\u0642\u0629"
                  }
                </h3>
                <p>
                  {
                    "\u062c\u0631\u0651\u0628 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0641\u0644\u0627\u062a\u0631 \u0623\u0648 \u0627\u062e\u062a\u064a\u0627\u0631 \u0645\u062f\u064a\u0646\u0629 \u0623\u062e\u0631\u0649."
                  }
                </p>
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
