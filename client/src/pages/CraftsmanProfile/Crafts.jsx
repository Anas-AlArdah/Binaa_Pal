import React, { useEffect, useState } from "react";
import "./Crafts.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { fetchJson, getApiErrorMessage } from "../../utils/api";
import { decorateCraft } from "./craftPresentation";

export { defaultCrafts as crafts } from "./craftPresentation";

function Crafts() {
  const navigate = useNavigate();
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadCrafts = async () => {
      try {
        const data = await fetchJson("/api/crafts");
        const rows = Array.isArray(data) ? data : data?.crafts || [];

        if (isMounted) {
          setCrafts(rows.map(decorateCraft));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err));
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

  return (
    <>
      <Header />

      <div className="crafts-page">
        <div className="crafts-container">
          <div className="crafts-header">
            <h1>{"جميع الصنعات"}</h1>
            <p>
              {
                "ابدأ باختيار الصنعة، ثم اطّلع على أفضل الصنايعية المتوفرين فيها"
              }
            </p>
          </div>

          {loading ? (
            <div className="crafts-status">
              {"جاري تحميل الصنعات..."}
            </div>
          ) : error ? (
            <div className="crafts-status error">{error}</div>
          ) : crafts.length > 0 ? (
            <div className="crafts-grid">
              {crafts.map((craft) => (
                <div className="cardBox" key={craft.id} onClick={() => handleCraftClick(craft)}>
                  <div className="card">
                    <div className="craft-preview">
                      <div className="craft-icon">{craft.icon}</div>
                      <div className="h4">{craft.name}</div>
                    </div>

                    <div className="content">
                      <div className="h3">{craft.name}</div>
                      <p>{craft.description}</p>
                      <span className="workers-count">
                        {"متوفر"} {craft.workers}{" "}
                        {"صنايعية"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="crafts-status">
              {"لا توجد صنعات متاحة حالياً."}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Crafts;
