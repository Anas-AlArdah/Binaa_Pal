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
            <h1>{"\u062c\u0645\u064a\u0639 \u0627\u0644\u0635\u0646\u0639\u0627\u062a"}</h1>
            <p>
              {
                "\u0627\u0628\u062f\u0623 \u0628\u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0635\u0646\u0639\u0629\u060c \u062b\u0645 \u0627\u0637\u0651\u0644\u0639 \u0639\u0644\u0649 \u0623\u0641\u0636\u0644 \u0627\u0644\u0635\u0646\u0627\u064a\u0639\u064a\u0629 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u064a\u0646 \u0641\u064a\u0647\u0627"
              }
            </p>
          </div>

          {loading ? (
            <div className="crafts-status">
              {"\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0646\u0639\u0627\u062a..."}
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
                        {"\u0645\u062a\u0648\u0641\u0631"} {craft.workers}{" "}
                        {"\u0635\u0646\u0627\u064a\u0639\u064a\u0629"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="crafts-status">
              {"\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0646\u0639\u0627\u062a \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b."}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Crafts;
