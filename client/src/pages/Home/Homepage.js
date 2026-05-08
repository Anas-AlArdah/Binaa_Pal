import Hero from "../../components/Hero";
import Header from "../../components/Header";
import { decorateCraft } from "../CraftsmanProfile/craftPresentation";
import { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import { fetchJson } from "../../utils/api";

function Homepage() {
    const [count, setCount] = useState(4);
    const [crafts, setCrafts] = useState([]);

    let MIN = 2;
    let MAX = 8;

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setCount(width <= 500 ? 3 : 4);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchJson('/api/crafts')
            .then(data => {
                const decorated = Array.isArray(data) ? data.map(decorateCraft) : [];
                setCrafts(decorated);
            })
            .catch(() => {});
    }, []);

    return (
        <>
            <Header />
            <Hero craft={crafts.slice(0, count)} />
            <div className="d-flex justify-content-center gap-2 mt-3 mb-5">
                <button className="mt-3 btn text-white" style={{ background: 'linear-gradient(to right, #1A6B8A, #1A6B8A)' }}
                        onClick={() => setCount(Math.min(count + 1, MAX))}>
                    عرض المزيد
                </button>
                <button className="mt-3 btn text-white" style={{ background: 'linear-gradient(to right, #1A6B8A, #1A6B8A)' }}
                        onClick={() => setCount(prev => Math.max(count - 1, MIN))}>
                    عرض اقل
                </button>
            </div>
            <Footer />
        </>
    );
}

export default Homepage;